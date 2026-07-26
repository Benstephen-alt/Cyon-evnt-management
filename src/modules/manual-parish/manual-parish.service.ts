
import { generateManualRegistrationCode } from "@/shared/services/generateManualRegistrationCode";
import { getActiveEvent } from "../events";
import prisma from "@/config/prisma";
import { CreateManualParishRegistrationDto } from "./manual-parish.types";



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

      totalDelegates: data.totalDelegates,

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
    totalDelegates: number;
  }
) => {
  return prisma.manualParishRegistration.update({
    where: { id },
    data,
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

  return prisma.manualParishRegistration.delete({
    where: { id },
  });
};