-- AlterTable
ALTER TABLE "CancelPolicy" ADD COLUMN     "hotelId" TEXT,
ALTER COLUMN "spaceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CancelPolicy" ADD CONSTRAINT "CancelPolicy_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
