/*
  Warnings:

  - You are about to drop the column `acountId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `acountId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `acountId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_acountId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_acountId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_acountId_fkey";

-- DropIndex
DROP INDEX "Company_acountId_unique";

-- DropIndex
DROP INDEX "Session_acountId_unique";

-- DropIndex
DROP INDEX "User_acountId_unique";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "acountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "acountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "acountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Company_accountId_unique" ON "Company"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_accountId_unique" ON "Session"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_unique" ON "User"("accountId");

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
