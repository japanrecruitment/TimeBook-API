/*
  Warnings:

  - You are about to drop the column `packagePlanId` on the `BasicPriceSetting` table. All the data in the column will be lost.
  - You are about to drop the column `hotelRoomId` on the `PackagePlan` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `PackagePlan` table. All the data in the column will be lost.
  - You are about to drop the column `packagePlanId` on the `PriceOverride` table. All the data in the column will be lost.
  - Added the required column `hotelId` to the `PackagePlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BasicPriceSetting" DROP CONSTRAINT "BasicPriceSetting_packagePlanId_fkey";

-- DropForeignKey
ALTER TABLE "PackagePlan" DROP CONSTRAINT "PackagePlan_hotelRoomId_fkey";

-- DropForeignKey
ALTER TABLE "PriceOverride" DROP CONSTRAINT "PriceOverride_packagePlanId_fkey";

-- AlterTable
ALTER TABLE "BasicPriceSetting" DROP COLUMN "packagePlanId",
ADD COLUMN     "hotelRoomPlanId" TEXT;

-- AlterTable
ALTER TABLE "PackagePlan" DROP COLUMN "hotelRoomId",
DROP COLUMN "stock",
ADD COLUMN     "hotelId" TEXT NOT NULL,
ALTER COLUMN "startUsage" DROP NOT NULL,
ALTER COLUMN "endUsage" DROP NOT NULL,
ALTER COLUMN "startReservation" DROP NOT NULL,
ALTER COLUMN "endReservation" DROP NOT NULL,
ALTER COLUMN "cutOffBeforeDays" DROP NOT NULL,
ALTER COLUMN "cutOffTillTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PriceOverride" DROP COLUMN "packagePlanId",
ADD COLUMN     "hotelRoomPlanId" TEXT;

-- CreateTable
CREATE TABLE "HotelRoomPlan" (
    "id" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "packagePlanId" TEXT NOT NULL,
    "hotelRoomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelRoomPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BasicPriceSetting" ADD CONSTRAINT "BasicPriceSetting_hotelRoomPlanId_fkey" FOREIGN KEY ("hotelRoomPlanId") REFERENCES "HotelRoomPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_hotelRoomPlanId_fkey" FOREIGN KEY ("hotelRoomPlanId") REFERENCES "HotelRoomPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePlan" ADD CONSTRAINT "PackagePlan_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoomPlan" ADD CONSTRAINT "HotelRoomPlan_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoomPlan" ADD CONSTRAINT "HotelRoomPlan_packagePlanId_fkey" FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
