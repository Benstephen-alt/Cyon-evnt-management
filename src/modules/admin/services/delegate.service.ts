import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services/event.service";

interface GetDelegatesOptions {
  search?: string;
  parishId?: string;
  deaneryId?: string;
  gender?: string;
}


export async function getDelegates(
  options: GetDelegatesOptions = {}
) {
  const event = await getActiveEvent();

  const where: any = {
    eventId: event.id,
  };

  if (options.gender) {
    where.gender = options.gender;
  }

  if (options.parishId) {
    where.parishId = options.parishId;
  }

  if (options.deaneryId) {
    where.deaneryId = options.deaneryId;
  }

  if (options.search) {
    where.OR = [
      {
        fullName: {
          contains: options.search,
          mode: "insensitive",
        },
      },
      {
        delegateNumber: {
          contains: options.search,
          mode: "insensitive",
        },
      },
      {
        phoneNumber: {
          contains: options.search,
          mode: "insensitive",
        },
      },
      {
        parishName: {
          contains: options.search,
          mode: "insensitive",
        },
      },
      {
        deaneryName: {
          contains: options.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return prisma.delegate.findMany({
    where,
    orderBy: {
      fullName: "asc",
    },
  });
}

export async function getDelegateById(
  delegateId: string
) {
  const event = await getActiveEvent();

  const delegate = await prisma.delegate.findFirst({
    where: {
      id: delegateId,
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

  return delegate;
}

export async function getDelegatesByParish(
  parishId: string
) {
  const event = await getActiveEvent();


const parish = await prisma.parish.findUnique({
  where: {
    id: parishId,
  },
  select: {
    id: true,
    parishName: true,
    parishCode: true,
    deanery: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

if (!parish) {
  throw new Error("Parish not found.");
}



const account = await prisma.parishAccount.findFirst({
  where: {
    parishId,
    eventId: event.id,
  },
  select: {
    paymentStatus: true,
    approvedAt: true,
  },
});

  if (!account) {
    throw new Error("Parish account not found.");
  }

  const delegates = await prisma.delegate.findMany({
    where: {
      parishId,
      eventId: event.id,
    },
    orderBy: {
      fullName: "asc",
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

  const checkedIn = delegates.filter(
  (delegate) => delegate.isCheckedIn
).length;

const outstanding = delegates.length - checkedIn;


  return {
  parish,
  event: event.eventName,

  registrationPaid:
    account?.paymentStatus === "APPROVED" ||
    account?.approvedAt !== null,

  totalDelegates: delegates.length,

  maleDelegates: delegates.filter(
    (delegate) => delegate.gender === "MALE"
  ).length,

  femaleDelegates: delegates.filter(
    (delegate) => delegate.gender === "FEMALE"
  ).length,

  checkedIn,

  outstanding,

  delegates,
};
}

export async function deleteDelegate(
  delegateId: string
) {
  const event = await getActiveEvent();

  const delegate = await prisma.delegate.findFirst({
    where: {
      id: delegateId,
      eventId: event.id,
    },
    include: {
      accommodation: true,
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

  return prisma.$transaction(async (tx) => {
    if (delegate.accommodation) {
      await tx.bed.update({
        where: {
          id: delegate.accommodation.bedId,
        },
        data: {
          isOccupied: false,
        },
      });

      await tx.accommodation.delete({
        where: {
          id: delegate.accommodation.id,
        },
      });
    }

    await tx.delegate.delete({
      where: {
        id: delegate.id,
      },
    });

    return {
      success: true,
      message: "Delegate deleted successfully.",
    };
  });
}

