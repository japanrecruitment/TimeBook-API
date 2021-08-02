-- DropForeignKey
ALTER TABLE "NearestStation" DROP CONSTRAINT "NearestStation_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "NearestStation" DROP CONSTRAINT "NearestStation_stationId_fkey";

-- DropForeignKey
ALTER TABLE "SpacePricePlan" DROP CONSTRAINT "SpacePricePlan_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "Space_To_SpaceType" DROP CONSTRAINT "Space_To_SpaceType_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "Space_To_SpaceType" DROP CONSTRAINT "Space_To_SpaceType_spaceTypeId_fkey";

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "remainingCredit" INTEGER DEFAULT 0,
    "date" DATE,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "credit" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "monthlyFees" DOUBLE PRECISION NOT NULL,
    "yearlyFees" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credit_accountId_date_key" ON "Credit"("accountId", "date");

-- AddForeignKey
ALTER TABLE "SpacePricePlan" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
