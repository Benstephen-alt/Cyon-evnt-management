import prisma from "@/config/prisma";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import {
  CreateAdminDto,
  UpdateAdminDto,
} from "./admin-manager.types";

export async function createAdmin(
  data: CreateAdminDto
) {
  /*
  |--------------------------------------------------------------------------
  | Existing Email
  |--------------------------------------------------------------------------
  */

  const existingEmail =
    await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

  if (existingEmail) {
    throw new Error(
      "Email already exists."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Hash Password
  |--------------------------------------------------------------------------
  */

  const passwordHash =
    await bcrypt.hash(
      data.password,
      10
    );

  /*
  |--------------------------------------------------------------------------
  | Create User
  |--------------------------------------------------------------------------
  */

  const user =
    await prisma.user.create({
      data: {
        email: data.email,

        passwordHash,

        role: data.role,

        isActive: true,

        admin: {
          create: {
            fullName:
              data.fullName,

            phoneNumber:
              data.phoneNumber,
          },
        },
      },

      include: {
        admin: true,
        committeeMember: true,
      },
    });

  return {
    success: true,

    message:
      "Administrator created successfully.",

    data: user,
  };
}

export async function getAdmins() {
  const admins =
    await prisma.user.findMany({
      where: {
        admin: {
          isNot: null,
        },
      },

      include: {
        admin: true,
        committeeMember: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    success: true,

    data: admins.map(
      (admin) => ({
        id: admin.id,

        fullName:
          admin.admin
            ?.fullName ?? "",

        email:
          admin.email,

        phoneNumber:
          admin.admin
            ?.phoneNumber,

        role: admin.role,

        isActive:
          admin.isActive,

        adminPortalAccess:
          admin.role === "SUPER_ADMIN" ||
          Boolean(admin.admin?.adminPortalAccess),

        isCommitteeMember:
          Boolean(admin.committeeMember),

        createdAt:
          admin.createdAt,
      })
    ),
  };
}

export async function setAdminPortalAccess(
  userId: string,
  enabled: boolean
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { admin: true, committeeMember: true },
  });

  if (!user || !user.admin) {
    throw new Error("Administrator not found.");
  }

  if (user.role === "SUPER_ADMIN") {
    throw new Error("Super Admin portal access cannot be restricted.");
  }

  if (!enabled && !user.committeeMember) {
    throw new Error(
      "Only administrators with a committee assignment can be restricted to the committee portal."
    );
  }

  const admin = await prisma.admin.update({
    where: { userId },
    data: { adminPortalAccess: enabled },
  });

  return {
    success: true,
    message: enabled
      ? "Administrator portal access allowed."
      : "Administrator restricted to the committee portal.",
    data: {
      userId,
      adminPortalAccess: admin.adminPortalAccess,
    },
  };
}



export async function updateAdmin(
  userId: string,
  data: UpdateAdminDto
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      admin: true,
    },
  });

  if (!user || !user.admin) {
    throw new Error("Administrator not found.");
  }

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existing) {
      throw new Error("Email already exists.");
    }
  }

  const updated = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      email: data.email,

      role: data.role,

      admin: {
        update: {
          fullName: data.fullName,

          phoneNumber: data.phoneNumber,
        },
      },
    },

    include: {
      admin: true,
    },
  });

  return {
    success: true,
    message: "Administrator updated successfully.",
    data: updated,
  };
}



export async function disableAdmin(
  userId: string,
  currentUserId: string
) {

 if (userId === currentUserId) {
    throw new Error(
        "You cannot disable your own account."
    );
}


  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("Administrator not found.");
  }

  if (user.role === "SUPER_ADMIN") {
    throw new Error(
      "Super Admin cannot be disabled."
    );
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: false,
    },
  });
}



export async function enableAdmin(
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("Administrator not found.");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: true,
    },
  });
}


export async function resetAdminPassword(
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("Administrator not found.");
  }

  const temporaryPassword =
    "CYON-" +
    randomBytes(3)
      .toString("hex")
      .toUpperCase();

  const passwordHash =
    await bcrypt.hash(
      temporaryPassword,
      10
    );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });

  return {
    success: true,
    message: "Password reset successfully.",
    temporaryPassword,
  };
}
