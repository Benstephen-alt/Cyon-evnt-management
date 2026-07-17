import prisma from "@/config/prisma";
import { CreateHallDto } from "./hall.types";
import { UpdateHallDto } from "./hall.types";

export async function createHall(
  data: CreateHallDto
) {
  // Validate hostel
  const hostel = await prisma.hostel.findUnique({
    where: {
      id: data.hostelId,
    },
  });

  if (!hostel) {
    throw new Error("Hostel not found.");
  }

  // Duplicate hall check
  const existing = await prisma.hall.findFirst({
    where: {
      hostelId: data.hostelId,
      hallName: data.hallName,
    },
  });

  if (existing) {
    throw new Error("Hall already exists.");
  }

  const result = await prisma.$transaction(async (tx) => {

    const hall = await tx.hall.create({
      data: {
        hostelId: data.hostelId,
        hallName: data.hallName,
        totalBeds: data.totalBeds,
      },
    });

    const beds = [];

    for (let i = 1; i <= data.totalBeds; i++) {
      beds.push({
        hallId: hall.id,
        bedNumber: i,
      });
    }

    await tx.bed.createMany({
      data: beds,
    });

    return hall;
  });

  return {
    success: true,
    message: "Hall created successfully.",
    data: result,
  };
}

export async function getHalls() {
  const halls = await prisma.hall.findMany({
    include: {
      hostel: true,
      beds: true,
    },
    orderBy: {
      hallName: "asc",
    },
  });

  return {
    success: true,
    message: "Halls retrieved successfully.",
    data: halls.map((hall) => {
      const occupiedBeds = hall.beds.filter(
        (bed) => bed.isOccupied
      ).length;

      return {
        id: hall.id,

        hallName: hall.hallName,

        hostelName: hall.hostel.hostelName,

        gender: hall.hostel.gender,

        totalBeds: hall.totalBeds,

        occupiedBeds,

        availableBeds:
          hall.totalBeds - occupiedBeds,
      };
    }),
  };
}

export async function getHallById(id: string) {
  const hall = await prisma.hall.findUnique({
    where: {
      id,
    },
    include: {
      hostel: true,
      beds: {
        orderBy: {
          bedNumber: "asc",
        },
      },
    },
  });

  if (!hall) {
    throw new Error("Hall not found.");
  }

  const occupiedBeds = hall.beds.filter(
    (bed) => bed.isOccupied
  ).length;

  return {
    success: true,
    message: "Hall retrieved successfully.",
    data: {
      id: hall.id,
      hallName: hall.hallName,
      hostelId: hall.hostel.id,
      hostelName: hall.hostel.hostelName,
      gender: hall.hostel.gender,
      totalBeds: hall.totalBeds,
      occupiedBeds,
      availableBeds: hall.totalBeds - occupiedBeds,
      beds: hall.beds.map((bed) => ({
        id: bed.id,
        bedNumber: bed.bedNumber,
        isOccupied: bed.isOccupied,
      })),
    },
  };
}



export async function updateHall(
  id: string,
  data: UpdateHallDto
) {
  const hall = await prisma.hall.findUnique({
    where: {
      id,
    },
    include: {
      beds: true,
    },
  });

  if (!hall) {
    throw new Error("Hall not found.");
  }

  const occupiedBeds = hall.beds.filter(
    (bed) => bed.isOccupied
  ).length;

  if (
    data.totalBeds !== undefined &&
    data.totalBeds < occupiedBeds
  ) {
    throw new Error(
      `Hall has ${occupiedBeds} occupied beds. Capacity cannot be reduced below that.`
    );
  }

  const updated = await prisma.hall.update({
    where: {
      id,
    },
    data: {
      hallName: data.hallName,
      totalBeds: data.totalBeds,
    },
  });

  return {
    success: true,
    message: "Hall updated successfully.",
    data: updated,
  };
}

export async function deleteHall(id: string) {
  const hall = await prisma.hall.findUnique({
    where: {
      id,
    },
    include: {
      beds: {
        include: {
          accommodation: true,
        },
      },
    },
  });

  if (!hall) {
    throw new Error("Hall not found.");
  }

  const occupiedBeds = hall.beds.filter(
    (bed) => bed.isOccupied
  );

  if (occupiedBeds.length > 0) {
    throw new Error(
      "Cannot delete a hall with occupied beds."
    );
  }

  const allocatedBeds = hall.beds.filter(
    (bed) => bed.accommodation !== null
  );

  if (allocatedBeds.length > 0) {
    throw new Error(
      "Cannot delete a hall with allocated beds."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.bed.deleteMany({
      where: {
        hallId: id,
      },
    });

    await tx.hall.delete({
      where: {
        id,
      },
    });
  });

  return {
    success: true,
    message: "Hall deleted successfully.",
  };
}