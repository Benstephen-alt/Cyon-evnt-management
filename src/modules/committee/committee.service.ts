import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services/event.service";
import {
  CreateCommitteeDto,
  UpdateCommitteeDto,
} from "./committee.types";

export async function createCommittee(
  data: CreateCommitteeDto
) {
  const event = await getActiveEvent();

  const existing = await prisma.committee.findFirst({
    where: {
      eventId: event.id,
      committeeName: data.committeeName,
    },
  });

  if (existing) {
    throw new Error("Committee already exists.");
  }

  return prisma.committee.create({
    data: {
      ...data,
      eventId: event.id,
    },
  });
}

export async function getCommittees() {
  const event = await getActiveEvent();

  const committees = await prisma.committee.findMany({
    where: {
      eventId: event.id,
    },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
    orderBy: {
      committeeName: "asc",
    },
  });

  return committees.map((committee) => ({
    id: committee.id,
    committeeName: committee.committeeName,
    description: committee.description,
    permissions: committee.permissions,
    totalMembers: committee._count.assignments,
    createdAt: committee.createdAt,
    updatedAt: committee.updatedAt,
  }));
}

export async function getCommitteeById(
  committeeId: string
) {
  const event = await getActiveEvent();

  const committee = await prisma.committee.findFirst({
    where: {
      id: committeeId,
      eventId: event.id,
    },
    include: {
      assignments: {
        include: {
          committeeMember: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  return committee;
}

export async function updateCommittee(
  committeeId: string,
  data: UpdateCommitteeDto
) {
  const event = await getActiveEvent();

  const committee = await prisma.committee.findFirst({
    where: {
      id: committeeId,
      eventId: event.id,
    },
  });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  return prisma.committee.update({
    where: {
      id: committeeId,
    },
    data,
  });
}

export async function deleteCommittee(
  committeeId: string
) {
  const event = await getActiveEvent();

  const committee = await prisma.committee.findFirst({
    where: {
      id: committeeId,
      eventId: event.id,
    },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  if (committee._count.assignments > 0) {
    throw new Error(
      "Cannot delete a committee with assigned members."
    );
  }

  await prisma.committee.delete({
    where: {
      id: committeeId,
    },
  });

  return {
    success: true,
    message: "Committee deleted successfully.",
  };
}

export async function getAvailableCommitteeUsers() {
  const members = await prisma.committeeMember.findMany({
    select: {
      userId: true,
    },
  });

  const memberIds = members.map((member) => member.userId);

  return prisma.user.findMany({
    where: {
      id: {
        notIn: memberIds,
      },
      role: {
        in: ["ADMIN", "SUPER_ADMIN"],
      },
    },
    select: {
      id: true,
      loginId: true,
      email: true,
      role: true,
    },
    orderBy: {
      loginId: "asc",
    },
  });
}