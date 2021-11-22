-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- RenameIndex
ALTER INDEX "Address_companyId_unique" RENAME TO "Address_companyId_key";

-- RenameIndex
ALTER INDEX "Address_spaceId_unique" RENAME TO "Address_spaceId_key";

-- RenameIndex
ALTER INDEX "Address_userId_unique" RENAME TO "Address_userId_key";

-- RenameIndex
ALTER INDEX "Company_accountId_unique" RENAME TO "Company_accountId_key";

-- RenameIndex
ALTER INDEX "Photo_companyId_unique" RENAME TO "Photo_companyId_key";

-- RenameIndex
ALTER INDEX "Photo_hostId_unique" RENAME TO "Photo_hostId_key";

-- RenameIndex
ALTER INDEX "Photo_photoId_unique" RENAME TO "Photo_photoId_key";

-- RenameIndex
ALTER INDEX "Photo_spaceTypeId_unique" RENAME TO "Photo_spaceTypeId_key";

-- RenameIndex
ALTER INDEX "Photo_userId_unique" RENAME TO "Photo_userId_key";

-- RenameIndex
ALTER INDEX "User_accountId_unique" RENAME TO "User_accountId_key";
