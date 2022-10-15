-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "canceledAt" TIMESTAMP(6),
ADD COLUMN     "endsAt" TIMESTAMP(6);
