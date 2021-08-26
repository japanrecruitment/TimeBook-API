/*
  Warnings:

  - You are about to drop the column `dailyPrice` on the `SpacePricePlan` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyPrice` on the `SpacePricePlan` table. All the data in the column will be lost.
  - You are about to drop the column `planTitle` on the `SpacePricePlan` table. All the data in the column will be lost.
  - Added the required column `title` to the `SpacePricePlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `SpacePricePlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SpacePricePlanType" AS ENUM ('DAILY', 'HOURLY');

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "addressLine2" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SpacePricePlan" DROP COLUMN "dailyPrice",
DROP COLUMN "hourlyPrice",
DROP COLUMN "planTitle",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ADD COLUMN     "type" "SpacePricePlanType" NOT NULL;
