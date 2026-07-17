import prisma from "@/config/prisma";
import { CommitteePermission, UserRole } from "@prisma/client";

export async function getUserPermissions(
  userId: string
): Promise<CommitteePermission[]> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      committeeMember: {
        include: {
          assignments: {
            where: {
              isActive: true,
            },
            include: {
              committee: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // Super Admin has every permission
  if (user.role === UserRole.SUPER_ADMIN) {
    return Object.values(CommitteePermission);
  }

  // Admin also has every permission
  if (user.role === UserRole.ADMIN) {
    return Object.values(CommitteePermission);
  }

  if (!user.committeeMember) {
    return [];
  }

  const permissions = new Set<CommitteePermission>();

  for (const assignment of user.committeeMember.assignments) {
    for (const permission of assignment.committee.permissions) {
      permissions.add(permission);
    }
  }

  return [...permissions];
}

export async function hasPermission(
  userId: string,
  permission: CommitteePermission
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);

  return permissions.includes(permission);
}