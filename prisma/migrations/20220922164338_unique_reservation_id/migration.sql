/*
  Warnings:

  - A unique constraint covering the columns `[reservationId]` on the table `HotelRoomReservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reservationId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HotelRoomReservation_reservationId_key" ON "HotelRoomReservation"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservationId_key" ON "Reservation"("reservationId");
