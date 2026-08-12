import { ExpenseCategory, FeedingRequestStatus, ReceiptType } from "@prisma/client";
import prisma from "@/config/prisma";
import { AppError } from "@/shared/errors/AppError";
import { getActiveEvent } from "../events";
import { sendFeedingRequestTelegramNotification } from "../telegram/telegram.service";

const profileSelect = {
  id: true, fullName: true, committeeName: true, bankName: true,
  accountNumber: true, createdAt: true,
} as const;

const requestInclude = {
  feedingProfile: { select: profileSelect },
  reviewedBy: { select: { admin: { select: { fullName: true } } } },
  expense: { select: { id: true, amount: true, createdAt: true } },
} as const;

const FEEDING_REQUEST_AMOUNT = 1_000;

async function getFeedingCommittee(eventId: string) {
  const committee = await prisma.committee.findFirst({
    where: {
      eventId,
      committeeName: { equals: "Feeding", mode: "insensitive" },
    },
    select: { id: true, committeeName: true },
  });
  if (!committee) {
    throw new AppError(404, "Feeding committee has not been created for the active event.", "FEEDING_COMMITTEE_NOT_FOUND");
  }
  return committee;
}

const publicRequestInclude = {
  feedingProfile: {
    select: { id: true, fullName: true, committeeName: true },
  },
  reviewedBy: { select: { admin: { select: { fullName: true } } } },
} as const;

