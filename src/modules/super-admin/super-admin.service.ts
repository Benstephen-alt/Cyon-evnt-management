import prisma from "@/config/prisma";
import { getActiveEvent } from "@/shared/services";
import { RegistrationStatus } from "@prisma/client";

export async function getManagedParishes() {
  const event = await getActiveEvent();
  const accounts = await prisma.parishAccount.findMany({
    where: { eventId: event.id, registrationStatus: RegistrationStatus.APPROVED, isSuperAdminManaged: true },
    include: { parish: { include: { deanery: true } }, incomeRecord: true },
    orderBy: { approvedAt: "desc" },
  });
  const parishes = accounts.map((account) => ({
    accountId: account.id,
    parishId: account.parishId,
    parishName: account.parish.parishName,
    deanery: account.parish.deanery.name,
    presidentName: account.presidentName,
    phoneNumber: account.presidentPhoneNumber,
    approvedAt: account.approvedAt,
    receiptUrl: account.receiptUrl,
    incomeAmount: Number(account.incomeRecord?.amount ?? 0),
  }));
  return {
    eventName: event.eventName,
    totalParishes: parishes.length,
    totalIncome: parishes.reduce((sum, parish) => sum + parish.incomeAmount, 0),
    parishes,
  };
}

export async function moveParish(accountId: string) {
  const event = await getActiveEvent();
  const account = await prisma.parishAccount.findFirst({ where: { id: accountId, eventId: event.id } });
  if (!account) throw new Error("Parish registration not found.");
  if (account.registrationStatus !== RegistrationStatus.APPROVED) throw new Error("Only an approved parish can be moved.");
  if (account.isSuperAdminManaged) throw new Error("Parish is already on the super admin page.");
  return prisma.parishAccount.update({ where: { id: account.id }, data: { isSuperAdminManaged: true } });
}

export async function restoreParish(accountId: string) {
  const event = await getActiveEvent();
  const account = await prisma.parishAccount.findFirst({
    where: { id: accountId, eventId: event.id, isSuperAdminManaged: true },
  });
  if (!account) throw new Error("Super admin parish record not found.");
  return prisma.parishAccount.update({ where: { id: account.id }, data: { isSuperAdminManaged: false } });
}
