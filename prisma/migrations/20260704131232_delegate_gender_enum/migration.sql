/*
  Warnings:

  - Changed the type of `gender` on the `Delegate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Delegate" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;
