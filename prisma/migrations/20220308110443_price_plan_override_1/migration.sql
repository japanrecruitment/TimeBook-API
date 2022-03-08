-- AlterTable
ALTER TABLE "PricePlanOverride" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SpacePricePlan" ALTER COLUMN "duration" DROP DEFAULT,
ALTER COLUMN "amount" DROP DEFAULT;
