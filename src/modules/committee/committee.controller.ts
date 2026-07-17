import { Request, Response } from "express";
import * as committeeService from "./committee.service";

export async function createCommittee(
  req: Request,
  res: Response
) {
  try {
    const committee =
      await committeeService.createCommittee(req.body);

    return res.status(201).json({
      success: true,
      message: "Committee created successfully.",
      data: committee,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCommittees(
  req: Request,
  res: Response
) {
  try {
    const committees =
      await committeeService.getCommittees();

    return res.json({
      success: true,
      total: committees.length,
      data: committees,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCommitteeById(
  req: Request,
  res: Response
) {
  try {
    const committee =
      await committeeService.getCommitteeById(
        req.params.committeeId as string
      );

    return res.json({
      success: true,
      data: committee,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateCommittee(
  req: Request,
  res: Response
) {
  try {
    const committee =
      await committeeService.updateCommittee(
        req.params.committeeId as string,
        req.body
      );

    return res.json({
      success: true,
      message: "Committee updated successfully.",
      data: committee,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteCommittee(
  req: Request,
  res: Response
) {
  try {
    const result =
      await committeeService.deleteCommittee(
        req.params.committeeId as string
      );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function getAvailableCommitteeUsers(
  req: Request,
  res: Response
) {
  try {
    const users =
      await committeeService.getAvailableCommitteeUsers();

    return res.json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}