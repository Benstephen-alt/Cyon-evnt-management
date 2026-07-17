export interface CreateCommitteeAssignmentDto {
  committeeId: string;

  committeeMemberId: string;
}

export interface UpdateCommitteeAssignmentDto {
  isActive?: boolean;
}