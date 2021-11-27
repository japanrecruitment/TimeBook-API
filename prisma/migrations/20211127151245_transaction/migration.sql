/*
  Warnings:

  - A unique constraint covering the columns `[reservationId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reservationId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "reservationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reservationId_key" ON "Transaction"("reservationId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
