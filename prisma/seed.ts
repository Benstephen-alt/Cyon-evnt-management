import bcrypt from "bcrypt";
import prisma from "../src/config/prisma";

import { UserRole } from "@prisma/client";

import { DEFAULT_ADMIN } from "../src/config/defaultAdmin";
import { DEFAULT_EVENT } from "../src/config/defaultEvents";
import { DEFAULT_COMMITTEES } from "../src/config/defaultCommitees";
import { DEFAULT_HOSTELS } from "../src/config/defaultHostels";

/* ============================================================
   LOGGER
============================================================ */

function divider(title: string) {
  console.log("");
  console.log("===========================================");
  console.log(title);
  console.log("===========================================");
}

function success(message: string) {
  console.log(`✅ ${message}`);
}

function skip(message: string) {
  console.log(`⏭️ ${message}`);
}

function fail(message: string) {
  console.log(`❌ ${message}`);
}

/* ============================================================
   HELPERS
============================================================ */

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

/* ============================================================
   SUPER ADMIN
============================================================ */

async function seedSuperAdmin() {
  divider("SEEDING SUPER ADMIN");

  const existing = await prisma.user.findUnique({
    where: {
      email: DEFAULT_ADMIN.email,
    },
  });

  if (existing) {
    skip("Super Admin already exists.");

    return existing;
  }

  const passwordHash = await hashPassword(DEFAULT_ADMIN.password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: DEFAULT_ADMIN.email,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    await tx.admin.create({
      data: {
        userId: createdUser.id,
        fullName: DEFAULT_ADMIN.fullName,
        phoneNumber: DEFAULT_ADMIN.phoneNumber,
      },
    });

    return createdUser;
  });

  success("Super Admin created.");

  return user;
}

/* ============================================================
   DEFAULT EVENT
============================================================ */

async function seedDefaultEvent() {
  divider("SEEDING DEFAULT EVENT");

  const existing = await prisma.event.findFirst({
    where: {
      eventName: DEFAULT_EVENT.name,
    },
  });

  if (existing) {
    skip("Default event already exists.");

    return existing;
  }

  const event = await prisma.event.create({
    data: {
      eventName: DEFAULT_EVENT.name,

      theme: DEFAULT_EVENT.theme,

      year: DEFAULT_EVENT.year,

      registrationFee: DEFAULT_EVENT.registrationFee,

      startDate: DEFAULT_EVENT.startDate,

      endDate: DEFAULT_EVENT.endDate,

      registrationOpen: DEFAULT_EVENT.registrationOpen,

      isActive: DEFAULT_EVENT.isActive,
    },
  });

  success("Default event created.");

  return event;
}

/* ============================================================
   COMMITTEES
============================================================ */

async function seedCommittees(eventId: string) {
  divider("SEEDING COMMITTEES");

  let created = 0;
  let skipped = 0;

  for (const committee of DEFAULT_COMMITTEES) {
    const existing = await prisma.committee.findFirst({
      where: {
        eventId,
        committeeName: committee.name,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.committee.create({
      data: {
        eventId,
        committeeName: committee.name,
        description: committee.description,
        permissions: committee.permissions,
      },
    });

    created++;
  }

  success(`${created} committee(s) created.`);

  if (skipped > 0) {
    skip(`${skipped} committee(s) already existed.`);
  }
}

/* ============================================================
   HOSTELS
============================================================ */

async function seedHostels(eventId: string) {
  divider("SEEDING HOSTELS");

  let created = 0;
  let skipped = 0;

  for (const hostel of DEFAULT_HOSTELS) {
    let existingHostel = await prisma.hostel.findFirst({
      where: {
        eventId,
        hostelName: hostel.hostelName,
      },
    });

    if (!existingHostel) {
      existingHostel = await prisma.hostel.create({
        data: {
          eventId,
          hostelName: hostel.hostelName,
          gender: hostel.gender,
        },
      });

      created++;
    } else {
      skipped++;
    }

    await seedHalls(existingHostel.id, hostel.halls);
  }

  success(`${created} hostel(s) created.`);

  if (skipped > 0) {
    skip(`${skipped} hostel(s) already existed.`);
  }
}

/* ============================================================
   HALLS
============================================================ */

async function seedHalls(
  hostelId: string,
  halls: readonly {
    hallName: string;
    totalBeds: number;
  }[]
) {
  for (const hall of halls) {
    let existingHall = await prisma.hall.findFirst({
      where: {
        hostelId,
        hallName: hall.hallName,
      },
    });

    if (!existingHall) {
      existingHall = await prisma.hall.create({
        data: {
          hostelId,
          hallName: hall.hallName,
          totalBeds: hall.totalBeds,
        },
      });
    }

    await seedBeds(existingHall.id, hall.totalBeds);
  }
}

/* ============================================================
   BEDS
============================================================ */

async function seedBeds(
  hallId: string,
  totalBeds: number
) {
  const existingBeds = await prisma.bed.count({
    where: {
      hallId,
    },
  });

  if (existingBeds >= totalBeds) {
    return;
  }

  const beds = [];

  for (
    let number = existingBeds + 1;
    number <= totalBeds;
    number++
  ) {
    beds.push({
      hallId,
      bedNumber: number,
      isOccupied: false,
    });
  }

  if (beds.length === 0) {
    return;
  }

  await prisma.bed.createMany({
    data: beds,
  });

  success(`${beds.length} bed(s) created.`);
}

/* ============================================================
   MAIN
============================================================ */

async function main() {
  divider("CYON EVENT MANAGEMENT DATABASE SEEDER");

  try {
    // Seed Super Admin
    await seedSuperAdmin();

    // Seed Default Event
    const event = await seedDefaultEvent();

    // Seed Committees
    await seedCommittees(event.id);

    // Seed Accommodation Structure
    await seedHostels(event.id);

    divider("SEED COMPLETED");

    success("Database seeded successfully.");
  } catch (error) {
    fail("Database seeding failed.");

    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();