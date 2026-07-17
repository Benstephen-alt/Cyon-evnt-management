import  prisma  from "@/config/prisma";
import { ParishLoginRequest } from "./parish.types";
import { generateToken } from "@/shared/utils/jwt";
import { getActiveEvent } from "@/shared/services/event.service";
import { validateParishAccess } from "@/shared/services/parish-access.service";
import { RegistrationStatus, UserRole } from "@prisma/client";
import path from "path";
import { RegisterParishDto } from "./dto/register-parish.dto";


export async function login(data: ParishLoginRequest) {
  const { accessCode } = data;

  const parish = await prisma.parish.findUnique({
    where: {
      accessCode,
    },
    include: {
      deanery: true,
      parishAccounts: true,
    },
  });

  if (!parish) {
    throw new Error("Invalid access code.");
  }

  const account = parish.parishAccounts[0];

if (!account) {
  throw new Error("Parish account not found.");
}

const token = generateToken({
  userId: account.userId,
  role: "PARISH",
});

  /**
   * Registration has not been submitted.
   * Redirect parish to complete registration.
   */
  if (
    !account.presidentName ||
    account.presidentName.trim() === ""
  ) {
    return {
      success: true,

      token,
      requiresRegistration: true,

      parish: {
        id: parish.id,
        parishName: parish.parishName,
        parishCode: parish.parishCode,
        deaneryName: parish.deanery.name,
      },

      account: {
        id: account.id,
      },
    };
  }

  /**
   * Registration submitted but awaiting approval.
   */
  if (account.registrationStatus === "PENDING") {
    return {
      success: true,
      token,
      awaitingApproval: true,

      parish: {
        id: parish.id,
        parishName: parish.parishName,
        parishCode: parish.parishCode,
        deaneryName: parish.deanery.name,
      },

      account: {
        id: account.id,
        registrationStatus: account.registrationStatus,
      },

      message:
        "Your registration has been submitted and is awaiting administrator approval.",
    };
  }

  /**
   * Registration rejected.
   * Allow parish to return to the registration page and resubmit.
   */
  if (account.registrationStatus === "REJECTED") {
    return {
      success: true,
      token,
      requiresRegistration: true,

      parish: {
        id: parish.id,
        parishName: parish.parishName,
        parishCode: parish.parishCode,
        deaneryName: parish.deanery.name,
      },

      account: {
        id: account.id,
        registrationStatus: account.registrationStatus,
      },

      message:
        "Your registration was rejected. Please update your information and submit again.",
    };
  }

  return {
    success: true,

    token,

    parish: {
      id: parish.id,
      parishName: parish.parishName,
      parishCode: parish.parishCode,
      deaneryName: parish.deanery.name,
    },

    account: {
      id: account.id,
      registrationStatus: account.registrationStatus,
      delegateSubmissionLocked:
        account.delegateSubmissionLocked,
    },
  };
}


export async function getParishDashboard(userId: string) {
  const event = await getActiveEvent();

  const account = await prisma.parishAccount.findUnique({
    where: {
      userId,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
    },
  });

  if (!account) {
    throw new Error("Parish account not found.");
  }

  const delegateCount = await prisma.delegate.count({
    where: {
      parishId: account.parishId,
      eventId: event.id,
    },
  });

  const arrival = await prisma.parishArrival.findUnique({
    where: {
      eventId_parishId: {
        eventId: event.id,
        parishId: account.parishId,
      },
    },
  });

  return {
  parish: {
    id: account.parish.id,
    name: account.parish.parishName,
    deanery: account.parish.deanery.name,
  },

  registration: {
    paymentStatus: account.paymentStatus,
    approved: account.approvedAt !== null,
    approvedAt: account.approvedAt,
    delegateSubmissionLocked: account.delegateSubmissionLocked,
    deadline: event.delegateRegistrationDeadline,
  },

  delegates: {
    submitted: delegateCount,
  },

  statistics: {
    totalDelegates: delegateCount,
    badgesGenerated: delegateCount,
  },

  arrival: {
    arrived: arrival?.arrived ?? false,
    qrUrl: `/api/parish-arrivals/qr/${account.parishId}`,
  },
};
}


