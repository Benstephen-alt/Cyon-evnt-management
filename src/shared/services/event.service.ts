import prisma from "@/config/prisma";

export async function getActiveEvent() {
  const event = await prisma.event.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!event) {
    throw new Error("No active event found.");
  }

  return event;
}