function lagosDayRange(now = new Date()) {
  const lagosNow = new Date(now.getTime() + 3_600_000);
  const start = new Date(Date.UTC(
    lagosNow.getUTCFullYear(), lagosNow.getUTCMonth(), lagosNow.getUTCDate()
  ) - 3_600_000);
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

async function getMember(userId: string) {
  const member = await prisma.committeeMember.findUnique({
    where: { userId },
    include: {
      feedingProfile: { select: profileSelect },
      assignments: {
        where: { isActive: true },
        include: { committee: { select: { committeeName: true } } },
      },
    },
  });
  if (!member?.isActive) {
    throw new AppError(403, "Active committee membership is required.", "COMMITTEE_ACCESS_REQUIRED");
  }
  return member;
}

export async function getCommitteeDashboard(userId: string) {
  const [member, event] = await Promise.all([getMember(userId), getActiveEvent()]);
  const { start, end } = lagosDayRange();
  const requests = await prisma.feedingRequest.findMany({
    where: { eventId: event.id, requestedAt: { gte: start, lt: end } },
    include: publicRequestInclude,
    orderBy: { requestedAt: "desc" },
  });
  const ownCount = member.feedingProfile
    ? requests.filter((item) => item.feedingProfileId === member.feedingProfile!.id).length
    : 0;
  return {
    success: true,
    data: {
      event: { id: event.id, eventName: event.eventName },
      profile: member.feedingProfile,
      committeeOptions: [...new Set(member.assignments
        .map((item) => item.committee.committeeName)
        .filter((name) => name.toLowerCase() !== "feeding"))],
      requests,
      ownRequestsToday: ownCount,
      remainingRequestsToday: Math.max(0, 2 - ownCount),
    },
  };
}

export async function createProfile(userId: string, input: {
  fullName: string; committeeName: string; bankName: string; accountNumber: string;
}) {
  const member = await getMember(userId);
  if (member.feedingProfile) {
    throw new AppError(409, "Feeding details have already been submitted.", "FEEDING_PROFILE_EXISTS");
  }
  const values = {
    fullName: String(input.fullName ?? "").trim(),
    committeeName: String(input.committeeName ?? "").trim(),
    bankName: String(input.bankName ?? "").trim(),
    accountNumber: String(input.accountNumber ?? "").trim(),
  };
  if (Object.values(values).some((value) => !value)) {
    throw new AppError(400, "Name, committee, bank name and account number are required.", "VALIDATION_ERROR");
  }
  const profile = await prisma.feedingProfile.create({
    data: { committeeMemberId: member.id, ...values }, select: profileSelect,
  });
  return { success: true, message: "Feeding details submitted successfully.", data: profile };
}

export async function requestFeeding(userId: string) {
  const [member, event] = await Promise.all([getMember(userId), getActiveEvent()]);
  if (!member.feedingProfile) {
    throw new AppError(400, "Submit your feeding details before requesting feeding.", "FEEDING_PROFILE_REQUIRED");
  }
  const { start, end } = lagosDayRange();
  const count = await prisma.feedingRequest.count({
    where: { feedingProfileId: member.feedingProfile.id, requestedAt: { gte: start, lt: end } },
  });
  if (count >= 2) {
    throw new AppError(429, "You have reached the limit of 2 feeding requests for today.", "DAILY_FEEDING_LIMIT_REACHED");
  }
  const request = await prisma.feedingRequest.create({
    data: { eventId: event.id, feedingProfileId: member.feedingProfile.id },
    include: requestInclude,
  });
  let telegramNotified = true;
  try {
    await sendFeedingRequestTelegramNotification({
      requestId: request.id,
      fullName: member.feedingProfile.fullName,
      committeeName: member.feedingProfile.committeeName,
      bankName: member.feedingProfile.bankName,
      requestNumberToday: count + 1,
    });
  } catch {
    telegramNotified = false;
  }
  return { success: true, message: "Feeding request submitted successfully.", telegramNotified, data: request };
}

export async function getAdminDashboard() {
  const event = await getActiveEvent();
  const feedingCommittee = await getFeedingCommittee(event.id);
  const { start, end } = lagosDayRange();
  const [profiles, requests, activeRequests, released, spent, fundReleases] = await Promise.all([
    prisma.feedingProfile.findMany({ select: profileSelect, orderBy: { createdAt: "desc" } }),
    prisma.feedingRequest.findMany({
      where: { eventId: event.id, requestedAt: { gte: start, lt: end } },
      include: requestInclude, orderBy: { requestedAt: "desc" },
    }),
    prisma.feedingRequest.count({ where: { eventId: event.id, status: FeedingRequestStatus.PENDING } }),
    prisma.fundRelease.aggregate({
      where: { eventId: event.id, committeeId: feedingCommittee.id },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { eventId: event.id, committeeId: feedingCommittee.id },
      _sum: { amount: true },
    }),
    prisma.fundRelease.findMany({
      where: { eventId: event.id, committeeId: feedingCommittee.id },
      select: {
        id: true, amount: true, authority: true, recipientName: true,
        releasedAt: true, remarks: true, receiptUrl: true,
      },
      orderBy: { releasedAt: "desc" },
    }),
  ]);
  const totalReleased = Number(released._sum.amount ?? 0);
  const totalExpenses = Number(spent._sum.amount ?? 0);
  return {
    success: true,
    data: {
      event: { id: event.id, eventName: event.eventName },
      activeRequests,
      profiles,
      requests,
      finances: {
        committee: feedingCommittee,
        amountPerApprovedRequest: FEEDING_REQUEST_AMOUNT,
        totalReleased,
        totalExpenses,
        balance: totalReleased - totalExpenses,
        fundReleases: fundReleases.map((release) => ({
          ...release,
          amount: Number(release.amount),
        })),
      },
    },
  };
}

export async function reviewRequest(requestId: string, reviewerUserId: string,
  status: "APPROVED" | "REJECTED", rejectionReason?: string) {
  if (status === "REJECTED" && !rejectionReason?.trim()) {
    throw new AppError(400, "A rejection reason is required.", "REJECTION_REASON_REQUIRED");
  }
  const request = await prisma.$transaction(async (tx) => {
    const existing = await tx.feedingRequest.findUnique({
      where: { id: requestId },
      include: {
        feedingProfile: { select: { committeeMemberId: true, fullName: true } },
        expense: { select: { id: true } },
      },
    });
    if (!existing) throw new AppError(404, "Feeding request not found.", "FEEDING_REQUEST_NOT_FOUND");
    if (existing.status !== FeedingRequestStatus.PENDING || existing.expense) {
      throw new AppError(409, "This feeding request has already been reviewed.", "FEEDING_REQUEST_REVIEWED");
    }

    if (status === "APPROVED") {
      const committee = await tx.committee.findFirst({
        where: {
          eventId: existing.eventId,
          committeeName: { equals: "Feeding", mode: "insensitive" },
        },
        select: { id: true },
      });
      if (!committee) {
        throw new AppError(404, "Feeding committee has not been created for the active event.", "FEEDING_COMMITTEE_NOT_FOUND");
      }
      const [released, spent] = await Promise.all([
        tx.fundRelease.aggregate({
          where: { eventId: existing.eventId, committeeId: committee.id },
          _sum: { amount: true },
        }),
        tx.expense.aggregate({
          where: { eventId: existing.eventId, committeeId: committee.id },
          _sum: { amount: true },
        }),
      ]);
      const balance = Number(released._sum.amount ?? 0) - Number(spent._sum.amount ?? 0);
      if (balance < FEEDING_REQUEST_AMOUNT) {
        throw new AppError(
          400,
          `Insufficient Feeding committee funds. Available balance is ₦${balance.toLocaleString()}.`,
          "INSUFFICIENT_FEEDING_FUNDS"
        );
      }
      await tx.expense.create({
        data: {
          eventId: existing.eventId,
          committeeId: committee.id,
          committeeMemberId: existing.feedingProfile.committeeMemberId,
          category: ExpenseCategory.FOOD,
          amount: FEEDING_REQUEST_AMOUNT,
          description: `Feeding allowance approved for ${existing.feedingProfile.fullName}`,
          receiptType: ReceiptType.CASH,
          expenseName: "Approved feeding request",
          feedingRequestId: existing.id,
        },
      });
    }

    return tx.feedingRequest.update({
      where: { id: requestId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason!.trim() : null,
        reviewedAt: new Date(),
        reviewedByUserId: reviewerUserId,
      },
      include: requestInclude,
    });
  }, { isolationLevel: "Serializable" });
  return { success: true, message: `Feeding request ${status.toLowerCase()} successfully.`, data: request };
}

export async function clearRequestLogs() {
  const event = await getActiveEvent();
  const result = await prisma.$transaction(async (tx) => {
    const requestIds = await tx.feedingRequest.findMany({
      where: { eventId: event.id },
      select: { id: true },
    });
    const ids = requestIds.map((request) => request.id);
    if (ids.length) {
      await tx.expense.deleteMany({ where: { feedingRequestId: { in: ids } } });
    }
    return tx.feedingRequest.deleteMany({ where: { eventId: event.id } });
  });

  return {
    success: true,
    message: `${result.count} feeding request log${result.count === 1 ? "" : "s"} cleared successfully.`,
    data: { deletedCount: result.count },
  };
}
