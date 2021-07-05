/*
  Warnings:

  - The values [Company] on the enum `HostType` will be removed. If these variants are still used in the database, this will fail.
  - The values [NotReserved] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `NearestStation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ip` on the `Session` table. All the data in the column will be lost.
  - The primary key for the `Station` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `area` on the `Station` table. All the data in the column will be lost.
  - You are about to drop the column `line` on the `Station` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Station` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Host` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressLine1` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressLine2` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `stationId` on the `NearestStation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ips` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SpacePricePlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stationName` to the `Station` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Station` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HostType_new" AS ENUM ('Corporate', 'Personal');
ALTER TABLE "Host" ALTER COLUMN "hostType" DROP DEFAULT;
ALTER TABLE "Host" ALTER COLUMN "hostType" TYPE "HostType_new" USING ("hostType"::text::"HostType_new");
ALTER TYPE "HostType" RENAME TO "HostType_old";
ALTER TYPE "HostType_new" RENAME TO "HostType";
DROP TYPE "HostType_old";
ALTER TABLE "Host" ALTER COLUMN "hostType" SET DEFAULT 'Personal';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('Reserved', 'Hold', 'Pending');
ALTER TABLE "Reservation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "ReservationStatus_old";
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- DropForeignKey
ALTER TABLE "NearestStation" DROP CONSTRAINT "NearestStation_stationId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "addressLine1" VARCHAR(255) NOT NULL,
ADD COLUMN     "addressLine2" VARCHAR(255) NOT NULL,
ADD COLUMN     "city" VARCHAR(255) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "postalCode" VARCHAR(8) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NearestStation" DROP CONSTRAINT "NearestStation_pkey",
DROP COLUMN "stationId",
ADD COLUMN     "stationId" INTEGER NOT NULL,
ADD PRIMARY KEY ("spaceId", "stationId");

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT E'Pending';

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "ip",
ADD COLUMN     "ips" VARCHAR(15) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SpacePricePlan" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Station" DROP CONSTRAINT "Station_pkey",
DROP COLUMN "area",
DROP COLUMN "line",
DROP COLUMN "name",
ADD COLUMN     "address" VARCHAR(511),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "lineCode" INTEGER,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "stationName" VARCHAR(255) NOT NULL,
ADD COLUMN     "stationZipCode" VARCHAR(8),
ADD COLUMN     "status" SMALLINT,
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "IpData" (
    "id" TEXT NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainLine" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "nameKana" VARCHAR(255),
    "nameOfficial" VARCHAR(255),
    "color" VARCHAR(6),
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "zoom" SMALLINT,
    "status" SMALLINT,
    "order" INTEGER NOT NULL,
    "stationId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "nameKana" VARCHAR(255) NOT NULL,
    "nameRomaji" VARCHAR(255) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "stationId" INTEGER NOT NULL,
    "addressId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StationToTrainLine" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StationToTrainLine_AB_unique" ON "_StationToTrainLine"("A", "B");

-- CreateIndex
CREATE INDEX "_StationToTrainLine_B_index" ON "_StationToTrainLine"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Host.email_unique" ON "Host"("email");

-- AddForeignKey
ALTER TABLE "IpData" ADD FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainLine" ADD FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prefecture" ADD FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prefecture" ADD FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StationToTrainLine" ADD FOREIGN KEY ("A") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StationToTrainLine" ADD FOREIGN KEY ("B") REFERENCES "TrainLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
