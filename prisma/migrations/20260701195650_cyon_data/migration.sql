/*
  Warnings:

  - You are about to drop the column `isApproved` on the `Parish` table. All the data in the column will be lost.
  - You are about to drop the column `isRegistered` on the `Parish` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReceipt` on the `Parish` table. All the data in the column will be lost.
  - You are about to drop the column `presidentPhone` on the `Parish` table. All the data in the column will be lost.
  - Added the required column `presidentName` to the `ParishAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presidentPhoneNumber` to the `ParishAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parish" DROP COLUMN "isApproved",
DROP COLUMN "isRegistered",
DROP COLUMN "paymentReceipt",
DROP COLUMN "presidentPhone";

-- AlterTable
ALTER TABLE "ParishAccount" ADD COLUMN     "presidentName" TEXT NOT NULL,
ADD COLUMN     "presidentPhoneNumber" TEXT NOT NULL;
