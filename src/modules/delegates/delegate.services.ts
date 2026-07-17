import prisma from "@/config/prisma";

import {
  CreateDelegateDto,
  UpdateDelegateDto,
} from "./delegate.types";

import {
  generateDelegateNumber,
  getActiveEvent,
} from "@/shared/services"

import { Prisma, } from "@prisma/client";
import { validateParishAccess } from "@/shared/services/parish-access.service";

type ParishAccountWithRelations = Prisma.ParishAccountGetPayload<{
  include: {
    parish: {
      include: {
        deanery: true;
      };
    };
  
  };
}>;




export async function createDelegate(
  data: CreateDelegateDto,
  userId: string,
  tx: Prisma.TransactionClient = prisma
) {
  const { account, event } = await validateParishAccess(userId, {
    requireUnlockedSubmission: true,
  });

  const duplicate = await tx.delegate.findFirst({
    where: {
      phoneNumber: data.phoneNumber,
      eventId: event.id,
    },
  });

  if (duplicate) {
    throw new Error(
      "Phone number already belongs to another delegate."
    );
  }

  const delegateNumber = await generateDelegateNumber();

  const delegate = await tx.delegate.create({
    data: {
      delegateNumber,

      fullName: data.fullName,

      gender: data.gender,

      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null,

      age: data.age ? Number(data.age) : null,

      phoneNumber: data.phoneNumber,

      photoUrl: data.photoUrl,

      eventId: event.id,

      parishId: account.parishId,

      parishName: account.parish.parishName,

      deaneryId: account.parish.deanery.id,

      deaneryName: account.parish.deanery.name,
    },
  });

  return delegate;
}
export async function getDelegates(userId: string) {
  const parishAccount = await prisma.parishAccount.findFirst({
    where: {
      userId,
      isActivated: true,
    },
  });

  if (!parishAccount) {
    throw new Error("Parish account not found.");
  }

  const delegates = await prisma.delegate.findMany({
    where: {
      parishId: parishAccount.parishId,
      eventId: parishAccount.eventId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    total: delegates.length,
    delegates,
  };
}

export async function getDelegateById(
  delegateId: string,
  userId: string
) {
  // Find parish account
  const parishAccount = await prisma.parishAccount.findFirst({
    where: {
      userId,
      isActivated: true,
    },
  });

  if (!parishAccount) {
    throw new Error("Parish account not found.");
  }

  // Find delegate
  const delegate = await prisma.delegate.findFirst({
    where: {
      id: delegateId,
      parishId: parishAccount.parishId,
      eventId: parishAccount.eventId,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  return {
    success: true,
    delegate,
  };
}


export async function updateDelegate(
  delegateId: string,
  data: UpdateDelegateDto,
  userId: string
) {
  // Find parish account
  const parishAccount = await prisma.parishAccount.findFirst({
    where: {
      userId,
      isActivated: true,
    },
  });

  if (!parishAccount) {
    throw new Error("Parish account not found.");
  }

  // Ensure delegate belongs to this parish
  const existingDelegate = await prisma.delegate.findFirst({
    where: {
      id: delegateId,
      parishId: parishAccount.parishId,
      eventId: parishAccount.eventId,
    },
  });

  if (!existingDelegate) {
    throw new Error("Delegate not found.");
  }

  if (existingDelegate.isCheckedIn) {
    throw new Error(
        "Checked-in delegates cannot be modified."
    );
  }

  const event = await getActiveEvent();

if (!event.registrationOpen) {
    throw new Error(
        "Registration has closed."
    );
}

  const delegate = await prisma.delegate.update({
    where: {
      id: delegateId,
    },
    data: {
      fullName: data.fullName,

      gender: data.gender,

      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : existingDelegate.dateOfBirth,

      age: data.age,

      phoneNumber: data.phoneNumber,

      photoUrl: data.photoUrl,
    },
  });

  return {
    success: true,
    message: "Delegate updated successfully.",
    delegate,
  };
}


export async function deleteDelegate(
  delegateId: string,
  userId: string
) {
  // Find parish account
  const parishAccount = await prisma.parishAccount.findFirst({
    where: {
      userId,
      isActivated: true,
    },
  });

  if (!parishAccount) {
    throw new Error("Parish account not found.");
  }


  // Ensure delegate belongs to this parish
  const delegate = await prisma.delegate.findFirst({
    where: {
      id: delegateId,
      parishId: parishAccount.parishId,
      eventId: parishAccount.eventId,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  if (delegate.isCheckedIn) {
    throw new Error(
        "Checked-in delegates cannot be deleted."
    );
}

  await prisma.delegate.delete({
    where: {
      id: delegateId,
    },
  });

  return {
    success: true,
    message: "Delegate deleted successfully.",
  };
}


export async function getDelegateDetails(delegateId: string) {
  const delegate = await prisma.delegate.findUnique({
    where: {
      id: delegateId,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
      event: true,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  return {
    success: true,

    delegate: {
      id: delegate.id,
      delegateNumber: delegate.delegateNumber,
      fullName: delegate.fullName,
      gender: delegate.gender,
      phoneNumber: delegate.phoneNumber,
      age: delegate.age,
      photoUrl: delegate.photoUrl,
      qrCode: delegate.qrCode,
      isCheckedIn: delegate.isCheckedIn,

      parishName: delegate.parish.parishName,
      parishCode: delegate.parish.parishCode,
      deaneryName: delegate.parish.deanery.name,

      eventName: delegate.event.eventName,
      eventTheme: delegate.event.theme,
      eventYear: delegate.event.year,

      createdAt: delegate.createdAt,
    },
  };
}

export async function getDelegate(
  delegateId: string,
  userId: string
) {

  const { account } =
    await validateParishAccess(userId);

  const delegate =
    await prisma.delegate.findFirst({
      where: {
        id: delegateId,
        parishId: account.parishId,
      },
    });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  return {
    id: delegate.id,

    delegateNumber:
      delegate.delegateNumber,

    fullName:
      delegate.fullName,

    parishName:
      delegate.parishName,

    deaneryName:
      delegate.deaneryName,

    gender:
      delegate.gender,

    age:
      delegate.age,

    phoneNumber:
      delegate.phoneNumber,

    photoUrl:
      delegate.photoUrl,

    checkedIn:
      delegate.isCheckedIn,

    createdAt:
      delegate.createdAt,
  };
}


export async function getParishDelegates(
  userId: string,
  search?: string
) {
  const { account, event } = await validateParishAccess(userId, {
    requireUnlockedSubmission: false,
  });

  const delegates = await prisma.delegate.findMany({
    where: {
      parishId: account.parishId,
      eventId: event.id,

      ...(search 
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                delegateNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      delegateNumber: true,
      fullName: true,
      gender: true,
      age: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    delegates,
  };
}


