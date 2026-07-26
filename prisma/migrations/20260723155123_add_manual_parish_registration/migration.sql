-- CreateTable
CREATE TABLE "ManualParishRegistration" (
    "id" TEXT NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "deaneryId" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "presidentName" TEXT NOT NULL,
    "presidentPhone" TEXT NOT NULL,
    "totalDelegates" INTEGER NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualParishRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManualParishRegistration_registrationCode_key" ON "ManualParishRegistration"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "ManualParishRegistration_eventId_parishId_key" ON "ManualParishRegistration"("eventId", "parishId");

-- AddForeignKey
ALTER TABLE "ManualParishRegistration" ADD CONSTRAINT "ManualParishRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualParishRegistration" ADD CONSTRAINT "ManualParishRegistration_deaneryId_fkey" FOREIGN KEY ("deaneryId") REFERENCES "Deanery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualParishRegistration" ADD CONSTRAINT "ManualParishRegistration_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualParishRegistration" ADD CONSTRAINT "ManualParishRegistration_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
