/*
  Warnings:

  - Added the required column `type` to the `GatePass` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GatePassType" AS ENUM ('ONLINE', 'MANUAL');

-- AlterTable
ALTER TABLE "GatePass" ADD COLUMN     "type" "GatePassType" NOT NULL;
