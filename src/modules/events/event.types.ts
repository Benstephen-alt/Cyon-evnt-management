export interface CreateEventDto {
  eventName: string;

  theme?: string;

  year: number;

  registrationFee: number;

  startDate: string;

  endDate: string;
}

export interface UpdateEventDto {
  eventName?: string;

  theme?: string;

  registrationFee?: number;

  startDate?: string;

  endDate?: string;

  registrationOpen?: boolean;

  isActive?: boolean;
}

export interface UpdateRegistrationStatusDto {
  registrationOpen: boolean;
}