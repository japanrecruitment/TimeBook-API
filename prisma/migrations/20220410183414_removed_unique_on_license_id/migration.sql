-- DropIndex
DROP INDEX "Photo_licenseId_key";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "lastAuthorizedDate" DROP DEFAULT,
ALTER COLUMN "lastAuthorizedDate" SET DATA TYPE DATE;
