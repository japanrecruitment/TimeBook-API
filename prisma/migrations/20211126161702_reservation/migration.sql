/*
  Warnings:

  - The values [Reserved,Hold,Pending] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `approved` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "TransactionAssetType" AS ENUM ('SPACE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('CREATED', 'REQUESTED', 'REQUEST_SUCCESSFULL', 'WEBHOOK_RECEIVED', 'SUCCESSFULL', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('RESERVED', 'HOLD', 'PENDING', 'FAILED', 'DISAPPROVED');
ALTER TABLE "Reservation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "ReservationStatus_old";
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "approved" BOOLEAN NOT NULL,
ALTER COLUMN "status" SET DEFAULT E'PENDING',
ALTER COLUMN "approvedOn" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT E'STRIPE',
    "assetType" "TransactionAssetType" NOT NULL DEFAULT E'SPACE',
    "assetData" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "requestedLog" JSONB,
    "responseReceivedLog" JSONB,
    "webhookReceivedLog" JSONB,
    "webhookRespondedLog" JSONB,
    "resultedLog" JSONB,
    "failedLog" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
