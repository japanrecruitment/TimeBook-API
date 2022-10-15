/*
  Warnings:

  - A unique constraint covering the columns `[hotelRoomReservationId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TransactionAssetType" ADD VALUE 'HOTEL_ROOM';

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_reservationId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "hotelRoomReservationId" TEXT,
ALTER COLUMN "reservationId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "HotelRoomReservation" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL DEFAULT 'PS',
    "fromDateTime" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toDateTime" DATE NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "approved" BOOLEAN NOT NULL,
    "approvedOn" TIMESTAMP(6),
    "hotelRoomId" TEXT NOT NULL,
    "packagePlanId" TEXT NOT NULL,
    "reserveeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelRoomReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hotelRoomReservationId_key" ON "Transaction"("hotelRoomReservationId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_hotelRoomReservationId_fkey" FOREIGN KEY ("hotelRoomReservationId") REFERENCES "HotelRoomReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoomReservation" ADD CONSTRAINT "HotelRoomReservation_reserveeId_fkey" FOREIGN KEY ("reserveeId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoomReservation" ADD CONSTRAINT "HotelRoomReservation_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelRoomReservation" ADD CONSTRAINT "HotelRoomReservation_packagePlanId_fkey" FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
