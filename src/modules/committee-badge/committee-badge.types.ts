export interface CreateCommitteeBadgeDto {
  committeeMemberId: string;
  committeeId: string;
  fullName: string;
  photoUrl: string;
}

export interface UpdateCommitteeBadgeDto {
  committeeId?: string;
  fullName?: string;
  photoUrl?: string;
}
