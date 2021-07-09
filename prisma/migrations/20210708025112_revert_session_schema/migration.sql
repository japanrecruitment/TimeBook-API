/*
  Warnings:

  - The primary key for the `IpData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sessionId` on the `IpData` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `IpData` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to drop the column `ips` on the `Session` table. All the data in the column will be lost.
  - Added the required column `time` to the `NearestStation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `via` to the `NearestStation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IpData" DROP CONSTRAINT "IpData_sessionId_fkey";

-- AlterTable
ALTER TABLE "IpData" DROP CONSTRAINT "IpData_pkey",
DROP COLUMN "sessionId",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "countryCode" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "data" DROP NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "NearestStation" ADD COLUMN     "time" INTEGER NOT NULL,
ADD COLUMN     "via" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "ips",
ADD COLUMN     "ip" VARCHAR(15) NOT NULL;
