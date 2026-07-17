-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "delegateRegistrationDeadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ParishAccount" ADD COLUMN     "delegateSubmissionLocked" BOOLEAN NOT NULL DEFAULT false;
