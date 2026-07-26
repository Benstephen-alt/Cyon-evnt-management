import { getActiveEvent } from "../events";
import { AllowDelegateToGoOutDto, MarkDelegateReturnedDto, SearchDelegateResponse, SearchManualParishResponse } from "./security.types";
import prisma from "@/config/prisma";



export async function searchDelegate(
  delegateNumber: string
): Promise<SearchDelegateResponse> {

    const event = await getActiveEvent();

    const delegate =
  await prisma.delegate.findFirst({
    where: {
      delegateNumber,
      eventId: event.id,
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

const parishArrival =
  await prisma.parishArrival.findFirst({
    where: {
      eventId: event.id,
      parishId: delegate.parishId,
      arrived: true,
    },
  });

  const activeGatePass =
  await prisma.gatePass.findFirst({
    where: {
      delegateId: delegate.id,

      checkedInAt: null,
    },
  });

  return {
  success: true,

  message:
    "Delegate retrieved successfully.",

  data: {
    delegate: {
      id: delegate.id,

      delegateNumber:
        delegate.delegateNumber,

      fullName:
        delegate.fullName,

      gender:
        delegate.gender,

      phoneNumber:
        delegate.phoneNumber,

      photoUrl:
        delegate.photoUrl,

      parish:
        delegate.parishName,

      deanery:
        delegate.deaneryName,
    },

    accommodation:
      delegate.accommodation
        ? {
            hostel:
              delegate.accommodation
                .bed.hall.hostel
                .hostelName,

            hall:
              delegate.accommodation
                .bed.hall.hallName,

            bedNumber:
              delegate.accommodation
                .bed.bedNumber,
          }
        : null,

    status: {
      registered: true,

      accommodated:
        delegate.accommodation !=
        null,

      parishArrived:
        parishArrival != null,

      checkedIn:
        delegate.isCheckedIn,

      outside:
        activeGatePass != null,

      canGoOut:
        delegate.isCheckedIn &&
        activeGatePass == null,

      canReturn:
        activeGatePass != null,
    },
  },
};
}



export async function allowDelegateToGoOut(
  payload: AllowDelegateToGoOutDto,
  checkedOutByUserId: string
) {
  const {
    delegateId,
    registrationId,
    remarks,
  } = payload;

  /*
   * The request must identify exactly one registration type.
   */
  if (
    (!delegateId && !registrationId) ||
    (delegateId && registrationId)
  ) {
    throw new Error(
      "Provide either delegateId or registrationId."
    );
  }

  /*
   * ONLINE DELEGATE
   */
  if (delegateId) {
    const delegate =
      await prisma.delegate.findUnique({
        where: {
          id: delegateId,
        },
      });

    if (!delegate) {
      throw new Error(
        "Delegate not found."
      );
    }

    if (!delegate.isCheckedIn) {
      throw new Error(
        "Delegate has not checked in."
      );
    }

    const activeGatePass =
      await prisma.gatePass.findFirst({
        where: {
          type: "ONLINE",
          delegateId,
          checkedInAt: null,
        },
      });

    if (activeGatePass) {
      throw new Error(
        "Delegate is already outside."
      );
    }

    const gatePass =
      await prisma.gatePass.create({
        data: {
          type: "ONLINE",
          eventId: delegate.eventId,
          delegateId,
          checkedOutByUserId,
          remarks,
          quantity: 1,
        },
      });

    return {
      success: true,
      message:
        "Delegate allowed to go out.",
      data: gatePass,
    };
  }

  /*
   * MANUAL PARISH DELEGATE
   */
  const registration =
    await prisma.manualParishRegistration.findUnique({
      where: {
        id: registrationId!,
      },
    });

  if (!registration) {
    throw new Error(
      "Manual parish registration not found."
    );
  }

  if (
    registration.delegatesOutside >=
    registration.totalDelegates
  ) {
    throw new Error(
      "All registered delegates from this parish are already outside."
    );
  }

  const result =
    await prisma.$transaction(
      async (transaction) => {
        const gatePass =
          await transaction.gatePass.create({
            data: {
              type: "MANUAL",
              eventId: registration.eventId,

              manualRegistrationId:
                registration.id,

              checkedOutByUserId,
              remarks,
              quantity: 1,
            },
          });

        await transaction.manualParishRegistration.update({
          where: {
            id: registration.id,
          },

          data: {
            delegatesOutside: {
              increment: 1,
            },
          },
        });

        return gatePass;
      }
    );

  return {
    success: true,
    message:
      "One delegate allowed to go out.",
    data: result,
  };
}


export async function markDelegateReturned(
  payload: MarkDelegateReturnedDto,
  checkedInByUserId: string
) {
  const {
    delegateId,
    registrationId,
  } = payload;

  /*
   * The request must identify exactly one registration type.
   */
  if (
    (!delegateId && !registrationId) ||
    (delegateId && registrationId)
  ) {
    throw new Error(
      "Provide either delegateId or registrationId."
    );
  }

  /*
   * ONLINE DELEGATE
   */
  if (delegateId) {
    const gatePass =
      await prisma.gatePass.findFirst({
        where: {
          type: "ONLINE",
          delegateId,
          checkedInAt: null,
        },

        orderBy: {
          checkedOutAt: "desc",
        },
      });

    if (!gatePass) {
      throw new Error(
        "Delegate is not currently outside."
      );
    }

    const updated =
      await prisma.gatePass.update({
        where: {
          id: gatePass.id,
        },

        data: {
          checkedInAt: new Date(),
          checkedInByUserId,
        },
      });

    return {
      success: true,
      message:
        "Delegate returned successfully.",
      data: updated,
    };
  }

  /*
   * MANUAL PARISH DELEGATE
   */
  const registration =
    await prisma.manualParishRegistration.findUnique({
      where: {
        id: registrationId!,
      },
    });

  if (!registration) {
    throw new Error(
      "Manual parish registration not found."
    );
  }

  if (registration.delegatesOutside <= 0) {
    throw new Error(
      "No delegate from this parish is currently outside."
    );
  }

  const activeGatePass =
    await prisma.gatePass.findFirst({
      where: {
        type: "MANUAL",

        manualRegistrationId:
          registration.id,

        checkedInAt: null,
      },

      orderBy: {
        checkedOutAt: "desc",
      },
    });

  if (!activeGatePass) {
    throw new Error(
      "No active manual gate pass was found for this parish."
    );
  }

  const result =
    await prisma.$transaction(
      async (transaction) => {
        const updatedGatePass =
          await transaction.gatePass.update({
            where: {
              id: activeGatePass.id,
            },

            data: {
              checkedInAt: new Date(),
              checkedInByUserId,
            },
          });

        await transaction.manualParishRegistration.update({
          where: {
            id: registration.id,
          },

          data: {
            delegatesOutside: {
              decrement: 1,
            },
          },
        });

        return updatedGatePass;
      }
    );

  return {
    success: true,
    message:
      "One delegate returned successfully.",
    data: result,
  };
}

export async function getDelegatesOutside() {


const onlineGatePasses =
  await prisma.gatePass.findMany({
    where: {
      type: "ONLINE",
      checkedInAt: null,
    },

    include: {
      delegate: true,

      checkedOutBy: {
        select: {
          admin: true,
        },
      },
    },

    orderBy: {
      checkedOutAt: "desc",
    },
  });


const onlineDelegates =
  onlineGatePasses.map((gatePass) => ({
    gatePassId: gatePass.id,

    delegateId: gatePass.delegate!.id,

    delegateNumber:
      gatePass.delegate!.delegateNumber,

    fullName:
      gatePass.delegate!.fullName,

    gender:
      gatePass.delegate!.gender,

    parish:
      gatePass.delegate!.parishName,

    deanery:
      gatePass.delegate!.deaneryName,

    phoneNumber:
      gatePass.delegate!.phoneNumber,

    photoUrl:
      gatePass.delegate!.photoUrl,

    checkedOutAt:
      gatePass.checkedOutAt,

    checkedOutBy:
      gatePass.checkedOutBy.admin,

    remarks:
      gatePass.remarks,
  }));


  const manualGatePasses =
  await prisma.gatePass.findMany({
    where: {
      type: "MANUAL",
      checkedInAt: null,
    },

    include: {
  manualRegistration: {
    include: {
      parish: true,
    },
  },

  checkedOutBy: {
    select: {
      admin: true,
    },
  },
},

    orderBy: {
      checkedOutAt: "desc",
    },
  });


  const manualDelegates =
  manualGatePasses.map((gatePass) => ({
    gatePassId: gatePass.id,

    registrationId:
      gatePass.manualRegistration!.id,

    registrationCode:
      gatePass.manualRegistration!
        .registrationCode,

    parish:
      gatePass.manualRegistration!.parish.parishName,

    president:
      gatePass.manualRegistration!
        .presidentName,

    phoneNumber:
      gatePass.manualRegistration!
        .presidentPhone,

    totalDelegates:
      gatePass.manualRegistration!
        .totalDelegates,

    currentlyOutside:
      gatePass.quantity,

    checkedOutAt:
      gatePass.checkedOutAt,

    checkedOutBy:
      gatePass.checkedOutBy.admin,

    remarks:
      gatePass.remarks,
  }));

  return {
  success: true,

  message:
    "Delegates currently outside retrieved successfully.",

  data: {
    totalOutside:
      onlineDelegates.length +
      manualDelegates.reduce(
        (sum, item) =>
          sum + item.currentlyOutside,
        0
      ),

    onlineCount:
      onlineDelegates.length,

    manualCount:
      manualDelegates.reduce(
        (sum, item) =>
          sum + item.currentlyOutside,
        0
      ),

    onlineDelegates,

    manualDelegates,
  },
};

}





export async function searchManualParish(
  registrationCode: string
): Promise<SearchManualParishResponse> {
  const normalizedCode =
    registrationCode.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error(
      "Manual registration code is required."
    );
  }

  const event = await getActiveEvent();

  const registration =
  await prisma.manualParishRegistration.findFirst({
    where: {
      registrationCode: normalizedCode,
      eventId: event.id,
    },

    include: {
      parish: true,
      deanery: true,
    },
  });

  if (!registration) {
    throw new Error(
      "Manual parish registration not found."
    );
  }

  const activeGatePasses =
    await prisma.gatePass.findMany({
      where: {
        type: "MANUAL",

        eventId: event.id,

        manualRegistrationId:
          registration.id,

        checkedInAt: null,
      },

      select: {
        quantity: true,
      },
    });

  const delegatesOutside =
  registration.delegatesOutside;

const delegatesInside =
  registration.totalDelegates -
  delegatesOutside;

  return {
  success: true,

  message:
    "Manual parish retrieved successfully.",

  data: {
    registration: {
      id: registration.id,

      registrationCode:
        registration.registrationCode,

      parish:
        registration.parish.parishName,

      deanery:
        registration.deanery.name,

      presidentName:
        registration.presidentName,

      presidentPhone:
        registration.presidentPhone,

      totalDelegates:
        registration.totalDelegates,
    },

    status: {
      delegatesInside:
        registration.totalDelegates -
        registration.delegatesOutside,

      delegatesOutside:
        registration.delegatesOutside,

      canGoOut:
        registration.delegatesOutside <
        registration.totalDelegates,

      canReturn:
        registration.delegatesOutside >
        0,
    },
  },
};
}