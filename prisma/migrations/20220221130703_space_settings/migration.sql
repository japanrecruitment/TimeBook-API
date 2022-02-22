/*
  Warnings:

  - You are about to drop the column `spaceId` on the `SpacePricePlan` table. All the data in the column will be lost.
  - Added the required column `spaceSettingId` to the `SpacePricePlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SpacePricePlanType" ADD VALUE 'MINUTES';

-- DropForeignKey
ALTER TABLE "SpacePricePlan" DROP CONSTRAINT "SpacePricePlan_spaceId_fkey";

-- AlterTable
ALTER TABLE "SpacePricePlan" DROP COLUMN "spaceId",
ADD COLUMN     "spaceSettingId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SpaceAmenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceAmenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceSetting" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL DEFAULT 1,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "businessDays" INTEGER[],
    "openingHr" INTEGER NOT NULL,
    "closingHr" INTEGER NOT NULL,
    "breakFromHr" INTEGER,
    "breakToHr" INTEGER,
    "month" INTEGER[],
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__SpaceAmenities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__SpaceAmenities_AB_unique" ON "__SpaceAmenities"("A", "B");

-- CreateIndex
CREATE INDEX "__SpaceAmenities_B_index" ON "__SpaceAmenities"("B");

-- AddForeignKey
ALTER TABLE "SpaceSetting" ADD CONSTRAINT "SpaceSetting_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePricePlan" ADD CONSTRAINT "SpacePricePlan_spaceSettingId_fkey" FOREIGN KEY ("spaceSettingId") REFERENCES "SpaceSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceAmenities" ADD FOREIGN KEY ("A") REFERENCES "SpaceAmenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceAmenities" ADD FOREIGN KEY ("B") REFERENCES "SpaceSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
