/*
  Warnings:

  - You are about to drop the `__PackagePlanAddtionalOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "__PackagePlanAddtionalOptions" DROP CONSTRAINT "__PackagePlanAddtionalOptions_A_fkey";

-- DropForeignKey
ALTER TABLE "__PackagePlanAddtionalOptions" DROP CONSTRAINT "__PackagePlanAddtionalOptions_B_fkey";

-- DropTable
DROP TABLE "__PackagePlanAddtionalOptions";

-- CreateTable
CREATE TABLE "__PackagePlanAdditionalOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__PackagePlanAdditionalOptions_AB_unique" ON "__PackagePlanAdditionalOptions"("A", "B");

-- CreateIndex
CREATE INDEX "__PackagePlanAdditionalOptions_B_index" ON "__PackagePlanAdditionalOptions"("B");

-- AddForeignKey
ALTER TABLE "__PackagePlanAdditionalOptions" ADD CONSTRAINT "__PackagePlanAdditionalOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PackagePlanAdditionalOptions" ADD CONSTRAINT "__PackagePlanAdditionalOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
