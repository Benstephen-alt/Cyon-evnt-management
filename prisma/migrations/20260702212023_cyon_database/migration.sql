/*
  Warnings:

  - You are about to drop the column `accessCodeHash` on the `CommitteeMember` table. All the data in the column will be lost.
  - You are about to drop the column `committeeId` on the `CommitteeMember` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `CommitteeMember` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `CommitteeMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[committeeName]` on the table `Committee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CommitteePermission" AS ENUM ('SCAN_PARISH', 'CONFIRM_PARISH_ARRIVAL', 'SCAN_DELEGATE', 'CHECKIN_DELEGATE', 'ALLOCATE_ACCOMMODATION', 'MOVE_ACCOMMODATION', 'REGISTER_DELEGATE', 'EDIT_DELEGATE', 'VERIFY_PAYMENT', 'APPROVE_PAYMENT', 'VIEW_REPORTS');

-- DropForeignKey
ALTER TABLE "Committee" DROP CONSTRAINT "Committee_eventId_fkey";

-- DropForeignKey
ALTER TABLE "CommitteeMember" DROP CONSTRAINT "CommitteeMember_committeeId_fkey";

-- DropIndex
DROP INDEX "Committee_eventId_committeeName_key";

-- DropIndex
DROP INDEX "CommitteeMember_committeeId_idx";

-- AlterTable
ALTER TABLE "Committee" ADD COLUMN     "description" TEXT,
ADD COLUMN     "permissions" "CommitteePermission"[],
ALTER COLUMN "eventId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CommitteeMember" DROP COLUMN "accessCodeHash",
DROP COLUMN "committeeId",
DROP COLUMN "fullName",
DROP COLUMN "phoneNumber";

-- CreateTable
CREATE TABLE "CommitteeAssignment" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "committeeMemberId" TEXT NOT NULL,
    "assignedByUserId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitteeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommitteeAssignment_committeeId_idx" ON "CommitteeAssignment"("committeeId");

-- CreateIndex
CREATE INDEX "CommitteeAssignment_committeeMemberId_idx" ON "CommitteeAssignment"("committeeMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeAssignment_committeeId_committeeMemberId_key" ON "CommitteeAssignment"("committeeId", "committeeMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "Committee_committeeName_key" ON "Committee"("committeeName");

-- AddForeignKey
ALTER TABLE "Committee" ADD CONSTRAINT "Committee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeAssignment" ADD CONSTRAINT "CommitteeAssignment_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeAssignment" ADD CONSTRAINT "CommitteeAssignment_committeeMemberId_fkey" FOREIGN KEY ("committeeMemberId") REFERENCES "CommitteeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeAssignment" ADD CONSTRAINT "CommitteeAssignment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
