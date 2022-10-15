-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "stock" INTEGER;

-- AlterTable
ALTER TABLE "StockOverride" ADD COLUMN     "optionId" TEXT;

-- CreateTable
CREATE TABLE "OptionPriceOverride" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "paymentTerm" "OptionPaymentTerm" NOT NULL,
    "additionalPrice" INTEGER NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptionPriceOverride_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockOverride" ADD CONSTRAINT "StockOverride_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionPriceOverride" ADD CONSTRAINT "OptionPriceOverride_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
