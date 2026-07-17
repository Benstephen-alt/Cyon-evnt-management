import { CommitteePermission } from "@prisma/client";



export interface CreateCommitteeDto {
  committeeName: string;
  description?: string;
  permissions: CommitteePermission[];
}

export interface UpdateCommitteeDto {
  committeeName?: string;
  description?: string;
  permissions?: CommitteePermission[];
}

export interface CommitteeResponse {
  id: string;
  committeeName: string;
  description: string | null;
  permissions: CommitteePermission[];
  totalMembers: number;
  createdAt: Date;
  updatedAt: Date;
}