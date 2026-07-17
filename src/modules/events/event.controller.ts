import { Request, Response } from "express";
import * as eventService from "./event.service";

export async function createEvent(
  req: Request,
  res: Response
) {
  try {
    const result = await eventService.createEvent(req.body);

    return res.status(201).json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function getEvents(
  req: Request,
  res: Response
) {
  try {
    const result = await eventService.getEvents();

    return res.json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getEventById(
  req: Request,
  res: Response
) {
  try {
    const result = await eventService.getEventById(
      req.params.id as string
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateEvent(
  req: Request,
  res: Response
) {
  try {
    const result = await eventService.updateEvent(
      req.params.id as string,
      req.body
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function activateEvent(
  req: Request,
  res: Response
) {
  try {
    const result = await eventService.activateEvent(
      req.params.id as string
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateRegistrationStatus(
  req: Request,
  res: Response
) {
  try {
    const result = await eventService.updateRegistrationStatus(
      req.params.id as string,
      req.body
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}




export async function getActiveEvent(
  _req: Request,
  res: Response,
  
) {

  try {
    const event = await eventService.getActiveEvent();


    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error(error);
   
  }
}