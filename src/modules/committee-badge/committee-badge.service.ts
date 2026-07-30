import fs from "fs";
import path from "path";
import sharp from "sharp";
import prisma from "@/config/prisma";
import { AppError } from "@/shared/errors/AppError";
import { getActiveEvent } from "@/shared/services/event.service";
import { createSvgText } from "@/shared/utils/createSvgText";
import { COMMITTEE_BADGE_CONFIG as config } from "@/assets/committee-badge.config";
import {
  CreateCommitteeBadgeDto,
  UpdateCommitteeBadgeDto,
} from "./committee-badge.types";

const badgeInclude = {
  committee: {
    select: {
      id: true,
      committeeName: true,
    },
  },
  committeeMember: {
    include: {
      user: {
        select: {
          loginId: true,
          email: true,
        },
      },
    },
  },
  event: {
    select: {
      id: true,
      eventName: true,
      year: true,
    },
  },
} as const;

function normalizeName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length < 2 || normalized.length > 80) {
    throw new AppError(
      400,
      "Full name must contain between 2 and 80 characters.",
      "INVALID_FULL_NAME"
    );
  }

  return normalized;
}

async function validateAssignment(
  eventId: string,
  committeeMemberId: string,
  committeeId: string
) {
  const assignment =
    await prisma.committeeAssignment.findFirst({
      where: {
        committeeMemberId,
        committeeId,
        isActive: true,
        committee: {
          eventId,
        },
      },
    });

  if (!assignment) {
    throw new AppError(
      400,
      "The selected member is not assigned to this committee for the active event.",
      "INVALID_COMMITTEE_ASSIGNMENT"
    );
  }
}

