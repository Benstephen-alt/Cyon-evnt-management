CREATE TYPE "FeedingRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "FeedingProfile" (
    "id" TEXT NOT NULL, "committeeMemberId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL, "committeeName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL, "accountNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FeedingProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FeedingRequest" (
    "id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "feedingProfileId" TEXT NOT NULL,
    "status" "FeedingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT, "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3), "reviewedByUserId" TEXT,
    CONSTRAINT "FeedingRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FeedingProfile_committeeMemberId_key" ON "FeedingProfile"("committeeMemberId");
CREATE INDEX "FeedingProfile_committeeName_idx" ON "FeedingProfile"("committeeName");
CREATE INDEX "FeedingRequest_eventId_requestedAt_idx" ON "FeedingRequest"("eventId", "requestedAt");
CREATE INDEX "FeedingRequest_feedingProfileId_requestedAt_idx" ON "FeedingRequest"("feedingProfileId", "requestedAt");
CREATE INDEX "FeedingRequest_eventId_status_idx" ON "FeedingRequest"("eventId", "status");
ALTER TABLE "FeedingProfile" ADD CONSTRAINT "FeedingProfile_committeeMemberId_fkey" FOREIGN KEY ("committeeMemberId") REFERENCES "CommitteeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedingRequest" ADD CONSTRAINT "FeedingRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedingRequest" ADD CONSTRAINT "FeedingRequest_feedingProfileId_fkey" FOREIGN KEY ("feedingProfileId") REFERENCES "FeedingProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedingRequest" ADD CONSTRAINT "FeedingRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "CommitteeAssignment" ("id", "committeeId", "committeeMemberId", "assignedByUserId", "assignedAt", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), committee."id", member."id", NULL, CURRENT_TIMESTAMP, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Committee" AS committee
JOIN "Event" AS event ON event."id" = committee."eventId" AND event."isActive" = TRUE
CROSS JOIN "CommitteeMember" AS member
WHERE LOWER(committee."committeeName") = 'feeding'
ON CONFLICT ("committeeId", "committeeMemberId") DO UPDATE SET "isActive" = TRUE, "updatedAt" = CURRENT_TIMESTAMP;
