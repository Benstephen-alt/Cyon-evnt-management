/*
  Warnings:

  - You are about to drop the column `recipient` on the `FundRelease` table. All the data in the column will be lost.
  - You are about to drop the column `releasedBy` on the `FundRelease` table. All the data in the column will be lost.
  - Added the required column `expenseName` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authority` to the `FundRelease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientName` to the `FundRelease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releasedByUserId` to the `FundRelease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FundRelease` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FundReleaseAuthority" AS ENUM ('DIOCESAN_PRESIDENT', 'GENERAL_COMMITTEE_CHAIRMAN', 'CHAPLAIN');

-- DropForeignKey
ALTER TABLE "FundRelease" DROP CONSTRAINT "FundRelease_committeeMemberId_fkey";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "expenseName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FundRelease" DROP COLUMN "recipient",
DROP COLUMN "releasedBy",
ADD COLUMN     "authority" "FundReleaseAuthority" NOT NULL,
ADD COLUMN     "recipientName" TEXT NOT NULL,
ADD COLUMN     "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "releasedByUserId" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "FundRelease_eventId_idx" ON "FundRelease"("eventId");

-- CreateIndex
CREATE INDEX "FundRelease_committeeId_idx" ON "FundRelease"("committeeId");

-- CreateIndex
CREATE INDEX "FundRelease_committeeMemberId_idx" ON "FundRelease"("committeeMemberId");

-- CreateIndex
CREATE INDEX "FundRelease_releasedByUserId_idx" ON "FundRelease"("releasedByUserId");

-- AddForeignKey
ALTER TABLE "FundRelease" ADD CONSTRAINT "FundRelease_committeeMemberId_fkey" FOREIGN KEY ("committeeMemberId") REFERENCES "CommitteeMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundRelease" ADD CONSTRAINT "FundRelease_releasedByUserId_fkey" FOREIGN KEY ("releasedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
