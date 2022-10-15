-- AlterTable
ALTER TABLE "HotelRoomReservation" ALTER COLUMN "fromDateTime" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "toDateTime" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "Option" ALTER COLUMN "startUsage" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "endUsage" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "startReservation" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "endReservation" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "OptionPriceOverride" ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "endDate" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "PackagePlan" ALTER COLUMN "startUsage" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "endUsage" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "startReservation" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "endReservation" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "PriceOverride" ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "endDate" SET DATA TYPE TIMESTAMP(6);
