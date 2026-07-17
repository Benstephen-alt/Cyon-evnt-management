import { IncomeSource } from "@prisma/client";

export interface CreateIncomeDto {
  source: IncomeSource;

  payerName: string;

  amount: number;

  receiptUrl?: string;

  remarks?: string;
}


export interface UpdateIncomeDto extends CreateIncomeDto {}