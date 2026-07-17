/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Delegate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Delegate" DROP COLUMN "createdAt",
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedInByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Delegate" ADD CONSTRAINT "Delegate_checkedInByUserId_fkey" FOREIGN KEY ("checkedInByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
