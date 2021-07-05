/*
  Warnings:

  - You are about to drop the column `addressId` on the `Prefecture` table. All the data in the column will be lost.
  - You are about to drop the column `stationId` on the `Prefecture` table. All the data in the column will be lost.
  - You are about to drop the column `stationId` on the `TrainLine` table. All the data in the column will be lost.
  - You are about to drop the `_StationToTrainLine` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `prefectureId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefectureCode` to the `Station` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stationGroupCode` to the `Station` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prefecture" DROP CONSTRAINT "Prefecture_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Prefecture" DROP CONSTRAINT "Prefecture_stationId_fkey";

-- DropForeignKey
ALTER TABLE "TrainLine" DROP CONSTRAINT "TrainLine_stationId_fkey";

-- DropForeignKey
ALTER TABLE "_StationToTrainLine" DROP CONSTRAINT "_StationToTrainLine_A_fkey";

-- DropForeignKey
ALTER TABLE "_StationToTrainLine" DROP CONSTRAINT "_StationToTrainLine_B_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "prefectureId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Prefecture" DROP COLUMN "addressId",
DROP COLUMN "stationId";

-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "prefectureCode" INTEGER NOT NULL,
ADD COLUMN     "stationGroupCode" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TrainLine" DROP COLUMN "stationId";

-- DropTable
DROP TABLE "_StationToTrainLine";

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("prefectureId") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("prefectureCode") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("stationGroupCode") REFERENCES "TrainLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
