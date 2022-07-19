-- CreateTable
CREATE TABLE "StockOverride" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "stock" INTEGER NOT NULL,
    "hotelRoomId" TEXT,
    "packagePlanId" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOverride_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockOverride" ADD CONSTRAINT "StockOverride_hotelRoomId_fkey" FOREIGN KEY ("hotelRoomId") REFERENCES "HotelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOverride" ADD CONSTRAINT "StockOverride_packagePlanId_fkey" FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
