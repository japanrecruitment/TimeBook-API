-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "lastAuthorizedDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "lastAuthorizedDate" SET DATA TYPE TIMESTAMP(3);