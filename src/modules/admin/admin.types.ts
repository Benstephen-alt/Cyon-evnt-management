export interface ParishDetailsResponse {
  id: string;

  parishId: string;

  parishName: string;

  parishCode: string;

  accessCode: string;

  deaneryName: string;

  presidentName: string;

  presidentPhoneNumber: string;

  registrationStatus: string;

  receiptUrl: string | null;

  isActivated: boolean;

  delegateSubmissionLocked: boolean;

  approvedAt: Date | null;

  delegatesRegistered: number;

  maleDelegates: number;

  femaleDelegates: number;

  createdAt: Date;
}


export interface ParishListResponse {
  id: string;

  parishId: string;

  parishName: string;

  parishCode: string;

  accessCode: string;

  deaneryName: string;

  registrationStatus: string;

  isActivated: boolean;

  delegateSubmissionLocked: boolean;

  approvedAt: Date | null;

  delegatesRegistered: number;

  createdAt: Date;
}

export interface ResetAccessCodeResponse {
  parishId: string;
  accessCode: string;
}

export interface AdminDashboardResponse {
  event: {
    id: string;
    eventName: string;
    registrationOpen: boolean;
    delegateRegistrationDeadline: Date | null;
  };

  parishes: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };

  delegates: {
    total: number;
    male: number;
    female: number;
  };

  arrivals: {
    arrivedParishes: number;
    pendingParishes: number;
    arrivedDelegates: number;
    pendingDelegates: number;
  };

  accommodation: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
  };
}