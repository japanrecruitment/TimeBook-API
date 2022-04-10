/*
  Warnings:

  - A unique constraint covering the columns `[licenseId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "licenseId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "lastAuthorizedDate" SET DATA TYPE DATE;

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "type" TEXT,
    "approved" BOOLEAN NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_licenseId_key" ON "Photo"("licenseId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;
