/*
  Warnings:

  - You are about to drop the `__SpaceOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "__SpaceOptions" DROP CONSTRAINT "__SpaceOptions_A_fkey";

-- DropForeignKey
ALTER TABLE "__SpaceOptions" DROP CONSTRAINT "__SpaceOptions_B_fkey";

-- DropTable
DROP TABLE "__SpaceOptions";

-- CreateTable
CREATE TABLE "__SpaceIncludedOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "__SpaceAdditionalOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__SpaceIncludedOptions_AB_unique" ON "__SpaceIncludedOptions"("A", "B");

-- CreateIndex
CREATE INDEX "__SpaceIncludedOptions_B_index" ON "__SpaceIncludedOptions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "__SpaceAdditionalOptions_AB_unique" ON "__SpaceAdditionalOptions"("A", "B");

-- CreateIndex
CREATE INDEX "__SpaceAdditionalOptions_B_index" ON "__SpaceAdditionalOptions"("B");

-- AddForeignKey
ALTER TABLE "__SpaceIncludedOptions" ADD CONSTRAINT "__SpaceIncludedOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceIncludedOptions" ADD CONSTRAINT "__SpaceIncludedOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceAdditionalOptions" ADD CONSTRAINT "__SpaceAdditionalOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceAdditionalOptions" ADD CONSTRAINT "__SpaceAdditionalOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
