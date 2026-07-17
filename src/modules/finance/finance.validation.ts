import { z } from "zod";
import {
  FundReleaseAuthority,
  ReceiptType,
  ExpenseCategory,
} from "@prisma/client";

export const createBudgetSchema = z.object({
  amount: z
    .coerce
    .number({
      required_error: "Budget amount is required.",
    })
    .positive("Budget amount must be greater than zero."),
});

export const updateBudgetSchema = z.object({
  amount: z
    .coerce
    .number({
      required_error: "Budget amount is required.",
    })
    .positive("Budget amount must be greater than zero."),
});


export const createFundReleaseSchema = z.object({
  authority: z.nativeEnum(
    FundReleaseAuthority
  ),

  committeeId: z
    .string()
    .uuid("Invalid committee ID."),

  committeeMemberId: z
    .string()
    .uuid("Invalid committee member ID."),

  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero."),

  receiptUrl: z.string().optional(),

  remarks: z.string().optional(),
});


export const createExpenseSchema = z.object({
  committeeId: z.string().uuid(),

  committeeMemberId: z.string().uuid(),

  expenseName: z
    .string()
    .trim()
    .min(2)
    .max(200),

  category: z
    .nativeEnum(ExpenseCategory),
    
  description: z
    .string()
    .trim()
    .min(2)
    .max(1000),

  amount: z
    .number()
    .positive(),

  receiptType: z.nativeEnum(
    ReceiptType
  ),

  receiptUrl: z
    .string()
    .optional(),
});

export const updateExpenseSchema = z.object({
  expenseName: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .optional(),

  category: z.nativeEnum(ExpenseCategory).optional(),

  description: z
    .string()
    .trim()
    .min(2)
    .max(1000)
    .optional(),

  amount: z
    .number()
    .positive()
    .optional(),

  receiptType: z
    .nativeEnum(ReceiptType)
    .optional(),

  receiptUrl: z
    .string()
    .optional(),
});


export const createCommitteeExpenseSchema = z.object({
  expenseName: z
    .string()
    .trim()
    .min(2)
    .max(200),

  description: z
    .string()
    .trim()
    .min(2)
    .max(1000),

  amount: z
    .number()
    .positive(),

  receiptType: z.nativeEnum(
    ReceiptType
  ),

  receiptUrl: z
    .string()
    .optional(),
});