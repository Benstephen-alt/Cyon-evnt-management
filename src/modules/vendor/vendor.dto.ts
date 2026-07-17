import { VendorCategory } from "@prisma/client";

export interface CreateVendorDto {
  businessName: string;

  ownerName: string;

  phoneNumber: string;

  category: VendorCategory;

  description?: string;

  amountPaid: number;

  remarks?: string;
}


export interface UpdateVendorDto {
  businessName?: string;

  ownerName?: string;

  phoneNumber?: string;

  category?: VendorCategory;

  description?: string;

  amountPaid?: number;

  remarks?: string;
}