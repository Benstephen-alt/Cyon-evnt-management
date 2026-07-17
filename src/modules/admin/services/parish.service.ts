import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services";
import { ParishDetailsResponse } from "../admin.types";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { RegistrationStatus } from "@prisma/client";
import { IncomeSource } from "@prisma/client";
import { generateAccessCode } from "@/shared/utils/accessCode";
import { hashPassword } from "@/shared/utils/password";

export async function getParishes()  {
  const event = await getActiveEvent();

  const parishAccounts = await prisma.parishAccount.findMany({
    where: {
      eventId: event.id,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
     
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return parishAccounts.map((account) => ({
    id: account.parish.id,

    parishId: account.parishId,

    parishName: account.parish.parishName,

    parishCode: account.parish.parishCode,

    accessCode: account.parish.accessCode,

    deaneryName: account.parish.deanery.name,

    registrationStatus: account.registrationStatus,

    isActivated: account.isActivated,

    delegateSubmissionLocked:
      account.delegateSubmissionLocked,

    approvedAt: account.approvedAt,

    createdAt: account.createdAt,
  }));
}


export async function getParishById(
  parishId: string
): Promise<ParishDetailsResponse> {
  const event = await getActiveEvent();

  const account = await prisma.parishAccount.findFirst({
    where: {
      parishId,
      eventId: event.id,
    },
    include: {
  parish: {
    include: {
      deanery: true,
    },
  },
}
  });

  if (!account) {
    throw new Error("Parish registration not found.");
  }

  const delegates = await prisma.delegate.findMany({
  where: {
    parishId,
    eventId: event.id,
  },
  orderBy: {
    fullName: "asc",
  },
});

  const maleDelegates = delegates.filter(
    (delegate) => delegate.gender === "MALE"
  ).length;

  const femaleDelegates = delegates.filter(
    (delegate) => delegate.gender === "FEMALE"
  ).length;

  return {
    id: account.parish.id,

    parishId: account.parishId,

    parishName: account.parish.parishName,

    parishCode: account.parish.parishCode,

    accessCode: account.parish.accessCode,

    deaneryName: account.parish.deanery.name,

    presidentName: account.presidentName,

    presidentPhoneNumber: account.presidentPhoneNumber,

    registrationStatus: account.registrationStatus,

    receiptUrl: account.receiptUrl,

    isActivated: account.isActivated,

    delegateSubmissionLocked:
      account.delegateSubmissionLocked,

    approvedAt: account.approvedAt,

    delegatesRegistered: delegates.length,

    maleDelegates,

    femaleDelegates,

    createdAt: account.createdAt,
  };
}



export async function approveParishRegistrations(
  parishAccountId: string,
  adminId: string
) {
  const account =
    await prisma.parishAccount.findUnique({
      where: {
        id: parishAccountId,
      },
      include: {
        parish: true,
        event: true,
      },
    });

  if (!account) {
    throw new Error(
      "Parish registration not found."
    );
  }

  if (
    account.registrationStatus ===
    RegistrationStatus.APPROVED
  ) {
    throw new Error(
      "Parish registration has already been approved."
    );
  }

  return prisma.$transaction(
    async (tx) => {

      /*
      |--------------------------------------------------------------------------
      | Approve Registration
      |--------------------------------------------------------------------------
      */

      const approvedAccount =
        await tx.parishAccount.update({
          where: {
            id: parishAccountId,
          },
          data: {
            registrationStatus:
              RegistrationStatus.APPROVED,

            isActivated: true,

            delegateSubmissionLocked: false,

            approvedAt: new Date(),
          },
        });

      /*
      |--------------------------------------------------------------------------
      | Record Income
      |--------------------------------------------------------------------------
      */

      await tx.incomeRecord.create({
        data: {
          eventId: account.eventId,

          source:
            IncomeSource.PARISH_REGISTRATION,

          payerName:
            account.parish.parishName,

          amount:
            account.event.registrationFee,

          receiptUrl:
            account.receiptUrl,

          remarks:
            "Parish registration fee",

          recordedByUserId: adminId,
        },
      });

      return approvedAccount;
    }
  );
}

export async function rejectParish(
  parishId: string
) {
  const event = await getActiveEvent();

  const account = await prisma.parishAccount.findFirst({
    where: {
      parishId,
      eventId: event.id,
    },
  });

  if (!account) {
    throw new Error("Parish registration not found.");
  }

  return prisma.parishAccount.update({
    where: {
      id: account.id,
    },
    data: {
      registrationStatus:
        RegistrationStatus.REJECTED,

      delegateSubmissionLocked: true,
    },
  });
}




export async function regenerateAccessCode(
  parishId: string
) {
  const event = await getActiveEvent();

  const account = await prisma.parishAccount.findFirst({
    where: {
      parishId,
      eventId: event.id,
    },
    include: {
      parish: true,
    },
  });

  if (!account) {
    throw new Error("Parish registration not found.");
  }

  const accessCode =
    account.parish.parishCode +
    "-" +
    randomBytes(3)
      .toString("hex")
      .toUpperCase();

  const hash = await bcrypt.hash(accessCode, 10);

  await prisma.$transaction([
    prisma.parish.update({
      where: {
        id: parishId,
      },
      data: {
        accessCode,
      },
    }),

    prisma.parishAccount.update({
      where: {
        id: account.id,
      },
      data: {
        accessCodeHash: hash,
      },
    }),
  ]);

  return {
    parishId,
    parishName: account.parish.parishName,
    accessCode,
  };
}

export async function resetAccessCode(
  parishId: string
) {
  return regenerateAccessCode(parishId);
}

export async function lockDelegateSubmission(
  parishId: string
) {
  const event = await getActiveEvent();

  const account = await prisma.parishAccount.findFirst({
    where: {
      parishId,
      eventId: event.id,
    },
  });

  if (!account) {
    throw new Error("Parish registration not found.");
  }

  return prisma.parishAccount.update({
    where: {
      id: account.id,
    },
    data: {
      delegateSubmissionLocked: true,
    },
  });
}

export async function unlockDelegateSubmission(
  parishId: string
) {
  const event = await getActiveEvent();

  const account = await prisma.parishAccount.findFirst({
    where: {
      parishId,
      eventId: event.id,
    },
  });

  if (!account) {
    throw new Error("Parish registration not found.");
  }

  return prisma.parishAccount.update({
    where: {
      id: account.id,
    },
    data: {
      delegateSubmissionLocked: false,
    },
  });
}


export async function getAllParishesForAdmin() {
  const parishes = await prisma.parish.findMany({
    include: {
      deanery: true,
      delegates: true,
    },
    orderBy: {
      parishName: "asc",
    },
  });

  return parishes.map((parish) => ({
    id: parish.id,
    parishName: parish.parishName,
    parishCode: parish.parishCode,
    deanery: parish.deanery.name,
    registered: parish.delegates.length > 0,
    delegates: parish.delegates.length,
    badges: parish.delegates.length,
  }));
}

export async function getParishDetails(parishId: string) {
  const parish = await prisma.parish.findUnique({
    where: {
      id: parishId,
    },
    include: {
      deanery: true,

      delegates: {
        orderBy: {
          fullName: "asc",
        },
      },

      parishAccounts: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  const account = parish.parishAccounts[0];

  return {
    success: true,

    parish: {
      id: parish.id,
      parishName: parish.parishName,
      parishCode: parish.parishCode,
      deanery: parish.deanery.name,

      registrationPaid: !!account,

      event: account?.event?.eventName ?? null,

      totalDelegates: parish.delegates.length,

      checkedIn: parish.delegates.filter(
        (delegate) => delegate.isCheckedIn
      ).length,

      outstanding:
        parish.delegates.length -
        parish.delegates.filter(
          (delegate) => delegate.isCheckedIn
        ).length,

      delegates: parish.delegates,
    },
  };
}


export async function getPendingRegistrations() {
 console.log("===== GET PENDING REGISTRATIONS CALLED =====");


  const registrations = await prisma.parishAccount.findMany({
  where: {
    presidentName: {
      not: "",
    },
  },
  include: {
    parish: {
      include: {
        deanery: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});
  return {
    success: true,
    registrations: registrations.map((registration) => ({
      id: registration.id,
      parishName: registration.parish.parishName,
      deanery: registration.parish.deanery.name,
      presidentName: registration.presidentName,
      phoneNumber: registration.presidentPhoneNumber,
      receiptUrl: registration.receiptUrl,
      status: registration.registrationStatus,
      createdAt: registration.createdAt,
    })),
  };
}


export async function getParishDashboards() {
  const totalParishes = await prisma.parish.count();

  const registeredParishes = await prisma.parishAccount.count({
    where: {
      registrationStatus: "APPROVED",
    },
  });

  return {
    success: true,
    summary: {
      totalParishes,
      registeredParishes,
    },
  };
}










