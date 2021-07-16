/*
  Warnings:

  - You are about to drop the column `emailVerifiedOn` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mediaId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ipAddress]` on the table `IpData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Reservation_reserveeId_unique";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "emailVerifiedOn",
ADD COLUMN     "phoneNumber" VARCHAR(10),
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "phoneVerified",
ADD COLUMN     "email" VARCHAR(255);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneVerified",
ADD COLUMN     "email" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Company.email_unique" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company.phoneNumber_unique" ON "Company"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Document_mediaId_unique" ON "Document"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "IpData.ipAddress_unique" ON "IpData"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User.phoneNumber_unique" ON "User"("phoneNumber");
