/*
  Warnings:

  - You are about to drop the column `priceSettingId` on the `SpacePricePlan` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `SpaceSetting` table. All the data in the column will be lost.
  - You are about to drop the `SpacePriceSetting` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `spaceId` to the `SpacePricePlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SpacePricePlan" DROP CONSTRAINT "SpacePricePlan_priceSettingId_fkey";

-- DropForeignKey
ALTER TABLE "SpacePriceSetting" DROP CONSTRAINT "SpacePriceSetting_spaceId_fkey";

-- AlterTable
ALTER TABLE "SpacePricePlan" DROP COLUMN "priceSettingId",
ADD COLUMN     "fromDate" TIMESTAMP(3),
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spaceId" TEXT NOT NULL,
ADD COLUMN     "toDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SpaceSetting" DROP COLUMN "month",
ALTER COLUMN "openingHr" DROP NOT NULL,
ALTER COLUMN "closingHr" DROP NOT NULL;

-- DropTable
DROP TABLE "SpacePriceSetting";

-- AddForeignKey
ALTER TABLE "SpacePricePlan" ADD CONSTRAINT "SpacePricePlan_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
