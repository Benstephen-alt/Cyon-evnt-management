-- AlterTable
ALTER TABLE "Event"
ADD COLUMN "committeeBadgeSequence" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CommitteeBadge" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "committeeMemberId" TEXT NOT NULL,
    "badgeNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitteeBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeBadge_badgeNumber_key"
ON "CommitteeBadge"("badgeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeBadge_eventId_committeeMemberId_key"
ON "CommitteeBadge"("eventId", "committeeMemberId");

-- CreateIndex
CREATE INDEX "CommitteeBadge_eventId_idx"
ON "CommitteeBadge"("eventId");

-- CreateIndex
CREATE INDEX "CommitteeBadge_committeeId_idx"
ON "CommitteeBadge"("committeeId");

-- CreateIndex
CREATE INDEX "CommitteeBadge_committeeMemberId_idx"
ON "CommitteeBadge"("committeeMemberId");

-- AddForeignKey
ALTER TABLE "CommitteeBadge"
ADD CONSTRAINT "CommitteeBadge_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeBadge"
ADD CONSTRAINT "CommitteeBadge_committeeId_fkey"
FOREIGN KEY ("committeeId") REFERENCES "Committee"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeBadge"
ADD CONSTRAINT "CommitteeBadge_committeeMemberId_fkey"
FOREIGN KEY ("committeeMemberId") REFERENCES "CommitteeMember"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
