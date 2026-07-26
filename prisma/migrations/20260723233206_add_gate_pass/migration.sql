-- CreateTable
CREATE TABLE "GatePass" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "delegateId" TEXT,
    "manualRegistrationId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "checkedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "checkedOutByUserId" TEXT NOT NULL,
    "checkedInByUserId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GatePass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GatePass_eventId_idx" ON "GatePass"("eventId");

-- CreateIndex
CREATE INDEX "GatePass_delegateId_idx" ON "GatePass"("delegateId");

-- CreateIndex
CREATE INDEX "GatePass_manualRegistrationId_idx" ON "GatePass"("manualRegistrationId");

-- CreateIndex
CREATE INDEX "GatePass_checkedOutAt_idx" ON "GatePass"("checkedOutAt");

-- CreateIndex
CREATE INDEX "GatePass_checkedInAt_idx" ON "GatePass"("checkedInAt");

-- AddForeignKey
ALTER TABLE "GatePass" ADD CONSTRAINT "GatePass_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatePass" ADD CONSTRAINT "GatePass_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "Delegate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatePass" ADD CONSTRAINT "GatePass_manualRegistrationId_fkey" FOREIGN KEY ("manualRegistrationId") REFERENCES "ManualParishRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatePass" ADD CONSTRAINT "GatePass_checkedOutByUserId_fkey" FOREIGN KEY ("checkedOutByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatePass" ADD CONSTRAINT "GatePass_checkedInByUserId_fkey" FOREIGN KEY ("checkedInByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
