ALTER TABLE "FeedingRequest"
ADD COLUMN "amount" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN "isSecurityCollective" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "FeedingRequest_eventId_isSecurityCollective_requestedAt_idx"
ON "FeedingRequest"("eventId", "isSecurityCollective", "requestedAt");
