import { z } from "zod";
import { VendorCategory } from "@prisma/client";

export const createVendorSchema =
  z.object({
    businessName: z
      .string()
      .trim()
      .min(2)
      .max(150),

    ownerName: z
      .string()
      .trim()
      .min(2)
      .max(150),

    phoneNumber: z
      .string()
      .trim()
      .min(11)
      .max(20),

    category: z.nativeEnum(
      VendorCategory
    ),

    description: z
      .string()
      .optional(),

    amountPaid: z.coerce
      .number()
      .positive(),

    remarks: z
      .string()
      .optional(),
  });


  export const updateVendorSchema =
  createVendorSchema.partial();