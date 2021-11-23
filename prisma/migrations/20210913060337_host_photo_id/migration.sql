/*
  Warnings:

  - A unique constraint covering the columns `[hostId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[photoId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "hostId" TEXT,
ADD COLUMN     "photoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Photo_hostId_unique" ON "Photo"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_photoId_unique" ON "Photo"("photoId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;
