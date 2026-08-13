
import { generateManualRegistrationCode } from "@/shared/services/generateManualRegistrationCode";
import { getActiveEvent } from "../events";
import prisma from "@/config/prisma";
import { CreateManualParishRegistrationDto } from "./manual-parish.types";
import { Gender, Prisma } from "@prisma/client";



export const searchParishes = async (query: string) => {
  const activeEvent = await getActiveEvent();

  const parishes = await prisma.parish.findMany({
    where: {
      parishName: {
        contains: query,
        mode: "insensitive",
      },
      manualRegistrations: {
        none: {
          eventId: activeEvent.id,
        },
      },
    },
    include: {
      deanery: true,
    },
    orderBy: {
      parishName: "asc",
    },
    take: 20,
  });

  return parishes.map((parish) => ({
  id: parish.id,
  parishName: parish.parishName,
  parishCode: parish.parishCode,
  deaneryName: parish.deanery.name,
}));
};



export const registerManualParish = async (
  data: CreateManualParishRegistrationDto,
  adminId: string
) => {
  const activeEvent = await getActiveEvent();

  const parish = await prisma.parish.findUnique({
    where: {
      id: data.parishId,
    },
    include: {
      deanery: true,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  const existing = await prisma.manualParishRegistration.findFirst({
    where: {
      parishId: parish.id,
      eventId: activeEvent.id,
    },
  });

  if (existing) {
    throw new Error("This parish has already been registered.");
  }

  if (
    !Number.isInteger(data.maleDelegates) ||
    !Number.isInteger(data.femaleDelegates) ||
    data.maleDelegates < 0 ||
    data.femaleDelegates < 0 ||
    data.maleDelegates + data.femaleDelegates < 1
  ) {
    throw new Error("Enter valid male and female delegate totals.");
  }

  const registrationCode =
    await generateManualRegistrationCode(activeEvent.year);

  return prisma.manualParishRegistration.create({
    data: {
      registrationCode,

      eventId: activeEvent.id,

      parishId: parish.id,
      deaneryId: parish.deaneryId,

      presidentName: data.presidentName,
      presidentPhone: data.presidentPhone,

      maleDelegates: data.maleDelegates,
      femaleDelegates: data.femaleDelegates,
      totalDelegates: data.maleDelegates + data.femaleDelegates,

      delegatesOutside: 0,

      amountPaid: 15000,

      createdByUserId: adminId,
    },

    include: {
      parish: true,
      deanery: true,
    },
  });
};


export const getManualRegistrations = async () => {
  const activeEvent = await getActiveEvent();

  const registrations =
    await prisma.manualParishRegistration.findMany({
      where: {
        eventId: activeEvent.id,
      },
      include: {
        parish: true,
        deanery: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const summary = {
    totalRegistrations: registrations.length,

    totalDelegates: registrations.reduce(
      (sum, item) => sum + item.totalDelegates,
      0
    ),

    totalIncome: registrations.reduce(
      (sum, item) => sum + Number(item.amountPaid),
      0
    ),
  };

  return {
    registrations,
    summary,
  };
};


export const updateManualRegistration = async (
  id: string,
  data: {
    presidentName: string;
    presidentPhone: string;
    maleDelegates: number;
    femaleDelegates: number;
  }
) => {
  if (
    !Number.isInteger(data.maleDelegates) ||
    !Number.isInteger(data.femaleDelegates) ||
    data.maleDelegates < 0 ||
    data.femaleDelegates < 0 ||
    data.maleDelegates + data.femaleDelegates < 1
  ) {
    throw new Error("Enter valid male and female delegate totals.");
  }

  const registration = await prisma.manualParishRegistration.findUnique({
    where: { id },
  });

  if (!registration) {
    throw new Error("Manual registration not found.");
  }

  if (
    registration.accommodationAllocatedAt &&
    (registration.maleDelegates !== data.maleDelegates ||
      registration.femaleDelegates !== data.femaleDelegates)
  ) {
    throw new Error(
      "Delegate gender totals cannot be changed after accommodation has been allocated."
    );
  }

  return prisma.manualParishRegistration.update({
    where: { id },
    data: {
      ...data,
      totalDelegates: data.maleDelegates + data.femaleDelegates,
    },
  });
};


export const getManualRegistrationById = async (id: string) => {
  return prisma.manualParishRegistration.findUnique({
    where: { id },
    include: {
      parish: true,
      deanery: true,
    },
  });
};


export const deleteManualRegistration = async (id: string) => {
  const registration =
    await prisma.manualParishRegistration.findUnique({
      where: { id },
    });

  if (!registration) {
    throw new Error("Manual registration not found.");
  }

  return prisma.$transaction(async (tx) => {
    const allocations = await tx.manualDelegateAccommodation.findMany({
      where: { registrationId: id },
      select: { bedId: true },
    });

    if (allocations.length > 0) {
      await tx.bed.updateMany({
        where: { id: { in: allocations.map((item) => item.bedId) } },
        data: { isOccupied: false },
      });
    }

    return tx.manualParishRegistration.delete({
      where: { id },
    });
  });
};

async function getAvailableBeds(
  tx: Prisma.TransactionClient,
  eventId: string,
  gender: Gender,
  count: number
) {
  if (count === 0) return [];

  return tx.bed.findMany({
    where: {
      isOccupied: false,
      accommodation: null,
      manualAccommodation: null,
      hall: {
        hostel: {
          eventId,
          gender,
        },
      },
    },
    include: {
      hall: {
        include: {
          hostel: true,
        },
      },
    },
    orderBy: [
      { hall: { hostel: { hostelName: "asc" } } },
      { hall: { hallName: "asc" } },
      { bedNumber: "asc" },
    ],
    take: count,
  });
}

export const allocateManualParishAccommodation = async (
  id: string,
  allocatedByUserId: string
) => {
  const activeEvent = await getActiveEvent();

  return prisma.$transaction(
    async (tx) => {
      const registration = await tx.manualParishRegistration.findFirst({
        where: { id, eventId: activeEvent.id },
        include: { parish: true },
      });

      if (!registration) {
        throw new Error("Manual registration not found.");
      }

      if (registration.accommodationAllocatedAt) {
        throw new Error("Accommodation has already been allocated for this parish.");
      }

      if (
        registration.maleDelegates + registration.femaleDelegates < 1 ||
        registration.maleDelegates + registration.femaleDelegates !==
          registration.totalDelegates
      ) {
        throw new Error(
          "Update this registration with its male and female delegate totals before allocating accommodation."
        );
      }

      const [maleBeds, femaleBeds] = await Promise.all([
        getAvailableBeds(tx, activeEvent.id, Gender.MALE, registration.maleDelegates),
        getAvailableBeds(tx, activeEvent.id, Gender.FEMALE, registration.femaleDelegates),
      ]);

      const allocations = [
        ...maleBeds.map((bed, index) => ({
          registrationId: registration.id,
          bedId: bed.id,
          gender: Gender.MALE,
          delegatePosition: index + 1,
          allocatedByUserId,
        })),
        ...femaleBeds.map((bed, index) => ({
          registrationId: registration.id,
          bedId: bed.id,
          gender: Gender.FEMALE,
          delegatePosition: index + 1,
          allocatedByUserId,
        })),
      ];

      const bedIds = allocations.map((item) => item.bedId);
      const updated = await tx.bed.updateMany({
        where: { id: { in: bedIds }, isOccupied: false },
        data: { isOccupied: true },
      });

      if (updated.count !== bedIds.length) {
        throw new Error("Some selected beds are no longer available. Please try again.");
      }

      await tx.manualDelegateAccommodation.createMany({ data: allocations });
      await tx.manualParishRegistration.update({
        where: { id: registration.id },
        data: { accommodationAllocatedAt: new Date() },
      });

      return {
        registrationId: registration.id,
        parishName: registration.parish.parishName,
        totalDelegates: registration.totalDelegates,
        maleDelegates: registration.maleDelegates,
        femaleDelegates: registration.femaleDelegates,
        allocatedBeds: allocations.length,
        manualAllocationRequired: registration.totalDelegates - allocations.length,
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
};
