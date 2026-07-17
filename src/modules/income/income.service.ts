import prisma from "@/config/prisma";

import { getActiveEvent } from "@/modules/events/event.service";

import { IncomeSource } from "@prisma/client";

import { CreateIncomeDto, UpdateIncomeDto } from "./income.types";

export async function createIncomeRecord(
  data: CreateIncomeDto,
  userId: string
) {
  const event =
    await getActiveEvent();


if (
  data.source === IncomeSource.PARISH_REGISTRATION ||
  data.source === IncomeSource.VENDOR_REGISTRATION
) {
  throw new Error(
    "This income type is generated automatically by the system."
  );
}


  const income =
    await prisma.incomeRecord.create({
      data: {
        eventId: event.id,

        source: data.source,

        payerName: data.payerName,

        amount: data.amount,

        receiptUrl:
          data.receiptUrl,

        remarks:
          data.remarks,

        recordedByUserId:
          userId,
      },
    });

  return {
    success: true,

    data: income,
  };
}


export async function getIncomeRecords() {
  const event = await getActiveEvent();

  const incomes =
    await prisma.incomeRecord.findMany({
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

    data: incomes.map((income) => ({
      id: income.id,

      source: income.source,

      payerName: income.payerName,

      amount: Number(income.amount),

      receiptUrl: income.receiptUrl,

      remarks: income.remarks,

      recordedBy:
        income.recordedBy.admin?.fullName,

      createdAt: income.createdAt,
    })),
  };
}


export async function getIncomeRecordById(
  incomeId: string
) {
  const income =
    await prisma.incomeRecord.findUnique({
      where: {
        id: incomeId,
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
    });

  if (!income) {
    throw new Error(
      "Income record not found."
    );
  }

  return {
    success: true,

    data: {
      id: income.id,

      source: income.source,

      payerName: income.payerName,

      amount: Number(income.amount),

      receiptUrl: income.receiptUrl,

      remarks: income.remarks,

      recordedBy:
        income.recordedBy.admin?.fullName,

      createdAt: income.createdAt,
    },
  };
}


export async function updateIncomeRecord(
  incomeId: string,
  data: UpdateIncomeDto
) {
  const income =
    await prisma.incomeRecord.findUnique({
      where: {
        id: incomeId,
      },
    });

  if (!income) {
    throw new Error(
      "Income record not found."
    );
  }

if (
  income.source === IncomeSource.PARISH_REGISTRATION ||
  income.source === IncomeSource.VENDOR_REGISTRATION
) {
  throw new Error(
    "Automatically generated income records cannot be edited."
  );
}


  const updated =
    await prisma.incomeRecord.update({
      where: {
        id: incomeId,
      },

      data: {
        source: data.source,

        payerName: data.payerName,

        amount: data.amount,

        receiptUrl: data.receiptUrl,

        remarks: data.remarks,
      },
    });

  return {
    success: true,

    data: updated,
  };
}


export async function deleteIncomeRecord(
  incomeId: string
) {
  const income =
    await prisma.incomeRecord.findUnique({
      where: {
        id: incomeId,
      },
    });

  if (!income) {
    throw new Error(
      "Income record not found."
    );
  }


   if (
  income.source === IncomeSource.PARISH_REGISTRATION ||
  income.source === IncomeSource.VENDOR_REGISTRATION
) {
  throw new Error(
    "Automatically generated income records cannot be deleted."
  );
}


  await prisma.incomeRecord.delete({
    where: {
      id: incomeId,
    },
  });

  return {
    success: true,

    message:
      "Income record deleted successfully.",
  };
}



export async function getIncomeStatistics() {
  const event = await getActiveEvent();

  const statistics =
    await prisma.incomeRecord.groupBy({
      by: ["source"],

      where: {
        eventId: event.id,
      },

      _sum: {
        amount: true,
      },
    });

  const getAmount = (
    source: IncomeSource
  ) =>
    Number(
      statistics.find(
        (item) => item.source === source
      )?._sum.amount ?? 0
    );

  const parishIncome = getAmount(
    IncomeSource.PARISH_REGISTRATION
  );

  const vendorIncome = getAmount(
    IncomeSource.VENDOR_REGISTRATION
  );

  const donationIncome = getAmount(
    IncomeSource.DONATION
  );

  const sponsorshipIncome = getAmount(
    IncomeSource.SPONSORSHIP
  );

  const otherIncome = getAmount(
    IncomeSource.OTHER
  );

  const totalIncome =
    parishIncome +
    vendorIncome +
    donationIncome +
    sponsorshipIncome +
    otherIncome;

  return {
    success: true,

    data: {
      totalIncome,

      parishIncome,

      vendorIncome,

      donationIncome,

      sponsorshipIncome,

      otherIncome,
    },
  };
}