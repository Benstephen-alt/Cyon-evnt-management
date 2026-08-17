import prisma from "@/config/prisma";
import { CreateCommitteeAssignmentDto } from "./committee-assignment.types";
import { getActiveEvent } from "@/shared/services/event.service";

export async function createCommitteeAssignment(
  data: CreateCommitteeAssignmentDto,
  assignedByUserId: string
) {
  const event = await getActiveEvent();
  const committeeMemberIds = Array.from(
    new Set([
      ...(Array.isArray(data.committeeMemberIds) ? data.committeeMemberIds : []),
      ...(data.committeeMemberId ? [data.committeeMemberId] : []),
    ].filter(Boolean))
  );

  if (!committeeMemberIds.length) {
    throw new Error("Select at least one committee member.");
  }

  const committee = await prisma.committee.findFirst({
    where: {
      id: data.committeeId,
      eventId: event.id,
    },
  });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  const members = await prisma.committeeMember.findMany({
    where: { id: { in: committeeMemberIds } },
  });
  if (members.length !== committeeMemberIds.length) {
    throw new Error("One or more selected committee members were not found.");
  }

  const existingAssignments = await prisma.committeeAssignment.findMany({
    where: { committeeId: data.committeeId, committeeMemberId: { in: committeeMemberIds } },
    select: { committeeMemberId: true },
  });
  if (existingAssignments.length) {
    throw new Error("One or more selected members are already assigned to this committee.");
  }

  await prisma.committeeAssignment.createMany({
    data: committeeMemberIds.map((committeeMemberId) => ({
        committeeId: data.committeeId,
        committeeMemberId,
        assignedByUserId,
    })),
  });

  const assignments = await prisma.committeeAssignment.findMany({
    where: { committeeId: data.committeeId, committeeMemberId: { in: committeeMemberIds } },
    include: { committee: true, committeeMember: { include: { user: true } } },
  });

  return {
    success: true,
    message: `${assignments.length} committee member${assignments.length === 1 ? "" : "s"} assigned successfully.`,
    data: assignments,
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
