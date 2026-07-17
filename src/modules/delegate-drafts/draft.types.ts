export interface CreateDraftRequest {
    fullName: string;
    gender: "MALE" | "FEMALE";
    age?: number;
    phoneNumber: string;
    photoUrl: string;
}

export interface UpdateDraftRequest
    extends Partial<CreateDraftRequest> {}