/*
  Warnings:

  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_spaceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_userId_fkey";

-- DropTable
DROP TABLE "Media";

-- DropEnum
DROP TYPE "MediaType";

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "mime" VARCHAR(15) NOT NULL,
    "type" "PhotoType" NOT NULL,
    "thumbnail" JSONB,
    "medium" JSONB,
    "small" JSONB,
    "large" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT,
    "spaceTypeId" TEXT,
    "userId" TEXT,
    "companyId" TEXT,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_spaceTypeId_unique" ON "Photo"("spaceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_userId_unique" ON "Photo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_companyId_unique" ON "Photo"("companyId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_spaceTypeId_fkey" FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
