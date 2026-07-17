import prisma from "@/config/prisma";
import { CreateCommitteeAssignmentDto } from "./committee-assignment.types";
import { getActiveEvent } from "@/shared/services/event.service";

export async function createCommitteeAssignment(
  data: CreateCommitteeAssignmentDto,
  assignedByUserId: string
) {
  const event = await getActiveEvent();

  const committee = await prisma.committee.findFirst({
    where: {
      id: data.committeeId,
      eventId: event.id,
    },
  });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  const member = await prisma.committeeMember.findUnique({
    where: {
      id: data.committeeMemberId,
    },
    include: {
      user: true,
    },
  });

  if (!member) {
    throw new Error("Committee member not found.");
  }

  const existingAssignment =
    await prisma.committeeAssignment.findFirst({
      where: {
        committeeId: data.committeeId,
        committeeMemberId: data.committeeMemberId,
      },
    });

  if (existingAssignment) {
    throw new Error(
      "Member is already assigned to this committee."
    );
  }

  const assignment =
    await prisma.committeeAssignment.create({
      data: {
        committeeId: data.committeeId,
        committeeMemberId: data.committeeMemberId,
        assignedByUserId,
      },
      include: {
        committee: true,
        committeeMember: {
          include: {
            user: true,
          },
        },
      },
    });

  return {
    success: true,
    message: "Committee assignment created successfully.",
    data: assignment,
  };
}


export async function getCommitteeAssignments() {
  const event = await getActiveEvent();

  return prisma.committeeAssignment.findMany({
    where: {
      committee: {
        eventId: event.id,
      },
    },
    include: {
      committee: true,

      committeeMember: {
        include: {
          user: true,
        },
      },

      assignedBy: {
  select: {
    id: true,
    email: true,
    loginId: true,
    role: true,
  },
},
    },
    orderBy: [
      {
        committee: {
          committeeName: "asc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function removeCommitteeAssignment(
  assignmentId: string
) {
  const event = await getActiveEvent();

  const assignment =
    await prisma.committeeAssignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        committee: true,

        committeeMember: {
          include: {
            user: true,
          },
        },
      },
    });

  if (!assignment) {
    throw new Error("Committee assignment not found.");
  }

  if (assignment.committee.eventId !== event.id) {
    throw new Error("Committee assignment not found.");
  }

  await prisma.committeeAssignment.delete({
    where: {
      id: assignmentId,
    },
  });

  return {
    success: true,
    message: "Committee assignment removed successfully.",
  };
}