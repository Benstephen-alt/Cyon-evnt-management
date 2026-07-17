import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services";
import { CreateHostelDto } from "./hostel.types";
import { UpdateHostelDto } from "./hostel.types";

export async function createHostel(
  data: CreateHostelDto
) {
  const event = await getActiveEvent();

  const existing = await prisma.hostel.findFirst({
    where: {
      eventId: event.id,
      hostelName: data.hostelName,
    },
  });

  if (existing) {
    throw new Error("Hostel already exists.");
  }

  const hostel = await prisma.hostel.create({
    data: {
      eventId: event.id,
      hostelName: data.hostelName,
      gender: data.gender,
    },
  });

  return {
    success: true,
    message: "Hostel created successfully.",
    data: hostel,
  };
}

export async function getHostels() {
  const event = await getActiveEvent();

  const hostels = await prisma.hostel.findMany({
    where: {
      eventId: event.id,
    },
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
    message: "Hostels retrieved successfully.",
    data: hostels.map((hostel) => {
      const totalHalls = hostel.halls.length;

      const totalBeds = hostel.halls.reduce(
        (sum, hall) => sum + hall.beds.length,
        0
      );

      const occupiedBeds = hostel.halls.reduce(
        (sum, hall) =>
          sum +
          hall.beds.filter((bed) => bed.isOccupied).length,
        0
      );

      return {
        id: hostel.id,

        hostelName: hostel.hostelName,

        gender: hostel.gender,

        totalHalls,

        totalBeds,

        occupiedBeds,

        availableBeds: totalBeds - occupiedBeds,
      };
    }),
  };
}

export async function getHostelById(id: string) {
  const hostel = await prisma.hostel.findUnique({
    where: {
      id,
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

  const halls = hostel.halls.map((hall) => {
    const occupiedBeds = hall.beds.filter(
      (bed) => bed.isOccupied
    ).length;

    return {
      id: hall.id,
      hallName: hall.hallName,
      totalBeds: hall.totalBeds,
      occupiedBeds,
      availableBeds: hall.totalBeds - occupiedBeds,
    };
  });

  const totalBeds = halls.reduce(
    (sum, hall) => sum + hall.totalBeds,
    0
  );

  const occupiedBeds = halls.reduce(
    (sum, hall) => sum + hall.occupiedBeds,
    0
  );

  return {
    success: true,
    message: "Hostel retrieved successfully.",
    data: {
      id: hostel.id,
      hostelName: hostel.hostelName,
      gender: hostel.gender,
      totalHalls: halls.length,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      halls,
    },
  };
}



export async function updateHostel(
  id: string,
  data: UpdateHostelDto
) {
  const hostel = await prisma.hostel.findUnique({
    where: {
      id,
    },
  });

  if (!hostel) {
    throw new Error("Hostel not found.");
  }

  const updated = await prisma.hostel.update({
    where: {
      id,
    },
    data: {
      hostelName: data.hostelName,
      gender: data.gender,
    },
  });

  return {
    success: true,
    message: "Hostel updated successfully.",
    data: updated,
  };
}

export async function deleteHostel(id: string) {
  const hostel = await prisma.hostel.findUnique({
    where: {
      id,
    },
  });

  if (!hostel) {
    throw new Error("Hostel not found.");
  }

  await prisma.hostel.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Hostel deleted successfully.",
  };
}