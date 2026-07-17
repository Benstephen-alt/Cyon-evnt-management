-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommitteePermission" ADD VALUE 'CREATE_BUDGET';
ALTER TYPE "CommitteePermission" ADD VALUE 'UPDATE_BUDGET';
ALTER TYPE "CommitteePermission" ADD VALUE 'DELETE_BUDGET';
ALTER TYPE "CommitteePermission" ADD VALUE 'VIEW_FINANCE_DASHBOARD';
