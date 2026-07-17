export interface CreateDelegateDto {
  fullName: string;

  gender: "MALE" | "FEMALE";

  dateOfBirth?: string;

  age?: number;

  phoneNumber: string;

  occupation?: string;

  address?: string;

  photoUrl: string;
}

export interface UpdateDelegateDto {
  fullName?: string;

  gender?: "MALE" | "FEMALE";

  dateOfBirth?: string;

  age?: number;

  phoneNumber?: string;

  photoUrl?: string;
}