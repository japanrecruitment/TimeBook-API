/*
  Warnings:

  - You are about to drop the `__HotelCancelPolicies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `__PackagePlanCancelPolicies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `__SpaceCancelPolicies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "__HotelCancelPolicies" DROP CONSTRAINT "__HotelCancelPolicies_A_fkey";

-- DropForeignKey
ALTER TABLE "__HotelCancelPolicies" DROP CONSTRAINT "__HotelCancelPolicies_B_fkey";

-- DropForeignKey
ALTER TABLE "__PackagePlanCancelPolicies" DROP CONSTRAINT "__PackagePlanCancelPolicies_A_fkey";

-- DropForeignKey
ALTER TABLE "__PackagePlanCancelPolicies" DROP CONSTRAINT "__PackagePlanCancelPolicies_B_fkey";

-- DropForeignKey
ALTER TABLE "__SpaceCancelPolicies" DROP CONSTRAINT "__SpaceCancelPolicies_A_fkey";

-- DropForeignKey
ALTER TABLE "__SpaceCancelPolicies" DROP CONSTRAINT "__SpaceCancelPolicies_B_fkey";

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "cancelPolicyId" TEXT;

-- AlterTable
ALTER TABLE "PackagePlan" ADD COLUMN     "cancelPolicyId" TEXT;

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "cancelPolicyId" TEXT;

-- DropTable
DROP TABLE "__HotelCancelPolicies";

-- DropTable
DROP TABLE "__PackagePlanCancelPolicies";

-- DropTable
DROP TABLE "__SpaceCancelPolicies";

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_cancelPolicyId_fkey" FOREIGN KEY ("cancelPolicyId") REFERENCES "CancelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_cancelPolicyId_fkey" FOREIGN KEY ("cancelPolicyId") REFERENCES "CancelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePlan" ADD CONSTRAINT "PackagePlan_cancelPolicyId_fkey" FOREIGN KEY ("cancelPolicyId") REFERENCES "CancelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
