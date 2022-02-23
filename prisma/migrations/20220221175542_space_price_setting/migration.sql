/*
  Warnings:

  - You are about to drop the column `spaceSettingId` on the `SpacePricePlan` table. All the data in the column will be lost.
  - Added the required column `priceSettingId` to the `SpacePricePlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SpacePricePlan" DROP CONSTRAINT "SpacePricePlan_spaceSettingId_fkey";

-- DropForeignKey
ALTER TABLE "__SpaceAmenities" DROP CONSTRAINT "__SpaceAmenities_A_fkey";

-- DropForeignKey
ALTER TABLE "__SpaceAmenities" DROP CONSTRAINT "__SpaceAmenities_B_fkey";

-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "published" SET DEFAULT false;

-- AlterTable
ALTER TABLE "SpacePricePlan" DROP COLUMN "spaceSettingId",
ADD COLUMN     "priceSettingId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SpacePriceSetting" (
    "id" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "businessDays" INTEGER[],
    "month" INTEGER[],
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "SpacePriceSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpacePriceSetting_spaceId_key" ON "SpacePriceSetting"("spaceId");

-- AddForeignKey
ALTER TABLE "SpacePriceSetting" ADD CONSTRAINT "SpacePriceSetting_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePricePlan" ADD CONSTRAINT "SpacePricePlan_priceSettingId_fkey" FOREIGN KEY ("priceSettingId") REFERENCES "SpacePriceSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceAmenities" ADD FOREIGN KEY ("A") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceAmenities" ADD FOREIGN KEY ("B") REFERENCES "SpaceAmenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
