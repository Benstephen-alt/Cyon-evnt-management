/*
  Warnings:

  - A unique constraint covering the columns `[eventId,committeeName]` on the table `Committee` will be added. If there are existing duplicate values, this will fail.
  - Made the column `eventId` on table `Committee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommitteePermission" ADD VALUE 'CREATE_FUND_RELEASE';
ALTER TYPE "CommitteePermission" ADD VALUE 'VIEW_FUND_RELEASES';
ALTER TYPE "CommitteePermission" ADD VALUE 'DELETE_FUND_RELEASE';
ALTER TYPE "CommitteePermission" ADD VALUE 'CREATE_EXPENSE';
ALTER TYPE "CommitteePermission" ADD VALUE 'VIEW_EXPENSES';
ALTER TYPE "CommitteePermission" ADD VALUE 'UPDATE_EXPENSE';
ALTER TYPE "CommitteePermission" ADD VALUE 'DELETE_EXPENSE';

-- DropForeignKey
ALTER TABLE "Committee" DROP CONSTRAINT "Committee_eventId_fkey";

-- DropIndex
DROP INDEX "Committee_committeeName_key";

-- AlterTable
ALTER TABLE "Committee" ALTER COLUMN "eventId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Committee_eventId_committeeName_key" ON "Committee"("eventId", "committeeName");

-- AddForeignKey
ALTER TABLE "Committee" ADD CONSTRAINT "Committee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
