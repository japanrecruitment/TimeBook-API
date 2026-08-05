-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('Percentage', 'Fixed');

-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "commissionType" "CommissionType" NOT NULL DEFAULT 'Percentage',
ADD COLUMN     "commissionYen" INTEGER NOT NULL DEFAULT 0;
