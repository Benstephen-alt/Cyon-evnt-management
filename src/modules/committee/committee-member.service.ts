import prisma from "@/config/prisma";

import {
  CreateCommitteeMemberDto,
  UpdateCommitteeMemberDto,
} from "./committee-member.types";

export async function createCommitteeMember(
  data: CreateCommitteeMemberDto
) {
  const user = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const existing = await prisma.committeeMember.findUnique({
    where: {
      userId: data.userId,
    },
  });

  if (existing) {
    throw new Error(
      "User is already a committee member."
    );
  }

  const member = await prisma.committeeMember.create({
  data: {
    userId: data.userId,
  },
  include: {
    user: true,
  },
});

return member;
}

export async function getCommitteeMembers() {
  const members = await prisma.committeeMember.findMany({
    include: {
      user: true,
      _count: {
        select: {
          assignments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return members.map((member) => ({
    id: member.id,

    userId: member.user.id,

    loginId: member.user.loginId,

    email: member.user.email,

    role: member.user.role,

    isActive: member.isActive,

    totalAssignments: member._count.assignments,

    createdAt: member.createdAt,
  }));
}

export async function getCommitteeMemberById(
  memberId: string
) {
  const member = await prisma.committeeMember.findUnique({
    where: {
      id: memberId,
    },
    include: {
      user: true,
      assignments: {
        include: {
          committee: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!member) {
    throw new Error("Committee member not found.");
  }

  return {
    id: member.id,

    userId: member.user.id,

    loginId: member.user.loginId,

    email: member.user.email,

    role: member.user.role,

    isActive: member.isActive,

    committees: member.assignments.map(
      (assignment) => ({
        assignmentId: assignment.id,
        committeeId: assignment.committee.id,
        committeeName:
          assignment.committee.committeeName,
      })
    ),

    createdAt: member.createdAt,

    updatedAt: member.updatedAt,
  };
}

export async function updateCommitteeMember(
  memberId: string,
  data: UpdateCommitteeMemberDto
) {
  const member = await prisma.committeeMember.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!member) {
    throw new Error("Committee member not found.");
  }

  return prisma.committeeMember.update({
    where: {
      id: memberId,
    },
    data: {
      isActive: data.isActive,
    },
    include: {
      user: true,
    },
  });
}

export async function deleteCommitteeMember(
  memberId: string
) {
  const member = await prisma.committeeMember.findUnique({
    where: {
      id: memberId,
    },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error("Committee member not found.");
  }

  if (member._count.assignments > 0) {
    throw new Error(
      "Remove all committee assignments before deleting this member."
    );
  }

  await prisma.committeeMember.delete({
    where: {
      id: memberId,
    },
  });

  return {
    success: true,
    message: "Committee member deleted successfully.",
  };
}