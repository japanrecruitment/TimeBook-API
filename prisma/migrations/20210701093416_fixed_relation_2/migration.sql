/*
  Warnings:

  - You are about to drop the column `prefectureCode` on the `Station` table. All the data in the column will be lost.
  - Made the column `lineCode` on table `Station` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Station" DROP CONSTRAINT "Station_prefectureCode_fkey";

-- AlterTable
ALTER TABLE "Station" DROP COLUMN "prefectureCode",
ALTER COLUMN "lineCode" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("lineCode") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
