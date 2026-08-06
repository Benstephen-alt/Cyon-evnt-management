import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services";
import { AdminDashboardResponse } from "../admin.types";
import { RegistrationStatus } from "@prisma/client";

export async function getDashboard(): Promise<AdminDashboardResponse> {
  const event = await getActiveEvent();

  const [
    totalParishes,
    approvedParishes,
    pendingParishes,
    rejectedParishes,

    totalDelegates,
    maleDelegates,
    femaleDelegates,

    manualRegisteredParishes,
    manualDelegateAggregate,
    manualGenderAggregate,
  ] = await Promise.all([
    prisma.parishAccount.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.parishAccount.count({
      where: {
        eventId: event.id,
        registrationStatus: RegistrationStatus.APPROVED,
      },
    }),

    prisma.parishAccount.count({
      where: {
        eventId: event.id,
        registrationStatus: RegistrationStatus.PENDING,
      },
    }),

    prisma.parishAccount.count({
      where: {
        eventId: event.id,
        registrationStatus: RegistrationStatus.REJECTED,
      },
    }),

    prisma.delegate.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.delegate.count({
      where: {
        eventId: event.id,
        gender: "MALE",
      },
    }),

    prisma.delegate.count({
      where: {
        eventId: event.id,
        gender: "FEMALE",
      },
    }),

    prisma.manualParishRegistration.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.manualParishRegistration.aggregate({
      where: {
        eventId: event.id,
      },
      _sum: {
        totalDelegates: true,
      },
    }),

    prisma.manualParishRegistration.aggregate({
      where: {
        eventId: event.id,
      },
      _sum: {
        maleDelegates: true,
        femaleDelegates: true,
      },
    }),
  ]);

  const arrivedParishes = await prisma.parishArrival.count({
    where: {
      eventId: event.id,
      arrived: true,
    },
  });

  const arrivedDelegates = await prisma.delegate.count({
    where: {
      eventId: event.id,
      isCheckedIn: true,
    },
  });

  const totalBeds = await prisma.bed.count({
    where: {
      hall: {
        hostel: {
          eventId: event.id,
        },
      },
    },
  });

  const occupiedBeds = await prisma.bed.count({
    where: {
      isOccupied: true,
      hall: {
        hostel: {
          eventId: event.id,
        },
      },
    },
  });

  const manualDelegates =
    Number(
      manualDelegateAggregate._sum.totalDelegates ?? 0
    );

  const registeredParishes =
    approvedParishes + manualRegisteredParishes;

  const registeredDelegates =
    totalDelegates + manualDelegates;

  const manualMaleDelegates = Number(
    manualGenderAggregate._sum.maleDelegates ?? 0
  );
  const manualFemaleDelegates = Number(
    manualGenderAggregate._sum.femaleDelegates ?? 0
  );

  return {
    event: {
      id: event.id,
      eventName: event.eventName,
      registrationOpen: event.registrationOpen,
      delegateRegistrationDeadline:
        event.delegateRegistrationDeadline,
    },

    parishes: {
      total: totalParishes,
      approved: registeredParishes,
      pending: pendingParishes,
      rejected: rejectedParishes,

      // Breakdown
      onlineApproved: approvedParishes,
      manualApproved: manualRegisteredParishes,
    },

    delegates: {
      total: registeredDelegates,
      male: maleDelegates + manualMaleDelegates,
      female: femaleDelegates + manualFemaleDelegates,

      // Breakdown
      onlineDelegates: totalDelegates,
      manualDelegates,
    },

    arrivals: {
      arrivedParishes,

      pendingParishes:
        registeredParishes - arrivedParishes,

      arrivedDelegates,

      // Manual delegates don't check in individually yet.
      pendingDelegates:
        totalDelegates - arrivedDelegates,
    },

    accommodation: {
      totalBeds,
      occupiedBeds,
      availableBeds:
        totalBeds - occupiedBeds,
    },
  };
}
