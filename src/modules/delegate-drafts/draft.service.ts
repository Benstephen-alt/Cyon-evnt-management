import prisma from "@/config/prisma";
import { validateParishAccess } from "@/shared/services/parish-access.service";
import { createDelegate } from "@/modules/delegates";
import {
  CreateDraftRequest,
  UpdateDraftRequest,
} from "./draft.types";


function normalizeDraftData(
  data: CreateDraftRequest | UpdateDraftRequest
) {
  return {
    fullName: data.fullName?.trim() ?? "",

    gender:
      data.gender === "MALE" ||
      data.gender === "FEMALE"
        ? data.gender
        : "MALE",

    age:
      data.age 
        ?? null,
       

    phoneNumber: data.phoneNumber?.trim() ?? "",

    photoUrl: data.photoUrl ?? "",
  };
}




export async function createDraft(
  data: CreateDraftRequest,
  userId: string
) {
  const { account, event } =
    await validateParishAccess(userId, {
      requireUnlockedSubmission: true,
    });

  return prisma.delegateDraft.create({
    data: {
      ...normalizeDraftData(data),

      parishId: account.parishId,
      deaneryId: account.parish.deaneryId,
      eventId: event.id,
      createdByUserId: userId,
    },
  });
}

export async function getDrafts(
  userId: string
) {
  const { account, event } =
    await validateParishAccess(userId);

  return prisma.delegateDraft.findFirst({
    where: {
      createdByUserId: userId,
      parishId: account.parishId,
      eventId: event.id,
    },
  });
}

export async function updateDraft(
  data: UpdateDraftRequest,
  userId: string
) {
  const { account, event } =
    await validateParishAccess(userId, {
      requireUnlockedSubmission: true,
    });

  const draft =
    await prisma.delegateDraft.findFirst({
      where: {
        createdByUserId: userId,
        parishId: account.parishId,
        eventId: event.id,
      },
    });

  const normalizedData =
    normalizeDraftData(data);

  if (!draft) {
    return prisma.delegateDraft.create({
      data: {
        ...normalizedData,

        parishId: account.parishId,
        deaneryId: account.parish.deaneryId,
        eventId: event.id,
        createdByUserId: userId,
      },
    });
  }

  return prisma.delegateDraft.update({
    where: {
      id: draft.id,
    },
    data: normalizedData,
  });
}

export async function deleteDraft(
  userId: string
) {
  const { account, event } =
    await validateParishAccess(userId, {
      requireUnlockedSubmission: true,
    });

  const draft =
    await prisma.delegateDraft.findFirst({
      where: {
        createdByUserId: userId,
        parishId: account.parishId,
        eventId: event.id,
      },
    });

  if (!draft) {
    throw new Error("No active draft found.");
  }

  await prisma.delegateDraft.delete({
    where: {
      id: draft.id,
    },
  });

  return {
    success: true,
    message: "Draft deleted successfully.",
  };
}

export async function submitDraft(
  userId: string
) {
  const { account, event } =
    await validateParishAccess(userId, {
      requireUnlockedSubmission: true,
    });

  const draft =
    await prisma.delegateDraft.findFirst({
      where: {
        createdByUserId: userId,
        parishId: account.parishId,
        eventId: event.id,
      },
    });

  if (!draft) {
    throw new Error("No active draft found.");
  }

  return prisma.$transaction(async (tx) => {
    const delegate =
      await createDelegate(
        {
          fullName: draft.fullName,
          gender: draft.gender,
          age: draft.age ?? undefined,
          phoneNumber: draft.phoneNumber,
          photoUrl: draft.photoUrl,
        },
        userId,
        tx
      );

    await tx.delegateDraft.delete({
      where: {
        id: draft.id,
      },
    });

    // Prepare the next registration immediately
    await tx.delegateDraft.create({
      data: {
        fullName: "",
        gender: "MALE",
        age: null,
        phoneNumber: "",
        photoUrl: "",

        createdByUserId: userId,
        parishId: account.parishId,
        deaneryId: account.parish.deaneryId,
        eventId: event.id,
      },
    });

    return {
      success: true,
      message:
        "Delegate submitted successfully.",

      delegate: {
        id: delegate.id,
        delegateNumber:
          delegate.delegateNumber,
        fullName: delegate.fullName,
        parishName:
          delegate.parishName,
        deaneryName:
          delegate.deaneryName,
      },
    };
  });
}