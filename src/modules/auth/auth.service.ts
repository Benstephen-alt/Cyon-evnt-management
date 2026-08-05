import { UserRole } from "@prisma/client";

import prisma from "../../config/prisma";
import { comparePassword } from "../../shared/utils/password";
import { generateToken } from "../../shared/utils/jwt";
import { CommitteeLoginDto } from "./auth.types";
import {
    LoginRequest,
    LoginResponse,
} from "./auth.types";
import { AppError } from "@/shared/errors/AppError";

export class AuthService {

    static async adminLogin(
        data: LoginRequest
    ): Promise<LoginResponse> {

        const user = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
            include: {
                admin: true,
                committeeMember: true,
            },
        });

        if (!user || !user.admin) {
           throw new AppError(
  401,
  "Invalid email or password.",
  "INVALID_CREDENTIALS"
);
        }

        if (!user.isActive) {
            throw new AppError(
  403,
  "Account has been disabled.",
  "ACCOUNT_DISABLED"
);
        }

        if (
            user.role !== UserRole.SUPER_ADMIN &&
            user.role !== UserRole.ADMIN
        ) {
            throw new AppError(
  403,
  "Access denied.",
  "ACCESS_DENIED"
);
        }

        const passwordCorrect =
            await comparePassword(
                data.password,
                user.passwordHash
            );

        if (!passwordCorrect) {
           throw new AppError(
  401,
  "Invalid email or password.",
  "INVALID_CREDENTIALS"
);
        }

        if (
            user.role === UserRole.ADMIN &&
            !user.admin.adminPortalAccess
        ) {
            throw new AppError(
              403,
              "This account is restricted to the committee portal.",
              "ADMIN_PORTAL_RESTRICTED"
            );
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                lastLogin: new Date(),
            },
        });

        const token = generateToken({
            userId: user.id,
            role: user.role,
            portal: "ADMIN",
        });

        return {
            success: true,
            message: "Login successful.",
            token,

            admin: {
                id: user.admin.id,
                fullName: user.admin.fullName,
                email: user.email!,
                role: user.role,
            },
        };
    }




static async parishLogin(accessCode: string) {
  // Find the user by login ID
  const user = await prisma.user.findFirst({
    where: {
      loginId: accessCode,
      role: UserRole.PARISH,
    },
  });

  if (!user) {
    throw new Error("Invalid access code.");
  }

  // Find the parish account
  const parishAccount = await prisma.parishAccount.findFirst({
    where: {
      userId: user.id,
      isActivated: true,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
      event: true,
      user: true,
    },
  });

  if (!parishAccount) {
    throw new Error("Parish account not found.");
  }

  // Verify the access code against the stored hash
  const valid = await comparePassword(
    accessCode,
    parishAccount.accessCodeHash
  );

  if (!valid) {
    throw new Error("Invalid access code.");
  }

  const token = generateToken({
    userId: user.id,
    role: UserRole.PARISH,
    portal: "PARISH",
  });

  return {
    success: true,
    message: "Login successful.",
    token,
    parish: {
      id: parishAccount.parish.id,
      parishName: parishAccount.parish.parishName,
      deanery: parishAccount.parish.deanery.name,
      presidentName: parishAccount.presidentName,
    },
  };

 };


static async committeeLogin(
  data: CommitteeLoginDto
): Promise<any> {
  const user = await prisma.user.findUnique({
  where: {
    email: data.email,
  },
  include: {
    committeeMember: {
      include: {
        assignments: {
          include: {
            committee: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    },
  },
});

  if (!user || !user.committeeMember) {
    throw new AppError(
  401,
  "Invalid email or password.",
  "INVALID_CREDENTIALS"
);
  }

  if (!user.isActive) {
    throw new AppError(
  403,
  "Account has been disabled.",
  "ACCOUNT_DISABLED"
);
  }

  if (!user.committeeMember) {
  throw new AppError(
  403,
  "Access denied.",
  "ACCESS_DENIED"
);
}

  if (!user.committeeMember.isActive) {
    throw new AppError(
    403,
    "Committee member account has been disabled.",
    "COMMITTEE_ACCOUNT_DISABLED"
  );
  }

  const passwordCorrect = await comparePassword(
    data.password,
    user.passwordHash
  );

  if (!passwordCorrect) {
    throw new AppError(
  401,
  "Invalid email or password.",
  "INVALID_CREDENTIALS"
);
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLogin: new Date(),
    },
  });

  const token = generateToken({
    userId: user.id,
    role: user.role,
    portal: "COMMITTEE",
  });

  return {
  success: true,
  message: "Login successful.",
  token,

  committee: {
    id: user.committeeMember.id,
    email: user.email!,
    loginId: user.loginId,
    role: user.role,
    isActive: user.committeeMember.isActive,

    committees:
      user.committeeMember.assignments.map(
        (assignment) => ({
          id: assignment.committee.id,
          committeeName:
            assignment.committee.committeeName,
          permissions:
            assignment.committee.permissions,
        })
      ),
  },
};
};}
