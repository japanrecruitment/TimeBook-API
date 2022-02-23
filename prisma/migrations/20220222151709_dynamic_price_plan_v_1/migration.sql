/*
  Warnings:

  - You are about to drop the column `default` on the `SpaceSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SpacePricePlan" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SpaceSetting" DROP COLUMN "default",
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
