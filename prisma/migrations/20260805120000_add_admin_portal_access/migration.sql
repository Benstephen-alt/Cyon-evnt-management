-- Existing ordinary admins who are committee members become committee-only.
-- Super admins always retain admin portal access in application policy.
ALTER TABLE "Admin"
ADD COLUMN "adminPortalAccess" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Admin" AS admin
SET "adminPortalAccess" = false
FROM "User" AS app_user
WHERE admin."userId" = app_user."id"
  AND app_user."role" = 'ADMIN'
  AND EXISTS (
    SELECT 1
    FROM "CommitteeMember" AS member
    WHERE member."userId" = app_user."id"
  );
