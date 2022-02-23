/*
  Warnings:

  - You are about to drop the `Space_To_SpaceType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Space_To_SpaceType" DROP CONSTRAINT "Space_To_SpaceType_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "Space_To_SpaceType" DROP CONSTRAINT "Space_To_SpaceType_spaceTypeId_fkey";

-- DropTable
DROP TABLE "Space_To_SpaceType";

-- CreateTable
CREATE TABLE "__SpaceTypes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__SpaceTypes_AB_unique" ON "__SpaceTypes"("A", "B");

-- CreateIndex
CREATE INDEX "__SpaceTypes_B_index" ON "__SpaceTypes"("B");

-- AddForeignKey
ALTER TABLE "__SpaceTypes" ADD FOREIGN KEY ("A") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceTypes" ADD FOREIGN KEY ("B") REFERENCES "SpaceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
