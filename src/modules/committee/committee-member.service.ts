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

  const member = await prisma.$transaction(async (tx) => {
    const createdMember = await tx.committeeMember.create({
      data: {
        userId: data.userId,
      },
      include: {
        user: true,
      },
    });

    const feedingCommittees = await tx.committee.findMany({
      where: {
        committeeName: { equals: "Feeding", mode: "insensitive" },
        event: { isActive: true },
      },
      select: { id: true },
    });

    if (feedingCommittees.length) {
      await tx.committeeAssignment.createMany({
        data: feedingCommittees.map((committee) => ({
          committeeId: committee.id,
          committeeMemberId: createdMember.id,
        })),
        skipDuplicates: true,
      });
    }

    if (user.role === "ADMIN") {
      await tx.admin.updateMany({
        where: { userId: user.id },
        data: { adminPortalAccess: false },
      });
    }

    return createdMember;
  });

return member;
}

export async function createCommitteeMembers(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!uniqueUserIds.length) throw new Error("Select at least one user.");

  return prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({ where: { id: { in: uniqueUserIds } } });
    if (users.length !== uniqueUserIds.length) throw new Error("One or more selected users were not found.");

    const existing = await tx.committeeMember.findMany({
      where: { userId: { in: uniqueUserIds } }, select: { userId: true },
    });
    if (existing.length) throw new Error("One or more selected users are already committee members.");

    const feedingCommittees = await tx.committee.findMany({
      where: { committeeName: { equals: "Feeding", mode: "insensitive" }, event: { isActive: true } },
      select: { id: true },
    });
    const created = [];
    for (const user of users) {
      const member = await tx.committeeMember.create({ data: { userId: user.id }, include: { user: true } });
      if (feedingCommittees.length) {
        await tx.committeeAssignment.createMany({
          data: feedingCommittees.map((committee) => ({ committeeId: committee.id, committeeMemberId: member.id })),
          skipDuplicates: true,
        });
      }
      if (user.role === "ADMIN") {
        await tx.admin.updateMany({ where: { userId: user.id }, data: { adminPortalAccess: false } });
      }
      created.push(member);
    }
    return created;
  });
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
