export interface CreateManualParishRegistrationDto {
  parishId: string;
  presidentName: string;
  presidentPhone: string;
  totalDelegates: number;
}

export interface ManualParishRegistrationResponse {
  id: string;
  registrationCode: string;

  parishName: string;
  deaneryName: string;

  presidentName: string;
  presidentPhone: string;

  totalDelegates: number;
  delegatesOutside: number;

  amountPaid: number;

  createdAt: Date;
}