import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services";
import QRCode from "qrcode";
import sharp from "sharp";
import { generateQrToken } from "@/shared/utils/qr-token";
import * as accommodationService from "@/modules/accommodation/accommodation.service";
import { Gender, Prisma } from "@prisma/client";

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

  const additionalMale = arrival?.additionalMaleDelegates ?? 0;
  const additionalFemale = arrival?.additionalFemaleDelegates ?? 0;
  const totalDelegates = delegates.length + additionalMale + additionalFemale;
  const maleDelegates = delegates.filter((d) => d.gender === Gender.MALE).length + additionalMale;
  const femaleDelegates = delegates.filter((d) => d.gender === Gender.FEMALE).length + additionalFemale;
  const accommodatedDelegates = delegates.filter((d) => d.accommodation).length + additionalMale + additionalFemale;

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
  checkedInByUserId: string,
  additionalMaleDelegates = 0,
  additionalFemaleDelegates = 0
) {
  if (!Number.isInteger(additionalMaleDelegates) || additionalMaleDelegates < 0 || !Number.isInteger(additionalFemaleDelegates) || additionalFemaleDelegates < 0) {
    throw new Error("Additional male and female delegate counts must be whole numbers of zero or more.");
  }
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
    include: { accommodation: true },
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
        additionalMaleDelegates,
        additionalFemaleDelegates,
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
        additionalMaleDelegates,
        additionalFemaleDelegates,
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

  const additionalCount = additionalMaleDelegates + additionalFemaleDelegates;
  let additionalAutomaticallyAllocated = 0;
  const additionalManualAllocation: Array<{ id: string; fullName: string; gender: Gender }> = [];
  if (additionalCount) {
    const additionalResult = await prisma.$transaction(async (tx) => {
      const availableBeds = (gender: Gender, count: number) => tx.bed.findMany({ where: { isOccupied: false, hall: { hostel: { eventId: event.id, gender } } }, orderBy: [{ hall: { hostel: { hostelName: "asc" } } }, { hall: { hallName: "asc" } }, { bedNumber: "asc" }], take: count });
      const [maleBeds, femaleBeds] = await Promise.all([availableBeds(Gender.MALE, additionalMaleDelegates), availableBeds(Gender.FEMALE, additionalFemaleDelegates)]);
      const allocations = [
        ...Array.from({ length: additionalMaleDelegates }, (_, index) => ({ parishArrivalId: arrival.id, bedId: maleBeds[index]?.id ?? null, gender: Gender.MALE, delegatePosition: index + 1, allocatedByUserId: checkedInByUserId })),
        ...Array.from({ length: additionalFemaleDelegates }, (_, index) => ({ parishArrivalId: arrival.id, bedId: femaleBeds[index]?.id ?? null, gender: Gender.FEMALE, delegatePosition: index + 1, allocatedByUserId: checkedInByUserId })),
      ];
      const allocatedBedIds = allocations.flatMap((item) => item.bedId ? [item.bedId] : []);
      if (allocatedBedIds.length) {
        const occupied = await tx.bed.updateMany({ where: { id: { in: allocatedBedIds }, isOccupied: false }, data: { isOccupied: true } });
        if (occupied.count !== allocatedBedIds.length) throw new Error("Some selected beds are no longer available. Please try again.");
      }
      await tx.arrivalExtraDelegate.createMany({ data: allocations });
      return {
        allocated: allocatedBedIds.length,
        unallocated: allocations.filter((item) => !item.bedId).map((item) => ({
          id: `EXTRA-${item.gender === Gender.MALE ? "M" : "F"}-${item.delegatePosition}`,
          fullName: `Unregistered ${item.gender === Gender.MALE ? "Male" : "Female"} Delegate ${item.delegatePosition}`,
          gender: item.gender,
        })),
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    additionalAutomaticallyAllocated = additionalResult.allocated;
    additionalManualAllocation.push(...additionalResult.unallocated);
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

    data: {
      parishName: parish.parishName,
      totalDelegates: delegates.length + additionalCount,
      autoAllocated: automaticallyAllocated + additionalAutomaticallyAllocated,
      manualAllocation: manualAllocation.length + additionalManualAllocation.length,
      manualDelegates: [...manualAllocation.map((delegate) => ({
        id: delegate.delegateId,
        fullName: delegate.fullName,
        gender: delegates.find((item) => item.id === delegate.delegateId)?.gender ?? "",
      })), ...additionalManualAllocation],
      additionalMaleDelegates,
      additionalFemaleDelegates,
    },

    arrival,

    accommodation: {
      totalDelegates: delegates.length + additionalCount,
      automaticallyAllocated: automaticallyAllocated + additionalAutomaticallyAllocated,
      additionalMaleDelegates,
      additionalFemaleDelegates,
      manualAllocationRequired: manualAllocation.length + additionalManualAllocation.length,
      manualAllocation: [...manualAllocation, ...additionalManualAllocation.map((item) => ({ delegateId: item.id, delegateNumber: item.id, fullName: item.fullName }))],
    },
  };
}
export async function getArrivedParishes() {
  const event = await getActiveEvent();

  const [arrivals, manualRegistrations] = await Promise.all([
    prisma.parishArrival.findMany({
      where: { eventId: event.id, arrived: true },
      include: {
        parish: { include: { deanery: true, delegates: { where: { eventId: event.id }, select: { gender: true } } } },
        checkedInBy: { include: { admin: true } },
      },
      orderBy: { arrivedAt: "asc" },
    }),
    prisma.manualParishRegistration.findMany({
      where: {
        eventId: event.id,
        accommodationAllocatedAt: { not: null },
      },
      include: {
        parish: { include: { deanery: true } },
        accommodations: {
          take: 1,
          orderBy: { allocatedAt: "asc" },
          include: { allocatedBy: { include: { admin: true } } },
        },
      },
      orderBy: { accommodationAllocatedAt: "asc" },
    }),
  ]);

  const onlineData = arrivals.map((item) => ({
    id: item.id,
    parishId: item.parish.id,
    parishCode: item.parish.parishCode,
    parishName: item.parish.parishName,
    deanery: item.parish.deanery.name,
    arrivedAt: item.arrivedAt,
    registrationType: "ONLINE" as const,
    totalDelegates: item.parish.delegates.length + item.additionalMaleDelegates + item.additionalFemaleDelegates,
    maleDelegates: item.parish.delegates.filter((delegate) => delegate.gender === Gender.MALE).length + item.additionalMaleDelegates,
    femaleDelegates: item.parish.delegates.filter((delegate) => delegate.gender === Gender.FEMALE).length + item.additionalFemaleDelegates,
    checkedInBy:
      item.checkedInBy.admin?.fullName ??
      item.checkedInBy.loginId ??
      item.checkedInBy.email ??
      "System",
  }));

  const manualData = manualRegistrations.map((item) => {
    const allocator = item.accommodations[0]?.allocatedBy;
    return {
      id: item.id,
      parishId: item.parish.id,
      parishCode: item.parish.parishCode,
      parishName: item.parish.parishName,
      deanery: item.parish.deanery.name,
      arrivedAt: item.accommodationAllocatedAt,
      registrationType: "MANUAL" as const,
      totalDelegates: item.totalDelegates,
      maleDelegates: item.maleDelegates,
      femaleDelegates: item.femaleDelegates,
      checkedInBy:
        allocator?.admin?.fullName ??
        allocator?.loginId ??
        allocator?.email ??
        "System",
    };
  });

  return {
    success: true,
    message: "Arrived parishes retrieved successfully.",
    data: [...onlineData, ...manualData].sort(
      (a, b) =>
        new Date(a.arrivedAt ?? 0).getTime() -
        new Date(b.arrivedAt ?? 0).getTime()
    ),
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

  const [onlineParishes, manualParishes, onlineArrivals, manualArrivals] = await Promise.all([
    prisma.parishAccount.count({ where: { eventId: event.id, isActivated: true, isSuperAdminManaged: false } }),
    prisma.manualParishRegistration.count({ where: { eventId: event.id } }),
    prisma.parishArrival.count({
      where: {
        eventId: event.id,
        arrived: true,
        parish: {
          parishAccounts: {
            some: { eventId: event.id, isSuperAdminManaged: false },
          },
        },
      },
    }),
    prisma.manualParishRegistration.count({
      where: { eventId: event.id, accommodationAllocatedAt: { not: null } },
    }),
  ]);

  const totalParishes = onlineParishes + manualParishes;
  const arrivedParishes = onlineArrivals + manualArrivals;

  const pendingParishes = totalParishes - arrivedParishes;

  const [onlineDelegates, manualTotal, onlineAccommodated, manualAccommodated] = await Promise.all([
    prisma.delegate.count({ where: { eventId: event.id } }),
    prisma.manualParishRegistration.aggregate({
      where: { eventId: event.id },
      _sum: { totalDelegates: true },
    }),
    prisma.accommodation.count({ where: { delegate: { eventId: event.id } } }),
    prisma.manualDelegateAccommodation.count({
      where: { registration: { eventId: event.id } },
    }),
  ]);

  const totalDelegates = onlineDelegates + Number(manualTotal._sum.totalDelegates ?? 0);
  const accommodatedDelegates = onlineAccommodated + manualAccommodated;

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

export async function getArrivedParishAccommodationDetails(
  parishId: string,
  registrationType?: string
) {
  const event = await getActiveEvent();

  const arrival = registrationType?.toUpperCase() === "MANUAL"
    ? null
    : await prisma.parishArrival.findFirst({
    where: {
      eventId: event.id,
      parishId,
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
      additionalDelegates: {
        include: { bed: { include: { hall: { include: { hostel: true } } } } },
        orderBy: [{ gender: "asc" }, { delegatePosition: "asc" }],
      },
    },
      });

  if (!arrival) {
    const manual = await prisma.manualParishRegistration.findFirst({
      where: {
        eventId: event.id,
        parishId,
        accommodationAllocatedAt: { not: null },
      },
      include: {
        parish: { include: { deanery: true } },
        accommodations: {
          include: {
            bed: { include: { hall: { include: { hostel: true } } } },
            allocatedBy: { include: { admin: true } },
          },
          orderBy: [{ gender: "asc" }, { delegatePosition: "asc" }],
        },
      },
    });

    if (!manual) {
      throw new Error("Arrived parish not found.");
    }

    const manualLocations = new Map<
      string,
      { hostelId: string; hostelName: string; hallId: string; hallName: string; delegateCount: number }
    >();

    for (const allocation of manual.accommodations) {
      const { hall } = allocation.bed;
      const key = `${hall.hostel.id}:${hall.id}`;
      const existing = manualLocations.get(key);
      if (existing) existing.delegateCount += 1;
      else manualLocations.set(key, {
        hostelId: hall.hostel.id,
        hostelName: hall.hostel.hostelName,
        hallId: hall.id,
        hallName: hall.hallName,
        delegateCount: 1,
      });
    }

    const allocator = manual.accommodations[0]?.allocatedBy;
    return {
      success: true,
      message: "Manual parish accommodation details retrieved successfully.",
      data: {
        registrationType: "MANUAL" as const,
        parish: {
          id: manual.parish.id,
          parishCode: manual.parish.parishCode,
          parishName: manual.parish.parishName,
          deanery: manual.parish.deanery.name,
        },
        arrival: {
          arrivedAt: manual.accommodationAllocatedAt,
          checkedInBy:
            allocator?.admin?.fullName ??
            allocator?.loginId ??
            allocator?.email ??
            "System",
        },
        statistics: {
          totalDelegates: manual.totalDelegates,
          maleDelegates: manual.maleDelegates,
          femaleDelegates: manual.femaleDelegates,
          accommodatedDelegates: manual.accommodations.length,
          unallocatedDelegates: manual.totalDelegates - manual.accommodations.length,
        },
        locations: [...manualLocations.values()].sort((a, b) =>
          `${a.hostelName}-${a.hallName}`.localeCompare(`${b.hostelName}-${b.hallName}`)
        ),
        delegates: manual.accommodations.map((allocation) => ({
          id: allocation.id,
          delegateNumber: `${allocation.gender === "MALE" ? "M" : "F"}-${allocation.delegatePosition}`,
          fullName: `${allocation.gender === "MALE" ? "Male" : "Female"} Delegate ${allocation.delegatePosition}`,
          gender: allocation.gender,
          phoneNumber: "",
          accommodation: {
            hostel: allocation.bed.hall.hostel.hostelName,
            hall: allocation.bed.hall.hallName,
            bedNumber: allocation.bed.bedNumber,
            allocatedAt: allocation.allocatedAt,
          },
        })),
      },
    };
  }

  const delegates = await prisma.delegate.findMany({
    where: {
      eventId: event.id,
      parishId,
    },
    include: {
      accommodation: {
        include: {
          bed: {
            include: {
              hall: {
                include: {
                  hostel: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const locations = new Map<
    string,
    { hostelId: string; hostelName: string; hallId: string; hallName: string; delegateCount: number }
  >();

  for (const delegate of delegates) {
    const bed = delegate.accommodation?.bed;
    if (!bed) continue;

    const key = `${bed.hall.hostel.id}:${bed.hall.id}`;
    const existing = locations.get(key);
    if (existing) {
      existing.delegateCount += 1;
    } else {
      locations.set(key, {
        hostelId: bed.hall.hostel.id,
        hostelName: bed.hall.hostel.hostelName,
        hallId: bed.hall.id,
        hallName: bed.hall.hallName,
        delegateCount: 1,
      });
    }
  }

  for (const extra of arrival.additionalDelegates) {
    if (!extra.bed) continue;
    const hall = extra.bed.hall;
    const key = `${hall.hostel.id}:${hall.id}`;
    const existing = locations.get(key);
    if (existing) existing.delegateCount += 1;
    else locations.set(key, { hostelId: hall.hostel.id, hostelName: hall.hostel.hostelName, hallId: hall.id, hallName: hall.hallName, delegateCount: 1 });
  }

  const additionalMale = arrival.additionalMaleDelegates;
  const additionalFemale = arrival.additionalFemaleDelegates;

  return {
    success: true,
    message: "Parish accommodation details retrieved successfully.",
    data: {
      registrationType: "ONLINE" as const,
      parish: {
        id: arrival.parish.id,
        parishCode: arrival.parish.parishCode,
        parishName: arrival.parish.parishName,
        deanery: arrival.parish.deanery.name,
      },
      arrival: {
        arrivedAt: arrival.arrivedAt,
        checkedInBy:
          arrival.checkedInBy.admin?.fullName ??
          arrival.checkedInBy.loginId ??
          arrival.checkedInBy.email ??
          "System",
      },
      statistics: {
        totalDelegates: delegates.length + additionalMale + additionalFemale,
        maleDelegates: delegates.filter((delegate) => delegate.gender === "MALE").length + additionalMale,
        femaleDelegates: delegates.filter((delegate) => delegate.gender === "FEMALE").length + additionalFemale,
        accommodatedDelegates: delegates.filter((delegate) => delegate.accommodation).length + arrival.additionalDelegates.filter((extra) => extra.bed).length,
        unallocatedDelegates: delegates.filter((delegate) => !delegate.accommodation).length + arrival.additionalDelegates.filter((extra) => !extra.bed).length,
      },
      locations: [...locations.values()].sort((a, b) =>
        `${a.hostelName}-${a.hallName}`.localeCompare(`${b.hostelName}-${b.hallName}`)
      ),
      delegates: [...delegates.map((delegate) => ({
        id: delegate.id,
        delegateNumber: delegate.delegateNumber,
        fullName: delegate.fullName,
        gender: delegate.gender,
        phoneNumber: delegate.phoneNumber,
        accommodation: delegate.accommodation
          ? {
              hostel: delegate.accommodation.bed.hall.hostel.hostelName,
              hall: delegate.accommodation.bed.hall.hallName,
              bedNumber: delegate.accommodation.bed.bedNumber,
              allocatedAt: delegate.accommodation.allocatedAt,
            }
          : null,
      })), ...arrival.additionalDelegates.map((extra) => ({
        id: extra.id,
        delegateNumber: `EXTRA-${extra.gender === "MALE" ? "M" : "F"}-${extra.delegatePosition}`,
        fullName: `Unregistered ${extra.gender === "MALE" ? "Male" : "Female"} Delegate ${extra.delegatePosition}`,
        gender: extra.gender,
        phoneNumber: "",
        accommodation: extra.bed ? { hostel: extra.bed.hall.hostel.hostelName, hall: extra.bed.hall.hallName, bedNumber: extra.bed.bedNumber, allocatedAt: extra.allocatedAt } : null,
      }))],
    },
  };
}
