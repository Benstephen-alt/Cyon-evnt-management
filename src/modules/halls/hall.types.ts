export interface CreateHallDto {
  hostelId: string;

  hallName: string;

  totalBeds: number;
}

export interface UpdateHallDto {
  hallName?: string;

  totalBeds?: number;
}