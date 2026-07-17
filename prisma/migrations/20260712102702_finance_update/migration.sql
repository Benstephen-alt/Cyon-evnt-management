-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('PARISH_REGISTRATION', 'VENDOR_REGISTRATION', 'DONATION', 'SPONSORSHIP', 'OTHER');

-- CreateTable
CREATE TABLE "IncomeRecord" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "source" "IncomeSource" NOT NULL,
    "payerName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receiptUrl" TEXT,
    "remarks" TEXT,
    "recordedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncomeRecord_pkey" PRIMARY KEY ("id")
);
