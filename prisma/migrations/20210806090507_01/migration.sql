-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'host', 'user');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('UserProfile', 'CompanyProfile');

-- CreateEnum
CREATE TYPE "HostType" AS ENUM ('Individual', 'Corporate');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Reserved', 'Hold', 'Pending');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('Profile', 'Space', 'OtherDocuments');

-- CreateEnum
CREATE TYPE "PaymentSourceType" AS ENUM ('Card');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" VARCHAR(10),
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" VARCHAR(255) NOT NULL,
    "roles" "Role"[],
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileType" "ProfileType" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSource" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "PaymentSourceType" NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "last4" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "firstName" VARCHAR(255) NOT NULL,
    "firstNameKana" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "lastNameKana" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "nameKana" VARCHAR(255) NOT NULL,
    "registrationNumber" VARBIT(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "type" "HostType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "stripeAccountId" VARCHAR(255),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpData" (
    "id" TEXT NOT NULL,
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "countryCode" VARCHAR(2),
    "data" JSONB,
    "ipAddress" VARCHAR(15) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "postalCode" VARCHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "prefectureId" INTEGER NOT NULL,
    "companyId" TEXT,
    "spaceId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "maximumCapacity" INTEGER NOT NULL DEFAULT 0,
    "numberOfSeats" INTEGER NOT NULL DEFAULT 0,
    "spaceSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "needApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpacePricePlan" (
    "id" TEXT NOT NULL,
    "planTitle" VARCHAR(255) NOT NULL,
    "hourlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maintenanceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastMinuteDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cooldownTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "fromDateTime" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toDateTime" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT E'Pending',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT NOT NULL,
    "reserveeId" TEXT NOT NULL,
    "approvedOn" TIMESTAMP(6) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainLine" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "nameKana" VARCHAR(255),
    "nameOfficial" VARCHAR(255),
    "color" VARCHAR(6),
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "zoom" SMALLINT,
    "status" SMALLINT,
    "order" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" INTEGER NOT NULL,
    "stationName" VARCHAR(255) NOT NULL,
    "stationZipCode" VARCHAR(8),
    "address" VARCHAR(511),
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "status" SMALLINT,
    "order" INTEGER,
    "prefectureCode" INTEGER NOT NULL,
    "lineCode" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearestStation" (
    "spaceId" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "via" TEXT NOT NULL,

    PRIMARY KEY ("spaceId","stationId")
);

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "nameKana" VARCHAR(255) NOT NULL,
    "nameRomaji" VARCHAR(255) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceType" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space_To_SpaceType" (
    "spaceId" TEXT NOT NULL,
    "spaceTypeId" TEXT NOT NULL,

    PRIMARY KEY ("spaceId","spaceTypeId")
);

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "remainingCredit" INTEGER DEFAULT 0,
    "expiryDate" DATE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "credit" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "monthlyFees" DOUBLE PRECISION NOT NULL,
    "yearlyFees" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoGallery" (
    "id" TEXT NOT NULL,
    "original" VARCHAR(255) NOT NULL,
    "medium" VARCHAR(255) NOT NULL,
    "small" VARCHAR(255) NOT NULL,
    "large" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "photoGalleryId" TEXT NOT NULL,
    "spaceId" TEXT,
    "spaceTypeId" TEXT,
    "userId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account.email_unique" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_unique" ON "User"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_accountId_unique" ON "Company"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Host.accountId_unique" ON "Host"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "IpData.ipAddress_unique" ON "IpData"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_unique" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_companyId_unique" ON "Address"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_spaceId_unique" ON "Address"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "SpacePricePlan_spaceId_unique" ON "SpacePricePlan"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Credit_accountId_date_key" ON "Credit"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_accountId_unique" ON "Media"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_photoGalleryId_unique" ON "Media"("photoGalleryId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_spaceTypeId_unique" ON "Media"("spaceTypeId");

-- AddForeignKey
ALTER TABLE "PaymentSource" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpData" ADD FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("prefectureId") REFERENCES "Prefecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePricePlan" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("reserveeId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("prefectureCode") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("lineCode") REFERENCES "TrainLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD FOREIGN KEY ("photoGalleryId") REFERENCES "PhotoGallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
