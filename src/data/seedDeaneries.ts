import prisma from "@/config/prisma";
import { generateAccessCode } from "@/shared/utils/accessCode";
import { nsukkaDiocese } from "./nsukka-diocese";

export async function seedDeaneries(eventId: string) {
  let parishCount = 0;
  let parishCodeCounter = 1;

  for (const deanery of nsukkaDiocese) {
    let existingDeanery = await prisma.deanery.findFirst({
      where: {
        eventId,
        name: deanery.name,
      },
    });

    if (!existingDeanery) {
      existingDeanery = await prisma.deanery.create({
        data: {
          name: deanery.name,
          eventId,
        },
      });
    }

    for (const parish of deanery.parishes) {
      const existingParish = await prisma.parish.findFirst({
        where: {
          deaneryId: existingDeanery.id,
          parishName: parish.parishName,
        },
      });

      if (existingParish) {
        continue;
      }

      await prisma.parish.create({
        data: {
          parishCode: `PAR-${String(parishCodeCounter).padStart(4, "0")}`,
          parishName: parish.parishName,
          accessCode: generateAccessCode(),
          deaneryId: existingDeanery.id,
        },
      });

      parishCodeCounter++;
      parishCount++;
    }
  }

  console.log(`✅ Seeded ${nsukkaDiocese.length} deaneries`);
  console.log(`✅ Seeded ${parishCount} new parishes`);
}