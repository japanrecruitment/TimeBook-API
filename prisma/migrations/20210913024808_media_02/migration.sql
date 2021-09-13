/*
  Warnings:

  - You are about to drop the column `photoId` on the `Media` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mediaId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_photoId_fkey";

-- DropIndex
DROP INDEX "Media_photoId_unique";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "photoId";

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "mediaId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Photo_mediaId_unique" ON "Photo"("mediaId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
