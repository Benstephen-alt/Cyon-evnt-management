import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.parishAccount.updateMany({
    data: {
      presidentName: "",
      presidentPhoneNumber: "",
      receiptUrl: null,
      registrationStatus: "PENDING",
      approvedAt: null,
      delegateSubmissionLocked: false,
    },
  });

  console.log("✅ Parish accounts reset successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());