/*
  Warnings:

  - You are about to drop the column `hotelRoomPlanId` on the `BasicPriceSetting` table. All the data in the column will be lost.
  - You are about to drop the column `hotelRoomPlanId` on the `PriceOverride` table. All the data in the column will be lost.
  - You are about to drop the `HotelRoomPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BasicPriceSetting" DROP CONSTRAINT "BasicPriceSetting_hotelRoomPlanId_fkey";

-- DropForeignKey
ALTER TABLE "HotelRoomPlan" DROP CONSTRAINT "HotelRoomPlan_hotelRoomId_fkey";

-- DropForeignKey
ALTER TABLE "HotelRoomPlan" DROP CONSTRAINT "HotelRoomPlan_packagePlanId_fkey";

-- DropForeignKey
ALTER TABLE "PriceOverride" DROP CONSTRAINT "PriceOverride_hotelRoomPlanId_fkey";

-- AlterTable
ALTER TABLE "BasicPriceSetting" DROP COLUMN "hotelRoomPlanId",
ADD COLUMN     "hotelRoom_packagePlan_id" TEXT;

-- AlterTable
ALTER TABLE "PriceOverride" DROP COLUMN "hotelRoomPlanId",
ADD COLUMN     "hotelRoom_packagePlan_id" TEXT;

-- DropTable
DROP TABLE "HotelRoomPlan";

-- CreateTable
CREATE TABLE "HotelRoom_PackagePlan" (
    "id" TEXT NOT NULL,
    "packagePlanId" TEXT NOT NULL,
    "hotelRoomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelRoom_PackagePlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BasicPriceSetting" ADD CONSTRAINT "BasicPriceSetting_hotelRoom_packagePlan_id_fkey" FOREIGN KEY ("hotelRoom_packagePlan_id") REFERENCES "HotelRoom_PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_hotelRoom_packagePlan_id_fkey" FOREIGN KEY ("hotelRoom_packagePlan_id") REFERENCES "HotelRoom_PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoom_PackagePlan" ADD CONSTRAINT "HotelRoom_PackagePlan_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoom_PackagePlan" ADD CONSTRAINT "HotelRoom_PackagePlan_packagePlanId_fkey" FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
