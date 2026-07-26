export interface SearchDelegateResponse {
  success: boolean;
  message: string;

  data: {
    delegate: {
      id: string;
      delegateNumber: string;
      fullName: string;
      gender: string;
      phoneNumber: string;
      photoUrl: string;
      parish: string;
      deanery: string;
    };

    accommodation: {
      hostel: string;
      hall: string;
      bedNumber: number;
    } | null;

    status: {
      registered: boolean;
      accommodated: boolean;
      parishArrived: boolean;
      checkedIn: boolean;

      outside: boolean;

      canGoOut: boolean;

      canReturn: boolean;
    };
  };
}


export interface AllowDelegateToGoOutDto {
  delegateId?: string;

  registrationId?: string;

  quantity?: number;

  remarks?: string;
}

export interface MarkDelegateReturnedDto {
  delegateId?: string;

  registrationId?: string;

  quantity?: number;
}




export interface SearchManualParishResponse {
  success: boolean;
  message: string;

  data: {
    registration: {
      id: string;
      registrationCode: string;

      parish: string;
      deanery: string;

      presidentName: string;
      presidentPhone: string;

      totalDelegates: number;
    };

    status: {
      delegatesInside: number;
      delegatesOutside: number;

      canGoOut: boolean;
      canReturn: boolean;
    };
  };
}