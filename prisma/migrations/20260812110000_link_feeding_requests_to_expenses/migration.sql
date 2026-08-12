ALTER TABLE "Expense" ADD COLUMN "feedingRequestId" TEXT;

CREATE UNIQUE INDEX "Expense_feedingRequestId_key" ON "Expense"("feedingRequestId");

ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_feedingRequestId_fkey"
FOREIGN KEY ("feedingRequestId") REFERENCES "FeedingRequest"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
