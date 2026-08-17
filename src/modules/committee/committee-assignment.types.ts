export interface CreateCommitteeAssignmentDto {
  committeeId: string;
  committeeMemberId?: string;
  committeeMemberIds?: string[];
}

export interface UpdateCommitteeAssignmentDto {
  isActive?: boolean;
}