export async function getBadgeOptions() {
  const event = await getActiveEvent();

  const [members, committees] = await Promise.all([
    prisma.committeeMember.findMany({
      where: {
        isActive: true,
        assignments: {
          some: {
            isActive: true,
            committee: {
              eventId: event.id,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            loginId: true,
            email: true,
          },
        },
        assignments: {
          where: {
            isActive: true,
            committee: {
              eventId: event.id,
            },
          },
          include: {
            committee: {
              select: {
                id: true,
                committeeName: true,
              },
            },
          },
        },
        badges: {
          where: {
            eventId: event.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.committee.findMany({
      where: {
        eventId: event.id,
      },
      select: {
        id: true,
        committeeName: true,
      },
      orderBy: {
        committeeName: "asc",
      },
    }),
  ]);

  return {
    event: {
      id: event.id,
      eventName: event.eventName,
      year: event.year,
    },
    committees,
    members: members.map((member) => ({
      id: member.id,
      loginId: member.user.loginId,
      email: member.user.email,
      hasBadge: member.badges.length > 0,
      committees: member.assignments.map(
        (assignment) => assignment.committee
      ),
    })),
  };
}

export async function createCommitteeBadge(
  data: CreateCommitteeBadgeDto
) {
  const event = await getActiveEvent();
  const fullName = normalizeName(data.fullName);

  await validateAssignment(
    event.id,
    data.committeeMemberId,
    data.committeeId
  );

  const existing = await prisma.committeeBadge.findUnique({
    where: {
      eventId_committeeMemberId: {
        eventId: event.id,
        committeeMemberId: data.committeeMemberId,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      "This committee member already has a badge for the active event.",
      "COMMITTEE_BADGE_EXISTS"
    );
  }

  return prisma.$transaction(async (transaction) => {
    const updatedEvent = await transaction.event.update({
      where: {
        id: event.id,
      },
      data: {
        committeeBadgeSequence: {
          increment: 1,
        },
      },
      select: {
        year: true,
        committeeBadgeSequence: true,
      },
    });

    const badgeNumber = [
      "CYON-CM",
      updatedEvent.year,
      String(updatedEvent.committeeBadgeSequence).padStart(4, "0"),
    ].join("-");

    return transaction.committeeBadge.create({
      data: {
        eventId: event.id,
        committeeId: data.committeeId,
        committeeMemberId: data.committeeMemberId,
        badgeNumber,
        fullName,
        photoUrl: data.photoUrl,
      },
      include: badgeInclude,
    });
  });
}

export async function listCommitteeBadges() {
  const event = await getActiveEvent();

  return prisma.committeeBadge.findMany({
    where: {
      eventId: event.id,
    },
    include: badgeInclude,
    orderBy: {
      badgeNumber: "asc",
    },
  });
}

export async function getCommitteeBadge(badgeId: string) {
  const event = await getActiveEvent();

  const badge = await prisma.committeeBadge.findFirst({
    where: {
      id: badgeId,
      eventId: event.id,
    },
    include: badgeInclude,
  });

  if (!badge) {
    throw new AppError(
      404,
      "Committee badge not found.",
      "COMMITTEE_BADGE_NOT_FOUND"
    );
  }

  return badge;
}

export async function updateCommitteeBadge(
  badgeId: string,
  data: UpdateCommitteeBadgeDto
) {
  const badge = await getCommitteeBadge(badgeId);

  if (data.committeeId) {
    await validateAssignment(
      badge.eventId,
      badge.committeeMemberId,
      data.committeeId
    );
  }

  return prisma.committeeBadge.update({
    where: {
      id: badge.id,
    },
    data: {
      committeeId: data.committeeId,
      fullName: data.fullName
        ? normalizeName(data.fullName)
        : undefined,
      photoUrl: data.photoUrl,
    },
    include: badgeInclude,
  });
}

export async function deleteCommitteeBadge(badgeId: string) {
  const badge = await getCommitteeBadge(badgeId);

  await prisma.committeeBadge.delete({
    where: {
      id: badge.id,
    },
  });

  return {
    success: true,
    message: "Committee badge deleted successfully.",
  };
}

function getTemplatePath(): string {
  const candidates = [
    path.resolve(
      process.cwd(),
      "dist/assets/committee-badge-template.jpg"
    ),
    path.resolve(
      process.cwd(),
      "src/assets/committee-badge-template.jpg"
    ),
  ];

  const templatePath = candidates.find(fs.existsSync);

  if (!templatePath) {
    throw new Error("Committee badge template is missing.");
  }

  return templatePath;
}

function getPhotoPath(photoUrl: string): string {
  const filename = path.basename(photoUrl);
  const photoPath = path.join(
    process.cwd(),
    "uploads",
    "committee-members",
    filename
  );

  if (!fs.existsSync(photoPath)) {
    throw new AppError(
      404,
      "Committee member photo is missing.",
      "COMMITTEE_PHOTO_NOT_FOUND"
    );
  }

  return photoPath;
}

function fontSizeFor(
  value: string,
  preferred: number
): number {
  if (value.length <= 22) return preferred;
  if (value.length <= 32) return Math.max(preferred - 3, 15);
  return Math.max(preferred - 5, 14);
}

async function createPhoto(photoUrl: string): Promise<Buffer> {
  const { width, height, radius } = config.photo;
  const photo = await sharp(getPhotoPath(photoUrl))
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position: "attention",
    })
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="${radius}" fill="white"/>
    </svg>`
  );

  const roundedPhoto = await sharp(photo)
    .composite([
      {
        input: mask,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: width + 8,
      height: height + 8,
      channels: 4,
      background: "#173A25",
    },
  })
    .composite([
      {
        input: roundedPhoto,
        left: 4,
        top: 4,
      },
    ])
    .png()
    .toBuffer();
}

export async function generateCommitteeBadgeImage(
  badgeId: string
) {
  const badge = await getCommitteeBadge(badgeId);

  const [name, committee, badgeNumber, photo] =
    await Promise.all([
      createSvgText({
        text: badge.fullName,
        width: config.name.width,
        fontSize: fontSizeFor(
          badge.fullName,
          config.name.fontSize
        ),
        color: config.name.color,
      }),
      createSvgText({
        text: badge.committee.committeeName,
        width: config.committee.width,
        fontSize: fontSizeFor(
          badge.committee.committeeName,
          config.committee.fontSize
        ),
        color: config.committee.color,
      }),
      createSvgText({
        text: badge.badgeNumber,
        width: config.badgeNumber.width,
        fontSize: config.badgeNumber.fontSize,
        color: config.badgeNumber.color,
      }),
      createPhoto(badge.photoUrl),
    ]);

  return sharp(getTemplatePath())
    .resize(config.canvas.width, config.canvas.height)
    .composite([
      {
        input: name,
        left: config.name.x,
        top: config.name.y,
      },
      {
        input: committee,
        left: config.committee.x,
        top: config.committee.y,
      },
      {
        input: badgeNumber,
        left: config.badgeNumber.x,
        top: config.badgeNumber.y,
      },
      {
        input: photo,
        left: config.photo.x - 4,
        top: config.photo.y - 4,
      },
    ])
    .png()
    .toBuffer();
}
