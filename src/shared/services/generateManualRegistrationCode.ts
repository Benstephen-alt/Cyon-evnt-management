import prisma from "@/config/prisma";

export const generateManualRegistrationCode = async (
  year: number
): Promise<string> => {
  const count = await prisma.manualParishRegistration.count();

  return `MPR-${year}-${String(count + 1).padStart(6, "0")}`;
};