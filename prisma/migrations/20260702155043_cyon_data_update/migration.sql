-- CreateTable
CREATE TABLE "ParishArrival" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "arrived" BOOLEAN NOT NULL DEFAULT false,
    "arrivedAt" TIMESTAMP(3),
    "checkedInByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParishArrival_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParishArrival_eventId_parishId_key" ON "ParishArrival"("eventId", "parishId");

-- AddForeignKey
ALTER TABLE "ParishArrival" ADD CONSTRAINT "ParishArrival_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParishArrival" ADD CONSTRAINT "ParishArrival_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParishArrival" ADD CONSTRAINT "ParishArrival_checkedInByUserId_fkey" FOREIGN KEY ("checkedInByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
