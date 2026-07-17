import prisma from "@/config/prisma";

export async function generateDelegateNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();

  const lastDelegate = await prisma.delegate.findFirst({
    where: {
      event: {
        year: currentYear,
      },
    },
    orderBy: {
      delegateNumber: "desc",
    },
    select: {
      delegateNumber: true,
    },
  });

  let nextNumber = 1;

  if (lastDelegate) {
    const lastSequence = parseInt(
      lastDelegate.delegateNumber.split("-").pop() || "0",
      10
    );

    nextNumber = lastSequence + 1;
  }

  return `CYON-${currentYear}-${nextNumber
    .toString()
    .padStart(6, "0")}`;
}