/*
  Warnings:

  - You are about to drop the column `beforeHours` on the `CancelPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `CancelPolicy` table. All the data in the column will be lost.
  - Added the required column `name` to the `CancelPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CancelPolicy" DROP COLUMN "beforeHours",
DROP COLUMN "percentage",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CancelPolicyRate" (
    "id" TEXT NOT NULL,
    "beforeHours" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "cancelPolicyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancelPolicyRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CancelPolicyRate" ADD CONSTRAINT "CancelPolicyRate_cancelPolicyId_fkey" FOREIGN KEY ("cancelPolicyId") REFERENCES "CancelPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
