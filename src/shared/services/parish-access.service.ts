import prisma from "@/config/prisma";
import { RegistrationStatus } from "@prisma/client";
import { getActiveEvent } from "@/shared/services/event.service";

interface ValidateParishAccessOptions {
  requireUnlockedSubmission?: boolean;
}

export async function validateParishAccess(
  userId: string,
  options: ValidateParishAccessOptions = {}
) {
  const event = await getActiveEvent();

  const account = await prisma.parishAccount.findUnique({
    where: {
      userId,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
    },
  });

  if (!account) {
    throw new Error("Parish account not found.");
  }

  if (!account.isActivated) {
    throw new Error("Please complete your parish registration.");
  }

  if (
    account.registrationStatus !== RegistrationStatus.APPROVED
  ) {
    throw new Error(
      "Your registration has not been approved yet."
    );
  }

  if (
    options.requireUnlockedSubmission &&
    account.delegateSubmissionLocked
  ) {
    throw new Error(
      "Delegate submission has been locked."
    );
  }

  if (!event.registrationOpen) {
    throw new Error(
      "Delegate registration is currently closed."
    );
  }

  if (
    event.delegateRegistrationDeadline &&
    new Date() > event.delegateRegistrationDeadline
  ) {
    throw new Error(
      "Delegate registration deadline has passed."
    );
  }

  return {
    account,
    event,
  };
}