export async function getDashboard(userId: string) {
  const { account, event } = await validateParishAccess(userId);

  const registeredDelegates = await prisma.delegate.count({
    where: {
      parishId: account.parishId,
      eventId: event.id,
    },
  });

  const draftDelegates = await prisma.delegateDraft.count({
    where: {
      parishId: account.parishId,
      eventId: event.id,
    },
  });

  const maleDelegates = await prisma.delegate.count({
    where: {
      parishId: account.parishId,
      eventId: event.id,
      gender: "MALE",
    },
  });

  const femaleDelegates = await prisma.delegate.count({
    where: {
      parishId: account.parishId,
      eventId: event.id,
      gender: "FEMALE",
    },
  });

  const now = new Date();

  let countdown = null;

  if (event.delegateRegistrationDeadline) {
    const diff =
      event.delegateRegistrationDeadline.getTime() -
      now.getTime();

    if (diff > 0) {
      countdown = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (diff % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        ),
        minutes: Math.floor(
          (diff % (1000 * 60 * 60)) /
            (1000 * 60)
        ),
      };
    }
  }

  return {
    parish: {
      id: account.parish.id,
      parishName: account.parish.parishName,
      parishCode: account.parish.parishCode,
      deanery: account.parish.deanery.name,
    },

    account: {
      approved: account.registrationStatus,
      activated: account.isActivated,
      delegateSubmissionLocked:
        account.delegateSubmissionLocked,
    },

    event: {
      id: event.id,
      name: event.eventName,
      year: event.year,
      registrationOpen: event.registrationOpen,
      delegateRegistrationDeadline:
        event.delegateRegistrationDeadline,
    },

    statistics: {
      registeredDelegates,
      draftDelegates,
      maleDelegates,
      femaleDelegates,
    },

    countdown,

  };
}


export async function getProfile(userId: string) {
  const account = await prisma.parishAccount.findUnique({
    where: {
      userId,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
    },
  });

  if (!account) {
    throw new Error("Parish account not found.");
  }

  return {
    parish: {
      id: account.parish.id,
      parishName: account.parish.parishName,
      accessCode: account.parish.accessCode,
      deanery: account.parish.deanery.name,
    },

    president: {
      name: account.presidentName,
      phoneNumber: account.presidentPhoneNumber,
    },

    registration: {
      activated: account.isActivated,
      status: account.registrationStatus,
      delegateSubmissionLocked:
        account.delegateSubmissionLocked,
    },
  };
}


export async function updateProfile(
  userId: string,
  data: {
    presidentName: string;
    presidentPhoneNumber: string;
  }
) {
  const account = await prisma.parishAccount.findUnique({
    where: {
      userId,
    },
  });

  if (!account) {
    throw new Error("Parish account not found.");
  }

  return prisma.parishAccount.update({
    where: {
      userId,
    },
    data: {
      presidentName: data.presidentName,
      presidentPhoneNumber: data.presidentPhoneNumber,
    },
  });
}



export async function registerParish(
  userId: string,
  data: RegisterParishDto
) {



  const account =
    await prisma.parishAccount.findUnique({
      where: {
        userId,
      },
    });

  if (!account) {
    throw new Error(
      "Parish account not found."
    );
  }

  if (
    account.registrationStatus ===
    "APPROVED"
  ) {
    throw new Error(
      "This parish has already been approved."
    );
  }

  return prisma.parishAccount.update({
    where: {
      id: account.id,
    },

    data: {
      presidentName:
        data.presidentName,

      presidentPhoneNumber:
        data.presidentPhoneNumber,

      receiptUrl:
        data.receiptUrl,

      paymentStatus: "PENDING",

      registrationStatus:
        "PENDING",
    },
  });
}

export function buildReceiptPath(
  filename: string
) {
  return `/uploads/receipts/${filename}`;
}



export async function checkApprovalStatus(
  parishId: string
) {
  const parish = await prisma.parish.findUnique({
    where: {
      id: parishId,
    },
    include: {
      deanery: true,
      parishAccounts: true,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  const account = parish.parishAccounts[0];

  if (!account) {
    throw new Error("Parish account not found.");
  }

  if (account.registrationStatus !== "APPROVED") {
    return {
      success: true,
      approved: false,
      message:
        "Your registration is still awaiting administrator approval.",
    };
  }

  const token = generateToken({
    userId: account.userId,
    role: "PARISH",
  });

  return {
    success: true,
    approved: true,
    token,

    parish: {
      id: parish.id,
      parishName: parish.parishName,
      parishCode: parish.parishCode,
      deaneryName: parish.deanery.name,
    },

    account: {
      id: account.id,
      registrationStatus: account.registrationStatus,
      delegateSubmissionLocked:
        account.delegateSubmissionLocked,
    },
  };
}


