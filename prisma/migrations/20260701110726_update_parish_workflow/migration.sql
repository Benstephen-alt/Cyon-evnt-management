/*
  Warnings:

  - A unique constraint covering the columns `[accessCode]` on the table `Parish` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessCode` to the `Parish` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parish" ADD COLUMN     "accessCode" TEXT NOT NULL,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentReceipt" TEXT,
ADD COLUMN     "presidentPhone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Parish_accessCode_key" ON "Parish"("accessCode");
