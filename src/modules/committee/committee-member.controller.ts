import { Request, Response } from "express";
import * as committeeMemberService from "./committee-member.service";

export async function createCommitteeMember(
  req: Request,
  res: Response
) {
  try {
    const userIds = Array.isArray(req.body.userIds)
      ? req.body.userIds
      : req.body.userId
        ? [req.body.userId]
        : [];
    const members = await committeeMemberService.createCommitteeMembers(userIds);

    return res.status(201).json({
      success: true,
      message: `${members.length} committee member${members.length === 1 ? "" : "s"} created successfully.`,
      data: members.length === 1 ? members[0] : members,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCommitteeMembers(
  req: Request,
  res: Response
) {
  try {
    const members =
      await committeeMemberService.getCommitteeMembers();

    return res.json({
      success: true,
      total: members.length,
      data: members,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCommitteeMemberById(
  req: Request,
  res: Response
) {
  try {
    const member =
      await committeeMemberService.getCommitteeMemberById(
        req.params.memberId as string
      );

    return res.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateCommitteeMember(
  req: Request,
  res: Response
) {
  try {
    const member =
      await committeeMemberService.updateCommitteeMember(
        req.params.memberId as string,
        req.body
      );

    return res.json({
      success: true,
      message: "Committee member updated successfully.",
      data: member,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteCommitteeMember(
  req: Request,
  res: Response
) {
  try {
    const result =
      await committeeMemberService.deleteCommitteeMember(
        req.params.memberId as string
      );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
