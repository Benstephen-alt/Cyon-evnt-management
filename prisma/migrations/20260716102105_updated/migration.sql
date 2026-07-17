/*
  Warnings:

  - The values [WELFARE,TRANSPORTATION,FEEDING,SECURITY,OTHERS] on the enum `ExpenseCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseCategory_new" AS ENUM ('FOOD', 'TRANSPORT', 'ACCOMMODATION', 'MEDICAL', 'PUBLICITY', 'PRINTING', 'EQUIPMENT', 'LABOUR', 'FUEL', 'UTILITY', 'MISC');
ALTER TABLE "Expense" ALTER COLUMN "category" TYPE "ExpenseCategory_new" USING ("category"::text::"ExpenseCategory_new");
ALTER TYPE "ExpenseCategory" RENAME TO "ExpenseCategory_old";
ALTER TYPE "ExpenseCategory_new" RENAME TO "ExpenseCategory";
DROP TYPE "public"."ExpenseCategory_old";
COMMIT;
