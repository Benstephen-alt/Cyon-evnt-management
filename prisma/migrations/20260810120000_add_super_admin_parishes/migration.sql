ALTER TABLE "ParishAccount"
ADD COLUMN "isSuperAdminManaged" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "IncomeRecord"
ADD COLUMN "parishAccountId" TEXT;

UPDATE "IncomeRecord" AS income
SET "parishAccountId" = account."id"
FROM "ParishAccount" AS account
INNER JOIN "Parish" AS parish ON parish."id" = account."parishId"
WHERE income."source" = 'PARISH_REGISTRATION'
  AND income."eventId" = account."eventId"
  AND income."payerName" = parish."parishName"
  AND NOT EXISTS (
    SELECT 1
    FROM "IncomeRecord" AS earlier
    WHERE earlier."source" = 'PARISH_REGISTRATION'
      AND earlier."eventId" = income."eventId"
      AND earlier."payerName" = income."payerName"
      AND earlier."createdAt" < income."createdAt"
  );

CREATE UNIQUE INDEX "IncomeRecord_parishAccountId_key"
ON "IncomeRecord"("parishAccountId");

ALTER TABLE "IncomeRecord"
ADD CONSTRAINT "IncomeRecord_parishAccountId_fkey"
FOREIGN KEY ("parishAccountId") REFERENCES "ParishAccount"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
