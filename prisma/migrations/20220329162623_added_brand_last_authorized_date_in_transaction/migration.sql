/*
  Warnings:

  - Added the required column `brand` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastAuthorizedDate` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "lastAuthorizedDate" TIMESTAMP(6) NOT NULL;
