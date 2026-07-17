-- CreateTable
CREATE TABLE "DelegateDraft" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "age" INTEGER,
    "phoneNumber" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "deaneryId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelegateDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DelegateDraft_parishId_idx" ON "DelegateDraft"("parishId");

-- CreateIndex
CREATE INDEX "DelegateDraft_eventId_idx" ON "DelegateDraft"("eventId");

-- AddForeignKey
ALTER TABLE "DelegateDraft" ADD CONSTRAINT "DelegateDraft_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelegateDraft" ADD CONSTRAINT "DelegateDraft_deaneryId_fkey" FOREIGN KEY ("deaneryId") REFERENCES "Deanery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelegateDraft" ADD CONSTRAINT "DelegateDraft_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelegateDraft" ADD CONSTRAINT "DelegateDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
