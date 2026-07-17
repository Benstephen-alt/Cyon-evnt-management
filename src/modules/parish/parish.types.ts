export interface ParishLoginDto {
  accessCode: string;
}

export interface ParishRegistrationDto {
  presidentName: string;
  presidentPhoneNumber: string;
}

export interface ParishDashboardResponse {
  parishName: string;
  deaneryName: string;

  status: string;

  paymentStatus: string;

  delegatesRegistered: number;

  announcements: number;

  complaints: number;
}

export interface ParishLoginRequest {
  accessCode: string;
}