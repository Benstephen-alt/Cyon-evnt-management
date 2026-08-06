export interface CreateManualParishRegistrationDto {
  parishId: string;
  presidentName: string;
  presidentPhone: string;
  maleDelegates: number;
  femaleDelegates: number;
}

export interface ManualParishRegistrationResponse {
  id: string;
  registrationCode: string;

  parishName: string;
  deaneryName: string;

  presidentName: string;
  presidentPhone: string;

  totalDelegates: number;
  maleDelegates: number;
  femaleDelegates: number;
  delegatesOutside: number;

  amountPaid: number;

  createdAt: Date;
}
