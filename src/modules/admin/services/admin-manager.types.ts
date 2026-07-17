import { UserRole } from "@prisma/client";

export interface CreateAdminDto {
  fullName: string;

  email: string;

  phoneNumber?: string;

  password: string;

  role: UserRole;
}

export interface UpdateAdminDto {
  fullName?: string;

  email?: string;

  phoneNumber?: string;

  role?: UserRole;
}

export interface ResetAdminPasswordResponse {
  temporaryPassword: string;
}

export interface AdminListResponse {
  id: string;

  fullName: string;

  email: string;

  phoneNumber?: string;

  role: UserRole;

  isActive: boolean;

  createdAt: Date;
}