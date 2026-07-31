import prisma from "@/config/prisma";
import { seedParishAccounts } from "@/data/seedParishAccounts";

async function main() {

  await seedParishAccounts();

}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });