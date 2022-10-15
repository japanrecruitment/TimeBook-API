/*
  Warnings:

  - Added the required column `amount` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPeriodEnd` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPeriodStart` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingUnit` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripePriceId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeProductId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "currentPeriodStart" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "isCanceled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "remainingUnit" INTEGER NOT NULL,
ADD COLUMN     "stripePriceId" TEXT NOT NULL,
ADD COLUMN     "stripeProductId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "unit" INTEGER NOT NULL,
ALTER COLUMN "stripeSubId" SET DATA TYPE TEXT;
