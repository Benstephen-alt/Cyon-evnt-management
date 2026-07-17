import { PrismaClient, PaymentStatus, UserRole } from "@prisma/client";
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
    const existing = await prisma.parishAccount.findFirst({
      where: {
        parishId: parish.id,
        eventId: event.id,
      },
    });

    if (existing) continue;

    const accessCodeHash = await hashPassword(parish.accessCode);

    const user = await prisma.user.create({
      data: {
        loginId: parish.accessCode,
        passwordHash: accessCodeHash,
        role: UserRole.PARISH,
      },
    });

    await prisma.parishAccount.create({
      data: {
        userId: user.id,
        parishId: parish.id,
        eventId: event.id,
        accessCodeHash,
        presidentName: "To be updated",
        presidentPhoneNumber: "00000000000",

        paymentStatus: PaymentStatus.APPROVED,

        isActivated: true,
      },
    });

    created++;
  }

  console.log(`✅ Created ${created} parish accounts`);
}