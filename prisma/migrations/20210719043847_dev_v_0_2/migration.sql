/*
  Warnings:

  - Added the required column `profileType` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('UserProfile', 'CompanyProfile');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "profileType" "ProfileType" NOT NULL;
