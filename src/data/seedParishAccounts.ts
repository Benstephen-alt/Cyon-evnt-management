import {
  PrismaClient,
  PaymentStatus,
  RegistrationStatus,
  UserRole,
} from "@prisma/client";
import { hashPassword } from "@/shared/utils/password";

const prisma = new PrismaClient();

export async function seedParishAccounts() {
  const event = await prisma.event.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!event) {
    throw new Error("No active event found.");
  }

  const parishes = await prisma.parish.findMany();

  let created = 0;

  for (const parish of parishes) {
    const existingAccount = await prisma.parishAccount.findFirst({
      where: {
        parishId: parish.id,
        eventId: event.id,
      },
    });

    if (existingAccount) continue;

    const accessCodeHash = await hashPassword(parish.accessCode);

    // Reuse existing user if it already exists
    let user = await prisma.user.findUnique({
      where: {
        loginId: parish.accessCode,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          loginId: parish.accessCode,
          passwordHash: accessCodeHash,
          role: UserRole.PARISH,
        },
      });
    }

    await prisma.parishAccount.create({
      data: {
        userId: user.id,
        parishId: parish.id,
        eventId: event.id,

        accessCodeHash,

        // Registration has not started
        presidentName: "",
        presidentPhoneNumber: "",
        receiptUrl: null,

        paymentStatus: PaymentStatus.PENDING,
        registrationStatus:
          RegistrationStatus.NOT_SUBMITTED,

        isActivated: false,
      },
    });

    created++;
  }

  console.log(`✅ Created ${created} parish accounts`);
}