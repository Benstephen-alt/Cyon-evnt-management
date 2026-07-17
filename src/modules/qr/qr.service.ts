import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services";
import { generateQrToken } from "@/shared/utils/jwt";
import QRCode from "qrcode";
import { verifyQrToken } from "@/shared/utils/jwt";
import * as parishArrivalService from "@/modules/parish-arrival/parish-arrival.service";

export async function generateParishQr(
  parishId: string
) {
  const event = await getActiveEvent();

  const parish = await prisma.parish.findUnique({
    where: {
      id: parishId,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  const payload = {
    type: "PARISH",
    parishCode: parish.parishCode,
    eventYear: event.year,
    issuedAt: Date.now(),
  };

  const token = generateQrToken(payload);

  return {
    success: true,
    message: "Parish QR token generated successfully.",
    data: {
      parishId: parish.id,
      parishName: parish.parishName,
      parishCode: parish.parishCode,
      qrToken: token,
    },
  };
}

export async function generateParishQrImage(
  parishId: string
) {
  const qr = await generateParishQr(parishId);

  const qrImage = await QRCode.toDataURL(
    qr.data.qrToken,
    {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 500,
    }
  );

  return {
    success: true,
    message: "Parish QR image generated successfully.",
    data: {
      ...qr.data,
      qrImage,
    },
  };
}



export async function scanParishQr(
  token: string
) {
  const payload = verifyQrToken(token) as {
    type: string;
    parishCode: string;
    eventYear: number;
  };

  if (payload.type !== "PARISH") {
    throw new Error("Invalid parish QR code.");
  }

  const parish = await prisma.parish.findUnique({
    where: {
      parishCode: payload.parishCode,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  const event = await getActiveEvent();

if (payload.eventYear !== event.year) {
  throw new Error("QR code belongs to a different event.");
}

  return parishArrivalService.getParishArrivalSummary(
    parish.id
  );
}

export async function confirmParishArrival(
  token: string,
  checkedInByUserId: string
) {
  const payload = verifyQrToken(token) as {
    type: string;
    parishCode: string;
    eventYear: number;
  };

  if (payload.type !== "PARISH") {
    throw new Error("Invalid parish QR code.");
  }

  const parish = await prisma.parish.findUnique({
    where: {
      parishCode: payload.parishCode,
    },
  });

  if (!parish) {
    throw new Error("Parish not found.");
  }

  return parishArrivalService.markParishArrived(
    parish.id,
    checkedInByUserId
  );
}

export async function generateDelegateQr(
  delegateId: string
) {
  const event = await getActiveEvent();

  const delegate = await prisma.delegate.findUnique({
    where: {
      id: delegateId,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  const payload = {
    type: "DELEGATE",
    delegateNumber: delegate.delegateNumber,
    eventYear: event.year,
    issuedAt: Date.now(),
  };

  const token = generateQrToken(payload);

  return {
    success: true,
    message: "Delegate QR token generated successfully.",
    data: {
      delegateId: delegate.id,
      delegateNumber: delegate.delegateNumber,
      fullName: delegate.fullName,
      qrToken: token,
    },
  };
}

export async function generateDelegateQrImage(
  delegateId: string
) {
  const qr = await generateDelegateQr(delegateId);

  const qrImage = await QRCode.toDataURL(
    qr.data.qrToken,
    {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 500,
    }
  );

  return {
    success: true,
    message: "Delegate QR image generated successfully.",
    data: {
      ...qr.data,
      qrImage,
    },
  };
}

export async function scanDelegateQr(
  token: string
) {
  const payload = verifyQrToken(token) as {
    type: string;
    delegateNumber: string;
    eventYear: number;
  };

  if (payload.type !== "DELEGATE") {
    throw new Error("Invalid delegate QR code.");
  }

  const event = await getActiveEvent();

if (payload.eventYear !== event.year) {
  throw new Error("QR code belongs to a different event.");
}


  const delegate = await prisma.delegate.findUnique({
    where: {
      delegateNumber: payload.delegateNumber,
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
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  
  const parishArrival = await prisma.parishArrival.findFirst({
    where: {
      eventId: delegate.eventId,
      parishId: delegate.parishId,
      arrived: true,
    },
  });

  return {
    success: true,
    message: "Delegate verified successfully.",

    data: {
      delegate: {
        id: delegate.id,
        delegateNumber: delegate.delegateNumber,
        fullName: delegate.fullName,
        gender: delegate.gender,
        phoneNumber: delegate.phoneNumber,
        parish: delegate.parishName,
        deanery: delegate.deaneryName,
      },

      accommodation: delegate.accommodation
        ? {
            hostel:
              delegate.accommodation.bed.hall.hostel.hostelName,
            hall:
              delegate.accommodation.bed.hall.hallName,
            bedNumber:
              delegate.accommodation.bed.bedNumber,
          }
        : null,

      status: {
        registered: true,

        accommodated:
          delegate.accommodation !== null,

        parishArrived:
          parishArrival !== null,

        checkedIn:
          delegate.isCheckedIn,

        eligibleForCheckIn:
          delegate.accommodation !== null &&
          parishArrival !== null &&
          !delegate.isCheckedIn,
      },
    },
  };
}

export async function checkInDelegate(
  token: string,
  checkedInByUserId: string
) {
  const payload = verifyQrToken(token) as {
    type: string;
    delegateNumber: string;
    eventYear: number;
  };

  if (payload.type !== "DELEGATE") {
    throw new Error("Invalid delegate QR code.");
  }

  const event = await getActiveEvent();

if (payload.eventYear !== event.year) {
  throw new Error("QR code belongs to a different event.");
}


  const delegate = await prisma.delegate.findUnique({
    where: {
      delegateNumber: payload.delegateNumber,
    },
    include: {
      accommodation: true,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  if (!delegate.accommodation) {
    throw new Error("Delegate has not been allocated accommodation.");
  }

  const parishArrival = await prisma.parishArrival.findFirst({
    where: {
      eventId: delegate.eventId,
      parishId: delegate.parishId,
      arrived: true,
    },
  });

  if (!parishArrival) {
    throw new Error("Delegate's parish has not arrived.");
  }

  if (delegate.isCheckedIn) {
    throw new Error("Delegate has already been checked in.");
  }

  const updatedDelegate = await prisma.delegate.update({
    where: {
      id: delegate.id,
    },
    data: {
      isCheckedIn: true,
      checkedInAt: new Date(),
      checkedInByUserId,
    },
  });

  return {
    success: true,
    message: "Delegate checked in successfully.",
    data: {
      delegateId: updatedDelegate.id,
      delegateNumber: updatedDelegate.delegateNumber,
      fullName: updatedDelegate.fullName,
      checkedInAt: updatedDelegate.checkedInAt,
    },
  };
}


export async function generateLoggedInParishQrImage(
  userId: string
) {
  const account = await prisma.parishAccount.findUnique({
    where: {
      userId,
    },
  });

  if (!account) {
    throw new Error("Parish account not found.");
  }

  return generateParishQrImage(account.parishId);
}