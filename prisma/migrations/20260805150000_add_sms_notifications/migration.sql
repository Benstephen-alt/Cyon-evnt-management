CREATE TYPE "NotificationAudience" AS ENUM ('DELEGATES', 'PRESIDENTS', 'SEMINARIANS', 'MIXED');
CREATE TYPE "NotificationRecipientType" AS ENUM ('DELEGATE', 'PRESIDENT', 'SEMINARIAN');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIALLY_FAILED', 'FAILED');
CREATE TYPE "SmsDeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'DELIVERED', 'REJECTED');

CREATE TABLE "NotificationCampaign" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "audience" "NotificationAudience" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "acceptedCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "invalidCount" INTEGER NOT NULL DEFAULT 0,
  "providerCost" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "NotificationCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationRecipient" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "recipientName" TEXT,
  "recipientType" "NotificationRecipientType" NOT NULL,
  "providerMessageId" TEXT,
  "providerStatus" TEXT,
  "deliveryStatus" "SmsDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
  "failureReason" TEXT,
  "providerCost" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NotificationCampaign_eventId_idx" ON "NotificationCampaign"("eventId");
CREATE INDEX "NotificationCampaign_createdByUserId_idx" ON "NotificationCampaign"("createdByUserId");
CREATE INDEX "NotificationCampaign_createdAt_idx" ON "NotificationCampaign"("createdAt");
CREATE INDEX "NotificationRecipient_campaignId_idx" ON "NotificationRecipient"("campaignId");
CREATE INDEX "NotificationRecipient_providerMessageId_idx" ON "NotificationRecipient"("providerMessageId");

ALTER TABLE "NotificationCampaign" ADD CONSTRAINT "NotificationCampaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationCampaign" ADD CONSTRAINT "NotificationCampaign_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "NotificationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
