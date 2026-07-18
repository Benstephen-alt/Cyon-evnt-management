import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑 Deleting parish accounts...");

  await prisma.parishAccount.deleteMany();

  console.log("🗑 Deleting parish users...");

  await prisma.user.deleteMany({
    where: {
      role: UserRole.PARISH,
    },
  });

  console.log("✅ Parish accounts deleted successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });