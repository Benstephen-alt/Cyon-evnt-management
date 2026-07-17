import prisma from "@/config/prisma";
import { CreateEventDto } from "./event.types";
import { UpdateEventDto } from "./event.types";
import { UpdateRegistrationStatusDto } from "./event.types";

export async function createEvent(
  data: CreateEventDto
) {
  // Ensure year is unique
  const existing = await prisma.event.findFirst({
    where: {
      year: data.year,
    },
  });

  if (existing) {
    throw new Error(
      `An event already exists for ${data.year}.`
    );
  }

  // Only one active event
  await prisma.event.updateMany({
    where: {
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  const event = await prisma.event.create({
    data: {
      eventName: data.eventName,

      theme: data.theme,

      year: data.year,

      registrationFee: data.registrationFee,

      startDate: new Date(data.startDate),

      endDate: new Date(data.endDate),

      registrationOpen: true,

      isActive: true,
    },
  });

  return {
    success: true,
    message: "Event created successfully.",
    event,
  };
}

export async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: {
      year: "desc",
    },
  });

  return {
    success: true,
    total: events.length,
    events,
  };
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  return {
    success: true,
    event,
  };
}



export async function updateEvent(
  id: string,
  data: UpdateEventDto
) {
  const existing = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Event not found.");
  }

  const event = await prisma.event.update({
    where: {
      id,
    },
    data: {
      eventName: data.eventName,
      theme: data.theme,
      registrationFee: data.registrationFee,
      registrationOpen: data.registrationOpen,
      isActive: data.isActive,
      startDate: data.startDate
        ? new Date(data.startDate)
        : undefined,
      endDate: data.endDate
        ? new Date(data.endDate)
        : undefined,
    },
  });

  return {
    success: true,
    message: "Event updated successfully.",
    event,
  };
}


export async function activateEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  // Deactivate all events
  await prisma.event.updateMany({
    where: {
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Activate selected event
  const updatedEvent = await prisma.event.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
  });

  return {
    success: true,
    message: "Event activated successfully.",
    event: updatedEvent,
  };
}

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




export async function updateRegistrationStatus(
  id: string,
  data: UpdateRegistrationStatusDto
) {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  const updated = await prisma.event.update({
    where: {
      id,
    },
    data: {
      registrationOpen: data.registrationOpen,
    },
  });

  return {
    success: true,
    message: data.registrationOpen
      ? "Registration opened successfully."
      : "Registration closed successfully.",
    event: updated,
  };
}