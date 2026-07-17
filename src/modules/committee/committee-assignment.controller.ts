import { Request, Response } from "express";
import * as assignmentService from "./committee-assignment.service";

export async function createCommitteeAssignment(
  req: Request,
  res: Response
) {
  try {
    const result =
      await assignmentService.createCommitteeAssignment(
        req.body,
        req.user!.userId
      );

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCommitteeAssignments(
  req: Request,
  res: Response
) {
  try {
    const assignments =
      await assignmentService.getCommitteeAssignments();

    return res.json({
      success: true,
      total: assignments.length,
      data: assignments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function removeCommitteeAssignment(
  req: Request,
  res: Response
) {
  try {
    const result =
      await assignmentService.removeCommitteeAssignment(
        req.params.assignmentId as string
      );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}