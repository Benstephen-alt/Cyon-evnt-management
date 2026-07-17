export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}


export interface CommitteeLoginDto {
  email: string;
  password: string;
}