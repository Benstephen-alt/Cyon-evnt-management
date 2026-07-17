import prisma from "@/config/prisma";
import { CreateAccommodationDto } from "./accommodation.types";
import { getActiveEvent } from "@/shared/services";
import { MoveAccommodationDto } from "./accommodation.types";
import { NoAvailableBedError } from "@/shared/errors/no-available-bed.error";


export async function createAccommodation(
  data: CreateAccommodationDto,
  allocatedByUserId: string
) {
  // Active event
  const event = await getActiveEvent();

  // Validate delegate
  const delegate = await prisma.delegate.findFirst({
    where: {
      id: data.delegateId,
      eventId: event.id,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  // Ensure delegate has not already been allocated
  const existingAccommodation =
    await prisma.accommodation.findUnique({
      where: {
        delegateId: delegate.id,
      },
    });

  if (existingAccommodation) {
    throw new Error(
      "Delegate already has accommodation."
    );
  }

  // Validate bed
  const bed = await prisma.bed.findUnique({
    where: {
      id: data.bedId,
    },
    include: {
      hall: {
        include: {
          hostel: true,
        },
      },
    },
  });

  if (!bed) {
    throw new Error("Bed not found.");
  }

  if (bed.hall.hostel.eventId !== event.id) {
  throw new Error("Selected bed does not belong to the active event.");
}

  if (bed.isOccupied) {
    throw new Error("Selected bed is already occupied.");
  }

  const accommodation = await prisma.$transaction(
    async (tx) => {

      const accommodation =
        await tx.accommodation.create({
          data: {
            delegateId: delegate.id,

            bedId: bed.id,

            allocatedByUserId,
          },
        });

      await tx.bed.update({
        where: {
          id: bed.id,
        },
        data: {
          isOccupied: true,
        },
      });

      return accommodation;
    }
  );

  return {
    success: true,
    message: "Accommodation allocated successfully.",
    data: accommodation,
  };
}

export async function getAccommodations() {
  const accommodations = await prisma.accommodation.findMany({
    include: {
      delegate: true,
      bed: {
        include: {
          hall: {
            include: {
              hostel: true,
            },
          },
        },
      },
      allocatedBy: {
        include: {
          admin: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      allocatedAt: "desc",
    },
  });

  return {
    success: true,
    message: "Accommodation list retrieved successfully.",
    data: accommodations.map((item) => ({
      id: item.id,

      delegateId: item.delegate.id,

      delegateNumber: item.delegate.delegateNumber,

      delegateName: item.delegate.fullName,

      gender: item.delegate.gender,

      parish: item.delegate.parishName,

      deanery: item.delegate.deaneryName,

      hostel: item.bed.hall.hostel.hostelName,

      hall: item.bed.hall.hallName,

      bedNumber: item.bed.bedNumber,

      allocatedAt: item.allocatedAt,

      allocatedBy:
        item.allocatedBy.admin?.fullName ??
        item.allocatedBy.loginId ??
        item.allocatedBy.email ??
        "System",
    })),
  };
}

export async function getAccommodationById(id: string) {
  const accommodation = await prisma.accommodation.findUnique({
    where: {
      id,
    },
    include: {
      delegate: true,
      bed: {
        include: {
          hall: {
            include: {
              hostel: true,
            },
          },
        },
      },
      allocatedBy: {
        include: {
          admin: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!accommodation) {
    throw new Error("Accommodation not found.");
  }

  return {
    success: true,
    message: "Accommodation retrieved successfully.",
    data: {
      id: accommodation.id,

      delegate: {
        id: accommodation.delegate.id,
        delegateNumber: accommodation.delegate.delegateNumber,
        fullName: accommodation.delegate.fullName,
        gender: accommodation.delegate.gender,
        parish: accommodation.delegate.parishName,
        deanery: accommodation.delegate.deaneryName,
        phoneNumber: accommodation.delegate.phoneNumber,
      },

      accommodation: {
        hostel: accommodation.bed.hall.hostel.hostelName,
        hall: accommodation.bed.hall.hallName,
        bedNumber: accommodation.bed.bedNumber,
      },

      allocatedBy:
        accommodation.allocatedBy.admin?.fullName ??
        accommodation.allocatedBy.loginId ??
        accommodation.allocatedBy.email ??
        "System",

      allocatedAt: accommodation.allocatedAt,
    },
  };
}


export async function moveAccommodation(
  id: string,
  data: MoveAccommodationDto
) {
  const accommodation = await prisma.accommodation.findUnique({
    where: {
      id,
    },
    include: {
      bed: true,
    },
  });

  if (!accommodation) {
    throw new Error("Accommodation not found.");
  }

  const newBed = await prisma.bed.findUnique({
    where: {
      id: data.bedId,
    },
  });

  if (!newBed) {
    throw new Error("Selected bed not found.");
  }

  if (accommodation.bedId === newBed.id) {
  throw new Error("Delegate is already assigned to this bed.");
}

  if (newBed.isOccupied) {
    throw new Error("Selected bed is already occupied.");
  }

  const result = await prisma.$transaction(async (tx) => {

    // Free old bed
    await tx.bed.update({
      where: {
        id: accommodation.bedId,
      },
      data: {
        isOccupied: false,
      },
    });

    // Occupy new bed
    await tx.bed.update({
      where: {
        id: newBed.id,
      },
      data: {
        isOccupied: true,
      },
    });

    // Update accommodation
    return await tx.accommodation.update({
      where: {
        id,
      },
      data: {
        bedId: newBed.id,
      },
    });
  });

  return {
    success: true,
    message: "Accommodation moved successfully.",
    data: result,
  };
}

export async function removeAccommodation(id: string) {
  const accommodation = await prisma.accommodation.findUnique({
    where: {
      id,
    },
  });

  if (!accommodation) {
    throw new Error("Accommodation not found.");
  }

  await prisma.$transaction(async (tx) => {

    // Free the bed
    await tx.bed.update({
      where: {
        id: accommodation.bedId,
      },
      data: {
        isOccupied: false,
      },
    });

    // Delete accommodation
    await tx.accommodation.delete({
      where: {
        id,
      },
    });
  });

  return {
    success: true,
    message: "Accommodation removed successfully.",
  };
}


export async function autoAllocateAccommodation(
  delegateId: string,
  allocatedByUserId: string
) {
  const event = await getActiveEvent();

  // Find delegate
  const delegate = await prisma.delegate.findFirst({
    where: {
      id: delegateId,
      eventId: event.id,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  // Already allocated?
  const existing = await prisma.accommodation.findUnique({
    where: {
      delegateId,
    },
  });

  if (existing) {
    return existing;
  }

  // Find first free bed
  const bed = await prisma.bed.findFirst({
  where: {
    isOccupied: false,
    hall: {
      hostel: {
        eventId: event.id,
        gender: delegate.gender, // Match delegate gender
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
    {
      hall: {
        hostel: {
          hostelName: "asc",
        },
      },
    },
    {
      hall: {
        hallName: "asc",
      },
    },
    {
      bedNumber: "asc",
    },
  ],
});

  if (!bed) {
    throw new NoAvailableBedError();
  }

  return prisma.$transaction(async (tx) => {
    const accommodation = await tx.accommodation.create({
      data: {
        delegateId,
        bedId: bed.id,
        allocatedByUserId,
      },
    });

    await tx.bed.update({
      where: {
        id: bed.id,
      },
      data: {
        isOccupied: true,
      },
    });

    return accommodation;
  });
}


export async function getAccommodationHostels() {
  const hostels = await prisma.hostel.findMany({
    include: {
      halls: {
        include: {
          beds: true,
        },
      },
    },
    orderBy: {
      hostelName: "asc",
    },
  });

  return {
    success: true,
    message: "Accommodation hostels retrieved successfully.",
    data: hostels.map((hostel) => {
      const totalHalls = hostel.halls.length;

      const totalBeds = hostel.halls.reduce(
        (sum, hall) => sum + hall.totalBeds,
        0
      );

      const occupiedBeds = hostel.halls.reduce(
        (sum, hall) =>
          sum +
          hall.beds.filter(
            (bed) => bed.isOccupied
          ).length,
        0
      );

      return {
        id: hostel.id,

        hostelName: hostel.hostelName,

        gender: hostel.gender,

        totalHalls,

        totalBeds,

        occupiedBeds,

        availableBeds:
          totalBeds - occupiedBeds,
      };
    }),
  };
}

export async function getAccommodationHostelById(
  hostelId: string
) {

  const hostel =
    await prisma.hostel.findUnique({

      where: {
        id: hostelId,
      },

      include: {

        halls: {

          include: {
            beds: true,
          },

          orderBy: {
            hallName: "asc",
          },

        },

      },

    });

  if (!hostel) {
    throw new Error("Hostel not found.");
  }

  const halls =
    hostel.halls.map((hall) => {

      const occupiedBeds =
        hall.beds.filter(
          (bed) => bed.isOccupied
        ).length;

      return {

        id: hall.id,

        hallName: hall.hallName,

        totalBeds: hall.totalBeds,

        occupiedBeds,

        availableBeds:
          hall.totalBeds -
          occupiedBeds,

      };

    });

  const totalBeds =
    halls.reduce(
      (sum, hall) =>
        sum + hall.totalBeds,
      0
    );

  const occupiedBeds =
    halls.reduce(
      (sum, hall) =>
        sum + hall.occupiedBeds,
      0
    );

  return {

    success: true,

    message:
      "Hostel retrieved successfully.",

    data: {

      id: hostel.id,

      hostelName:
        hostel.hostelName,

      gender:
        hostel.gender,

      totalHalls:
        halls.length,

      totalBeds,

      occupiedBeds,

      availableBeds:
        totalBeds -
        occupiedBeds,

      halls,

    },

  };

}