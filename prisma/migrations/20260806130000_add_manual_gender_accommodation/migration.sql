ALTER TABLE "ManualParishRegistration"
ADD COLUMN "maleDelegates" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "femaleDelegates" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "accommodationAllocatedAt" TIMESTAMP(3);

CREATE TABLE "ManualDelegateAccommodation" (
  "id" TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "bedId" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "delegatePosition" INTEGER NOT NULL,
  "allocatedByUserId" TEXT NOT NULL,
  "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ManualDelegateAccommodation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ManualDelegateAccommodation_bedId_key" ON "ManualDelegateAccommodation"("bedId");
CREATE UNIQUE INDEX "ManualDelegateAccommodation_registrationId_gender_delegatePosition_key" ON "ManualDelegateAccommodation"("registrationId", "gender", "delegatePosition");
CREATE INDEX "ManualDelegateAccommodation_registrationId_idx" ON "ManualDelegateAccommodation"("registrationId");
CREATE INDEX "ManualDelegateAccommodation_allocatedByUserId_idx" ON "ManualDelegateAccommodation"("allocatedByUserId");

ALTER TABLE "ManualDelegateAccommodation" ADD CONSTRAINT "ManualDelegateAccommodation_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "ManualParishRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ManualDelegateAccommodation" ADD CONSTRAINT "ManualDelegateAccommodation_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ManualDelegateAccommodation" ADD CONSTRAINT "ManualDelegateAccommodation_allocatedByUserId_fkey" FOREIGN KEY ("allocatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
