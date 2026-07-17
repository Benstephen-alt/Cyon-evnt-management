/*
  Warnings:

  - You are about to drop the column `attendanceStatus` on the `Delegate` table. All the data in the column will be lost.
  - You are about to drop the column `delegateId` on the `Delegate` table. All the data in the column will be lost.
  - You are about to drop the column `hasMedicalCondition` on the `Delegate` table. All the data in the column will be lost.
  - You are about to drop the column `medicalNotes` on the `Delegate` table. All the data in the column will be lost.
  - You are about to drop the column `registeredAt` on the `Delegate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[delegateNumber]` on the table `Delegate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deaneryId` to the `Delegate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deaneryName` to the `Delegate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delegateNumber` to the `Delegate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parishName` to the `Delegate` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gender` on the `Delegate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Delegate_delegateId_idx";

-- DropIndex
DROP INDEX "Delegate_delegateId_key";

-- DropIndex
DROP INDEX "Delegate_eventId_idx";

-- DropIndex
DROP INDEX "Delegate_fullName_idx";

-- DropIndex
DROP INDEX "Delegate_parishId_idx";

-- DropIndex
DROP INDEX "Delegate_qrCode_key";

-- AlterTable
ALTER TABLE "Delegate" DROP COLUMN "attendanceStatus",
DROP COLUMN "delegateId",
DROP COLUMN "hasMedicalCondition",
DROP COLUMN "medicalNotes",
DROP COLUMN "registeredAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "deaneryId" TEXT NOT NULL,
ADD COLUMN     "deaneryName" TEXT NOT NULL,
ADD COLUMN     "delegateNumber" TEXT NOT NULL,
ADD COLUMN     "isCheckedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parishName" TEXT NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT NOT NULL,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "qrCode" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Delegate_delegateNumber_key" ON "Delegate"("delegateNumber");

-- AddForeignKey
ALTER TABLE "Delegate" ADD CONSTRAINT "Delegate_deaneryId_fkey" FOREIGN KEY ("deaneryId") REFERENCES "Deanery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
