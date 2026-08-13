ALTER TABLE "ParishArrival"
ADD COLUMN "additionalMaleDelegates" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "additionalFemaleDelegates" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ArrivalExtraDelegate" (
  "id" TEXT NOT NULL,
  "parishArrivalId" TEXT NOT NULL,
  "bedId" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "delegatePosition" INTEGER NOT NULL,
  "allocatedByUserId" TEXT NOT NULL,
  "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArrivalExtraDelegate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArrivalExtraDelegate_bedId_key" ON "ArrivalExtraDelegate"("bedId");
CREATE UNIQUE INDEX "ArrivalExtraDelegate_parishArrivalId_gender_delegatePosition_key" ON "ArrivalExtraDelegate"("parishArrivalId", "gender", "delegatePosition");
CREATE INDEX "ArrivalExtraDelegate_parishArrivalId_idx" ON "ArrivalExtraDelegate"("parishArrivalId");
CREATE INDEX "ArrivalExtraDelegate_allocatedByUserId_idx" ON "ArrivalExtraDelegate"("allocatedByUserId");
ALTER TABLE "ArrivalExtraDelegate" ADD CONSTRAINT "ArrivalExtraDelegate_parishArrivalId_fkey" FOREIGN KEY ("parishArrivalId") REFERENCES "ParishArrival"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArrivalExtraDelegate" ADD CONSTRAINT "ArrivalExtraDelegate_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArrivalExtraDelegate" ADD CONSTRAINT "ArrivalExtraDelegate_allocatedByUserId_fkey" FOREIGN KEY ("allocatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
