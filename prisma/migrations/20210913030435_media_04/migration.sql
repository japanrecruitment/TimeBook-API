/*
  Warnings:

  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mime` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_mediaId_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "large" JSONB,
ADD COLUMN     "medium" JSONB,
ADD COLUMN     "mime" VARCHAR(15) NOT NULL,
ADD COLUMN     "small" JSONB,
ADD COLUMN     "thumbnail" JSONB,
ADD COLUMN     "type" "PhotoType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Photo";
