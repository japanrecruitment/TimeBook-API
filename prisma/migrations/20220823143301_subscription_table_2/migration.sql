/*
  Warnings:

  - You are about to drop the column `amount` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodStart` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `isCanceled` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `remainingUnit` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "amount",
DROP COLUMN "currentPeriodEnd",
DROP COLUMN "currentPeriodStart",
DROP COLUMN "isCanceled",
DROP COLUMN "name",
DROP COLUMN "remainingUnit",
DROP COLUMN "type",
DROP COLUMN "unit";
