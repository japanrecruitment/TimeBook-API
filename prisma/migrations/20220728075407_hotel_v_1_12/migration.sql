/*
  Warnings:

  - You are about to drop the column `aditionalPrice` on the `Option` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `additionalPrice` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTerm` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OptionPaymentTerm" AS ENUM ('PER_PERSON', 'PER_ROOM', 'PER_USE', 'PER_FLAT');

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "aditionalPrice",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "additionalPrice" INTEGER NOT NULL,
ADD COLUMN     "paymentTerm" "OptionPaymentTerm" NOT NULL;

-- CreateTable
CREATE TABLE "__SpaceOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__SpaceOptions_AB_unique" ON "__SpaceOptions"("A", "B");

-- CreateIndex
CREATE INDEX "__SpaceOptions_B_index" ON "__SpaceOptions"("B");

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceOptions" ADD CONSTRAINT "__SpaceOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceOptions" ADD CONSTRAINT "__SpaceOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
