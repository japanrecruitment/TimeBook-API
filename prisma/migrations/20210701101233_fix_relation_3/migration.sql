/*
  Warnings:

  - You are about to drop the column `stationGroupCode` on the `Station` table. All the data in the column will be lost.
  - Added the required column `prefectureCodeId` to the `Station` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Station" DROP CONSTRAINT "Station_lineCode_fkey";

-- DropForeignKey
ALTER TABLE "Station" DROP CONSTRAINT "Station_stationGroupCode_fkey";

-- AlterTable
ALTER TABLE "Station" DROP COLUMN "stationGroupCode",
ADD COLUMN     "prefectureCodeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("prefectureCodeId") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("lineCode") REFERENCES "TrainLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
