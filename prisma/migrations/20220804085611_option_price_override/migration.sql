/*
  Warnings:

  - You are about to drop the column `additionalPrice` on the `OptionPriceOverride` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerm` on the `OptionPriceOverride` table. All the data in the column will be lost.
  - You are about to drop the `__PackagePlanOptions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `OptionPriceOverride` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('WHOLE_HOUSE', 'SIMPLE_ACCOMODATION', 'HOTEL', 'INN');

-- DropForeignKey
ALTER TABLE "__PackagePlanOptions" DROP CONSTRAINT "__PackagePlanOptions_A_fkey";

-- DropForeignKey
ALTER TABLE "__PackagePlanOptions" DROP CONSTRAINT "__PackagePlanOptions_B_fkey";

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "buildingType" "BuildingType" NOT NULL DEFAULT 'HOTEL',
ADD COLUMN     "isPetAllowed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OptionPriceOverride" DROP COLUMN "additionalPrice",
DROP COLUMN "paymentTerm",
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PackagePlan" ADD COLUMN     "isBreakfastIncluded" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "__PackagePlanOptions";

-- CreateTable
CREATE TABLE "__PackagePlanIncludedOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "__PackagePlanAddtionalOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__PackagePlanIncludedOptions_AB_unique" ON "__PackagePlanIncludedOptions"("A", "B");

-- CreateIndex
CREATE INDEX "__PackagePlanIncludedOptions_B_index" ON "__PackagePlanIncludedOptions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "__PackagePlanAddtionalOptions_AB_unique" ON "__PackagePlanAddtionalOptions"("A", "B");

-- CreateIndex
CREATE INDEX "__PackagePlanAddtionalOptions_B_index" ON "__PackagePlanAddtionalOptions"("B");

-- AddForeignKey
ALTER TABLE "__PackagePlanIncludedOptions" ADD CONSTRAINT "__PackagePlanIncludedOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PackagePlanIncludedOptions" ADD CONSTRAINT "__PackagePlanIncludedOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PackagePlanAddtionalOptions" ADD CONSTRAINT "__PackagePlanAddtionalOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PackagePlanAddtionalOptions" ADD CONSTRAINT "__PackagePlanAddtionalOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
