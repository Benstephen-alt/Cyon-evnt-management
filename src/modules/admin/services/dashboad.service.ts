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
  ] = await Promise.all([
    prisma.parishAccount.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.parishAccount.count({
      where: {
        eventId: event.id,
       registrationStatus: RegistrationStatus.APPROVED
      },
    }),

    prisma.parishAccount.count({
      where: {
        eventId: event.id,
       registrationStatus: RegistrationStatus.PENDING
      },
    }),

    prisma.parishAccount.count({
      where: {
        eventId: event.id,
       registrationStatus: RegistrationStatus.REJECTED
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
    approved: approvedParishes,
    pending: pendingParishes,
    rejected: rejectedParishes,
  },

  delegates: {
    total: totalDelegates,
    male: maleDelegates,
    female: femaleDelegates,
  },

  arrivals: {
    arrivedParishes,
    pendingParishes: totalParishes - arrivedParishes,
    arrivedDelegates,
    pendingDelegates:
      totalDelegates - arrivedDelegates,
  },

  accommodation: {
    totalBeds,
    occupiedBeds,
    availableBeds: totalBeds - occupiedBeds,
  },
};
}