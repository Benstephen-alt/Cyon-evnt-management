import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services";
import QRCode from "qrcode";
import sharp from "sharp";
import { generateQrToken } from "@/shared/utils/qr-token";
import * as accommodationService from "@/modules/accommodation/accommodation.service";

export async function getParishArrivalSummary(
  parishId: string
) {
  // Get active event
  const event = await getActiveEvent();

  // Verify parish exists
  const parish = await prisma.parish.findUnique({
    where: {
      id: parishId,
    },
    include: {
      deanery: true,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  // Get delegates
  const delegates = await prisma.delegate.findMany({
    where: {
      parishId,
      eventId: event.id,
    },
    include: {
      accommodation: true,
    },
  });

  const totalDelegates = delegates.length;

  const maleDelegates = delegates.filter(
    (d) => d.gender.toUpperCase() === "MALE"
  ).length;

  const femaleDelegates = delegates.filter(
    (d) => d.gender.toUpperCase() === "FEMALE"
  ).length;

  const accommodatedDelegates = delegates.filter(
    (d) => d.accommodation
  ).length;

  // Arrival record
  const arrival = await prisma.parishArrival.findUnique({
    where: {
      eventId_parishId: {
        eventId: event.id,
        parishId,
      },
    },
    include: {
      checkedInBy: {
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

  return {
    success: true,
    message: "Parish arrival summary retrieved successfully.",
    data: {
      parish: {
        id: parish.id,
        parishName: parish.parishName,
        parishCode: parish.parishCode,
        deanery: parish.deanery.name,
      },

      statistics: {
        totalDelegates,
        maleDelegates,
        femaleDelegates,
        accommodatedDelegates,
      },

      arrival: {
        hasArrived: arrival?.arrived ?? false,
        arrivedAt: arrival?.arrivedAt ?? null,
        checkedInBy:
          arrival?.checkedInBy.admin?.fullName ??
          arrival?.checkedInBy.loginId ??
          arrival?.checkedInBy.email ??
          null,
      },
    },
  };
}

import { NoAvailableBedError } from "@/shared/errors/no-available-bed.error";

export async function markParishArrived(
  parishId: string,
  checkedInByUserId: string
) {
  // Active event
  const event = await getActiveEvent();

  // Verify parish
  const parish = await prisma.parish.findUnique({
    where: {
      id: parishId,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  // Get all delegates
  const delegates = await prisma.delegate.findMany({
    where: {
      parishId,
      eventId: event.id,
    },
  });

  // Check if already arrived
  const existingArrival = await prisma.parishArrival.findUnique({
    where: {
      eventId_parishId: {
        eventId: event.id,
        parishId,
      },
    },
  });

  if (existingArrival?.arrived) {
    throw new Error("Parish has already arrived.");
  }

  // Update or create arrival record
  let arrival;

  if (existingArrival) {
    arrival = await prisma.parishArrival.update({
      where: {
        id: existingArrival.id,
      },
      data: {
        arrived: true,
        arrivedAt: new Date(),
        checkedInByUserId,
      },
    });
  } else {
    arrival = await prisma.parishArrival.create({
      data: {
        eventId: event.id,
        parishId,
        arrived: true,
        arrivedAt: new Date(),
        checkedInByUserId,
      },
    });
  }

  // Automatically allocate accommodation
  const manualAllocation: {
    delegateId: string;
    delegateNumber: string;
    fullName: string;
  }[] = [];

  let automaticallyAllocated = 0;

  for (const delegate of delegates) {
    try {
      await accommodationService.autoAllocateAccommodation(
        delegate.id,
        checkedInByUserId
      );

      automaticallyAllocated++;
    } catch (error) {
      if (error instanceof NoAvailableBedError) {
        manualAllocation.push({
          delegateId: delegate.id,
          delegateNumber: delegate.delegateNumber,
          fullName: delegate.fullName,
        });

        continue;
      }

      throw error;
    }
  }

  // Mark all delegates as checked in
  await prisma.delegate.updateMany({
    where: {
      parishId,
      eventId: event.id,
    },
    data: {
      isCheckedIn: true,
    },
  });

  return {
    success: true,
    message: "Parish arrival confirmed successfully.",

    arrival,

    accommodation: {
      totalDelegates: delegates.length,
      automaticallyAllocated,
      manualAllocationRequired: manualAllocation.length,
      manualAllocation,
    },
  };
}
export async function getArrivedParishes() {
  const event = await getActiveEvent();

  const arrivals = await prisma.parishArrival.findMany({
    where: {
      eventId: event.id,
      arrived: true,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
      checkedInBy: {
        include: {
          admin: true,
        },
      },
    },
    orderBy: {
      arrivedAt: "asc",
    },
  });

  return {
    success: true,
    message: "Arrived parishes retrieved successfully.",
    data: arrivals.map((item) => ({
      id: item.id,

      parishId: item.parish.id,

      parishCode: item.parish.parishCode,

      parishName: item.parish.parishName,

      deanery: item.parish.deanery.name,

      arrivedAt: item.arrivedAt,

      checkedInBy:
        item.checkedInBy.admin?.fullName ??
        item.checkedInBy.loginId ??
        item.checkedInBy.email ??
        "System",
    })),
  };
}

export async function getPendingParishes() {
  const event = await getActiveEvent();

  // Get all parishes participating in the active event
  const parishAccounts = await prisma.parishAccount.findMany({
    where: {
      eventId: event.id,
      isActivated: true,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
    },
  });

  // Get arrived parish IDs
  const arrivals = await prisma.parishArrival.findMany({
    where: {
      eventId: event.id,
      arrived: true,
    },
    select: {
      parishId: true,
    },
  });

  const arrivedParishIds = new Set(
    arrivals.map((item) => item.parishId)
  );

  const pending = parishAccounts.filter(
    (item) => !arrivedParishIds.has(item.parishId)
  );

  return {
    success: true,
    message: "Pending parishes retrieved successfully.",
    data: pending.map((item) => ({
      parishId: item.parish.id,
      parishCode: item.parish.parishCode,
      parishName: item.parish.parishName,
      deanery: item.parish.deanery.name,
    })),
  };
}

export async function getParishArrivalDashboard() {
  const event = await getActiveEvent();

  const totalParishes = await prisma.parishAccount.count({
    where: {
      eventId: event.id,
      isActivated: true,
    },
  });

  const arrivedParishes = await prisma.parishArrival.count({
    where: {
      eventId: event.id,
      arrived: true,
    },
  });

  const pendingParishes = totalParishes - arrivedParishes;

  const totalDelegates = await prisma.delegate.count({
    where: {
      eventId: event.id,
    },
  });

  const accommodatedDelegates = await prisma.accommodation.count();

  const lastArrival = await prisma.parishArrival.findFirst({
    where: {
      eventId: event.id,
      arrived: true,
    },
    include: {
      parish: true,
    },
    orderBy: {
      arrivedAt: "desc",
    },
  });

  return {
    success: true,
    message: "Arrival dashboard retrieved successfully.",
    data: {
      totalParishes,
      arrivedParishes,
      pendingParishes,

      arrivalPercentage:
        totalParishes === 0
          ? 0
          : Number(
              (
                (arrivedParishes / totalParishes) *
                100
              ).toFixed(2)
            ),

      totalDelegates,

      accommodatedDelegates,

      accommodationPercentage:
        totalDelegates === 0
          ? 0
          : Number(
              (
                (accommodatedDelegates /
                  totalDelegates) *
                100
              ).toFixed(2)
            ),

      lastArrival: lastArrival
        ? {
            parishName:
              lastArrival.parish.parishName,
            arrivedAt: lastArrival.arrivedAt,
          }
        : null,
    },
  };
}



export async function generateParishQr(parishId: string) {
  const event = await getActiveEvent();

  const parish = await prisma.parish.findUnique({
    where: {
      id: parishId,
    },
    include: {
      deanery: true,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  const token = generateQrToken({
    type: "PARISH",
    parishId: parish.id,
    eventYear: event.year,
  });

  const verificationUrl =
    `http://localhost:5000/api/parish-arrival/scan/${token}`;

  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    width: 700,
    margin: 1,
  });

  return await sharp(qrBuffer)
    .png()
    .toBuffer();
}