-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SpaceType" ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT false;
