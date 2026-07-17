export interface CreateCommitteeMemberDto {
  userId: string;
}

export interface UpdateCommitteeMemberDto {
  isActive?: boolean;
}

export interface CommitteeMemberResponse {
  id: string;

  userId: string;

  loginId: string;

  email: string;

  role: string;

  isActive: boolean;

  totalAssignments: number;

  createdAt: Date;
}