import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.parishAccount.deleteMany();


  await prisma.user.deleteMany({
    where: {
      role: UserRole.PARISH,
    },
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });