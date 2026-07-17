import prisma from "@/config/prisma";
import { seedDeaneries } from "@/data/seedDeaneries";

async function main() {
  const event = await prisma.event.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!event) {
    throw new Error("No active event found.");
  }

  console.log(`🌱 Seeding deaneries for: ${event.eventName}`);

  await seedDeaneries(event.id);

  console.log("✅ Deaneries and parishes seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });