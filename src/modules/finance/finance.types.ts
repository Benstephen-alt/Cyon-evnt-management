import { Decimal } from "@prisma/client/runtime/library";
import { FundReleaseAuthority, ReceiptType,  ExpenseCategory, } from "@prisma/client";
import {z} from "zod";


export const createBudgetSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Budget amount must be greater than zero."),
});


export type CreateBudgetDto =
  z.infer<
    typeof createBudgetSchema
  >;

export interface UpdateBudgetDto {
  amount:  number;
}

export interface FinanceDashboard {
  totalBudget: number;
  totalReleased: number;
  totalExpenses: number;
  remainingBalance: number;
  deficit: number;
}

export interface CreateFundReleaseDto {
  authority: FundReleaseAuthority;

  committeeId: string;

  committeeMemberId: string;

  amount: number;

  receiptUrl?: string;

  remarks?: string;
}


export interface UpdateExpenseDto {
  expenseName?: string;

  category?:  ExpenseCategory;

  description?: string;

  amount?: number;

  receiptType?: ReceiptType;

  receiptUrl?: string;
}


export interface CreateCommitteeExpenseDto {
  expenseName: string;

  description: string;

  amount: number;

  receiptType: ReceiptType;

  receiptUrl?: string;
}