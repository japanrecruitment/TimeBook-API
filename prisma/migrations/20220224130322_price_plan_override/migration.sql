-- CreateEnum
CREATE TYPE "PricePlanOverrideType" AS ENUM ('DAY_OF_WEEK', 'DATE_TIME');

-- CreateTable
CREATE TABLE "PricePlanOverride" (
    "id" TEXT NOT NULL,
    "pricePlanId" TEXT NOT NULL,
    "type" "PricePlanOverrideType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "daysOfWeek" INTEGER[],
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricePlanOverride_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PricePlanOverride" ADD CONSTRAINT "PricePlanOverride_pricePlanId_fkey" FOREIGN KEY ("pricePlanId") REFERENCES "SpacePricePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
