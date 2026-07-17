import Decimal from "decimal.js";
import { IncomeSource } from "@prisma/client";
import { CreateVendorDto, UpdateVendorDto } from "./vendor.dto";
import { getActiveEvent } from "../events";
import  prisma  from "@/config/prisma";
import { Prisma, } from "@prisma/client";
import type { Response } from "express";



export async function generateVendorCode() {
  const event = await getActiveEvent();

  const count = await prisma.vendor.count({
    where: {
      eventId: event.id,
    },
  });

  const nextNumber = (count + 1)
    .toString()
    .padStart(6, "0");

  return `VND-${event.year}-${nextNumber}`;
}






export async function createVendor(
  data: CreateVendorDto,
  userId: string
) {
  const event = await getActiveEvent();

  const vendorCode =
    await generateVendorCode();

  const result =
    await prisma.$transaction(
      async (tx) => {
        /*
        |--------------------------------------------------------------------------
        | Create Vendor
        |--------------------------------------------------------------------------
        */

        const vendor =
          await tx.vendor.create({
            data: {
              vendorCode,

              eventId: event.id,

              businessName:
                data.businessName,

              ownerName:
                data.ownerName,

              phoneNumber:
                data.phoneNumber,

              category:
                data.category,

              description:
                data.description,

              amountPaid:
                new Prisma.Decimal(data.amountPaid),

              remarks:
                data.remarks,

              recordedByUserId:
                userId,
            },
          });

        /*
        |--------------------------------------------------------------------------
        | Record Income
        |--------------------------------------------------------------------------
        */

        await tx.incomeRecord.create({
          data: {
            eventId: event.id,

            source:
              IncomeSource.VENDOR_REGISTRATION,

            payerName:
              vendor.businessName,

            amount: new Prisma.Decimal(data.amountPaid),

            remarks: `Vendor Registration (${vendor.vendorCode})`,

            recordedByUserId:
              userId,
          },
        });

        return vendor;
      }
    );

  return {
    success: true,
    message:
      "Vendor registered successfully.",
    data: result,
  };
}


export async function getVendors() {
  const event = await getActiveEvent();

  const vendors = await prisma.vendor.findMany({
    where: {
      eventId: event.id,
    },

    include: {
      recordedBy: {
        include: {
          admin: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,

    data: vendors.map((vendor) => ({
      id: vendor.id,

      vendorCode: vendor.vendorCode,

      businessName: vendor.businessName,

      ownerName: vendor.ownerName,

      phoneNumber: vendor.phoneNumber,

      category: vendor.category,

      description: vendor.description,

      amountPaid: Number(
        vendor.amountPaid
      ),

      remarks: vendor.remarks,

      recordedBy:
        vendor.recordedBy.admin
          ?.fullName ?? "Unknown",

      createdAt: vendor.createdAt,
    })),
  };
}


export async function updateVendor(
  id: string,
  data: UpdateVendorDto
) {
  const vendor = await prisma.vendor.findUnique({
    where: {
      id,
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  const updated = await prisma.$transaction(
    async (tx) => {
      /*
      |--------------------------------------------------------------------------
      | Update Vendor
      |--------------------------------------------------------------------------
      */

      const updatedVendor =
        await tx.vendor.update({
          where: {
            id,
          },

          data: {
            businessName:
              data.businessName,

            ownerName:
              data.ownerName,

            phoneNumber:
              data.phoneNumber,

            category:
              data.category,

            description:
              data.description,

            amountPaid:
              data.amountPaid !== undefined
                ? new Prisma.Decimal(
                    data.amountPaid
                  )
                : undefined,

            remarks:
              data.remarks,
          },
        });

      /*
      |--------------------------------------------------------------------------
      | Update Matching Income Record
      |--------------------------------------------------------------------------
      */

      await tx.incomeRecord.updateMany({
        where: {
          eventId: vendor.eventId,

          source:
            IncomeSource.VENDOR_REGISTRATION,

          remarks: `Vendor Registration (${vendor.vendorCode})`,
        },

        data: {
          payerName:
            updatedVendor.businessName,

          amount:
            data.amountPaid !== undefined
              ? new Prisma.Decimal(
                  data.amountPaid
                )
              : undefined,
        },
      });

      return updatedVendor;
    }
  );

  return {
    success: true,
    message:
      "Vendor updated successfully.",
    data: updated,
  };
}


export async function deleteVendor(id: string) {
  const vendor = await prisma.vendor.findUnique({
    where: {
      id,
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  await prisma.$transaction(async (tx) => {
    /*
    |--------------------------------------------------------------------------
    | Delete Income Record
    |--------------------------------------------------------------------------
    */

    await tx.incomeRecord.deleteMany({
      where: {
        eventId: vendor.eventId,

        source:
          IncomeSource.VENDOR_REGISTRATION,

        remarks: `Vendor Registration (${vendor.vendorCode})`,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | Delete Vendor
    |--------------------------------------------------------------------------
    */

    await tx.vendor.delete({
      where: {
        id,
      },
    });
  });

  return {
    success: true,
    message: "Vendor deleted successfully.",
  };
}


export async function downloadVendorTag(
  id: string,
  res: Response
): Promise<void> { 
  console.log("downloadVendorTag service");
}