import prisma from "@/config/prisma";
import { seedParishAccounts } from "@/data/seedParishAccounts";

async function main() {
  console.log("🌱 Seeding parish accounts...");

  await seedParishAccounts();

  console.log("✅ Parish accounts seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });