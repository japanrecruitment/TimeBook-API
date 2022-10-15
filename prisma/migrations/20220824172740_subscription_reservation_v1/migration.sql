-- AlterTable
ALTER TABLE "HotelRoomReservation" ADD COLUMN     "subscriptionPrice" INTEGER,
ADD COLUMN     "subscriptionUnit" INTEGER;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "subscriptionPrice" INTEGER,
ADD COLUMN     "subscriptionUnit" INTEGER;
