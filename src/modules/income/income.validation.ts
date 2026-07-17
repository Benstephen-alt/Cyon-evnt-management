import { z } from "zod";
import { IncomeSource } from "@prisma/client";

export const createIncomeSchema = z.object({
  source: z.nativeEnum(IncomeSource),

  payerName: z.string().min(2),

  amount: z.number().positive(),

  receiptUrl: z.string().optional(),

  remarks: z.string().optional(),
});

export const updateIncomeSchema =
  createIncomeSchema;