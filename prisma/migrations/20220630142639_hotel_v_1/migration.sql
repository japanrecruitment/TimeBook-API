/*
  Warnings:

  - A unique constraint covering the columns `[hotelId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "HotelStatus" AS ENUM ('DRAFTED', 'PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "HotelPaymentTerm" AS ENUM ('PER_PERSON', 'PER_ROOM');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "hotelId" TEXT;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "hotelId" TEXT,
ADD COLUMN     "hotelRoomId" TEXT,
ADD COLUMN     "optionId" TEXT,
ADD COLUMN     "packagePlanId" TEXT;

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "checkInTime" TIME NOT NULL,
    "checkOutTime" TIME NOT NULL,
    "status" "HotelStatus" NOT NULL DEFAULT 'DRAFTED',
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelNearestStation" (
    "hotelId" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "accessType" TEXT NOT NULL,
    "time" INTEGER NOT NULL,

    CONSTRAINT "HotelNearestStation_pkey" PRIMARY KEY ("hotelId","stationId")
);

-- CreateTable
CREATE TABLE "HotelRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "paymentTerm" "HotelPaymentTerm" NOT NULL,
    "maxCapacityAdult" INTEGER,
    "maxCapacityChild" INTEGER,
    "stock" INTEGER,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BasicPriceSetting" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "priceSchemeId" TEXT NOT NULL,
    "hotelRoomId" TEXT,
    "packagePlanId" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasicPriceSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceOverride" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "priceSchemeId" TEXT NOT NULL,
    "hotelRoomId" TEXT,
    "packagePlanId" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceScheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomCharge" INTEGER NOT NULL,
    "oneAdultCharge" INTEGER,
    "twoAdultCharge" INTEGER,
    "threeAdultCharge" INTEGER,
    "fourAdultCharge" INTEGER,
    "fiveAdultCharge" INTEGER,
    "sixAdultCharge" INTEGER,
    "sevenAdultCharge" INTEGER,
    "eightAdultCharge" INTEGER,
    "nineAdultCharge" INTEGER,
    "tenAdultCharge" INTEGER,
    "oneChildCharge" INTEGER,
    "twoChildCharge" INTEGER,
    "threeChildCharge" INTEGER,
    "fourChildCharge" INTEGER,
    "fiveChildCharge" INTEGER,
    "sixChildCharge" INTEGER,
    "sevenChildCharge" INTEGER,
    "eightChildCharge" INTEGER,
    "nineChildCharge" INTEGER,
    "tenChildCharge" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "paymentTerm" "HotelPaymentTerm" NOT NULL,
    "stock" INTEGER NOT NULL,
    "startUsage" DATE NOT NULL,
    "endUsage" DATE NOT NULL,
    "startReservation" DATE NOT NULL,
    "endReservation" DATE NOT NULL,
    "cutOffBeforeDays" INTEGER NOT NULL,
    "cutOffTillTime" TIME NOT NULL,
    "hotelRoomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startUsage" DATE NOT NULL,
    "endUsage" DATE NOT NULL,
    "startReservation" DATE NOT NULL,
    "endReservation" DATE NOT NULL,
    "cutOffBeforeDays" INTEGER NOT NULL,
    "cutOffTillTime" TIME NOT NULL,
    "aditionalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PackagePlanOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__PackagePlanOptions_AB_unique" ON "__PackagePlanOptions"("A", "B");

-- CreateIndex
CREATE INDEX "__PackagePlanOptions_B_index" ON "__PackagePlanOptions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Address_hotelId_key" ON "Address"("hotelId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_packagePlanId_fkey" FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelNearestStation" ADD CONSTRAINT "HotelNearestStation_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelNearestStation" ADD CONSTRAINT "HotelNearestStation_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoom" ADD CONSTRAINT "HotelRoom_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicPriceSetting" ADD CONSTRAINT "BasicPriceSetting_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicPriceSetting" ADD CONSTRAINT "BasicPriceSetting_priceSchemeId_fkey" FOREIGN KEY ("priceSchemeId") REFERENCES "PriceScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicPriceSetting" ADD CONSTRAINT "BasicPriceSetting_packagePlanId_fkey" FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_priceSchemeId_fkey" FOREIGN KEY ("priceSchemeId") REFERENCES "PriceScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_packagePlanId_fkey" FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePlan" ADD CONSTRAINT "PackagePlan_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PackagePlanOptions" ADD CONSTRAINT "__PackagePlanOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PackagePlanOptions" ADD CONSTRAINT "__PackagePlanOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
