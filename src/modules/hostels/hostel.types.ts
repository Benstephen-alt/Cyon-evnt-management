export interface CreateHostelDto {
  hostelName: string;
  gender: "MALE" | "FEMALE";
}

export interface UpdateHostelDto {
  hostelName?: string;
  gender?: "MALE" | "FEMALE";
}