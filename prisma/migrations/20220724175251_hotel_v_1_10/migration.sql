/*
  Warnings:

  - You are about to drop the `_CancelPolicyToHotel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CancelPolicyToSpace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CancelPolicyToHotel" DROP CONSTRAINT "_CancelPolicyToHotel_A_fkey";

-- DropForeignKey
ALTER TABLE "_CancelPolicyToHotel" DROP CONSTRAINT "_CancelPolicyToHotel_B_fkey";

-- DropForeignKey
ALTER TABLE "_CancelPolicyToSpace" DROP CONSTRAINT "_CancelPolicyToSpace_A_fkey";

-- DropForeignKey
ALTER TABLE "_CancelPolicyToSpace" DROP CONSTRAINT "_CancelPolicyToSpace_B_fkey";

-- DropTable
DROP TABLE "_CancelPolicyToHotel";

-- DropTable
DROP TABLE "_CancelPolicyToSpace";

-- CreateTable
CREATE TABLE "__SpaceCancelPolicies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "__HotelCancelPolicies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__SpaceCancelPolicies_AB_unique" ON "__SpaceCancelPolicies"("A", "B");

-- CreateIndex
CREATE INDEX "__SpaceCancelPolicies_B_index" ON "__SpaceCancelPolicies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "__HotelCancelPolicies_AB_unique" ON "__HotelCancelPolicies"("A", "B");

-- CreateIndex
CREATE INDEX "__HotelCancelPolicies_B_index" ON "__HotelCancelPolicies"("B");

-- AddForeignKey
ALTER TABLE "__SpaceCancelPolicies" ADD CONSTRAINT "__SpaceCancelPolicies_A_fkey" FOREIGN KEY ("A") REFERENCES "CancelPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__SpaceCancelPolicies" ADD CONSTRAINT "__SpaceCancelPolicies_B_fkey" FOREIGN KEY ("B") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__HotelCancelPolicies" ADD CONSTRAINT "__HotelCancelPolicies_A_fkey" FOREIGN KEY ("A") REFERENCES "CancelPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__HotelCancelPolicies" ADD CONSTRAINT "__HotelCancelPolicies_B_fkey" FOREIGN KEY ("B") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
