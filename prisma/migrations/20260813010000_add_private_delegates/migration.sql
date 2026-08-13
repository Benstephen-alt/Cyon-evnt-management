ALTER TABLE "Event" ADD COLUMN "privateDelegateSequence" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "PrivateDelegate" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "delegateNumber" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "gender" "Gender",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PrivateDelegate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PrivateDelegate_delegateNumber_key" ON "PrivateDelegate"("delegateNumber");
CREATE INDEX "PrivateDelegate_eventId_idx" ON "PrivateDelegate"("eventId");
CREATE INDEX "PrivateDelegate_eventId_fullName_idx" ON "PrivateDelegate"("eventId", "fullName");
ALTER TABLE "PrivateDelegate" ADD CONSTRAINT "PrivateDelegate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
