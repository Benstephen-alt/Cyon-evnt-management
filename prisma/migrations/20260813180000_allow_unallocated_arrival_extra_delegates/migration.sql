ALTER TABLE "ArrivalExtraDelegate"
ALTER COLUMN "bedId" DROP NOT NULL;

ALTER TABLE "ArrivalExtraDelegate"
DROP CONSTRAINT "ArrivalExtraDelegate_bedId_fkey";

ALTER TABLE "ArrivalExtraDelegate"
ADD CONSTRAINT "ArrivalExtraDelegate_bedId_fkey"
FOREIGN KEY ("bedId") REFERENCES "Bed"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
