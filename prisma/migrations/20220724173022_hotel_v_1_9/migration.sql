/*
  Warnings:

  - You are about to drop the column `hotelId` on the `CancelPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `spaceId` on the `CancelPolicy` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `CancelPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CancelPolicy" DROP CONSTRAINT "CancelPolicy_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "CancelPolicy" DROP CONSTRAINT "CancelPolicy_spaceId_fkey";

-- AlterTable
ALTER TABLE "CancelPolicy" DROP COLUMN "hotelId",
DROP COLUMN "spaceId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_CancelPolicyToSpace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CancelPolicyToHotel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CancelPolicyToSpace_AB_unique" ON "_CancelPolicyToSpace"("A", "B");

-- CreateIndex
CREATE INDEX "_CancelPolicyToSpace_B_index" ON "_CancelPolicyToSpace"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CancelPolicyToHotel_AB_unique" ON "_CancelPolicyToHotel"("A", "B");

-- CreateIndex
CREATE INDEX "_CancelPolicyToHotel_B_index" ON "_CancelPolicyToHotel"("B");

-- AddForeignKey
ALTER TABLE "CancelPolicy" ADD CONSTRAINT "CancelPolicy_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CancelPolicyToSpace" ADD CONSTRAINT "_CancelPolicyToSpace_A_fkey" FOREIGN KEY ("A") REFERENCES "CancelPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CancelPolicyToSpace" ADD CONSTRAINT "_CancelPolicyToSpace_B_fkey" FOREIGN KEY ("B") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CancelPolicyToHotel" ADD CONSTRAINT "_CancelPolicyToHotel_A_fkey" FOREIGN KEY ("A") REFERENCES "CancelPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CancelPolicyToHotel" ADD CONSTRAINT "_CancelPolicyToHotel_B_fkey" FOREIGN KEY ("B") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
