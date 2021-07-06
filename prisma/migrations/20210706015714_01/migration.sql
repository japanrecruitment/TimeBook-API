-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'host', 'admin');

-- CreateEnum
CREATE TYPE "HostType" AS ENUM ('Corporate', 'Personal');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Reserved', 'Hold', 'Pending');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('Profile', 'Space', 'OtherDocuments');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "firstNameKana" VARCHAR(255) NOT NULL,
    "lastNameKana" VARCHAR(255) NOT NULL,
    "type" VARCHAR(10) NOT NULL DEFAULT E'user',
    "phoneNumber" VARCHAR(10),
    "dob" TIMESTAMP(3),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "hostType" "HostType" NOT NULL DEFAULT E'Personal',
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "firstNameKana" VARCHAR(255) NOT NULL,
    "lastNameKana" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(10),
    "dob" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "RegistrationNumber" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "ips" VARCHAR(15) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpData" (
    "id" TEXT NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "postalCode" VARCHAR(8) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prefectureId" INTEGER NOT NULL,
    "hostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

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
    "userId" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "original" VARCHAR(255) NOT NULL,
    "medium" VARCHAR(255) NOT NULL,
    "small" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT,
    "hostId" TEXT,
    "userId" TEXT,
    "documentType" "DocumentType" NOT NULL,
    "mediaId" TEXT NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Host.email_unique" ON "Host"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Address_hostId_unique" ON "Address"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_unique" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpacePricePlan_spaceId_unique" ON "SpacePricePlan"("spaceId");

-- AddForeignKey
ALTER TABLE "Session" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpData" ADD FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("prefectureId") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePricePlan" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("approvedBy") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("prefectureCode") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD FOREIGN KEY ("lineCode") REFERENCES "TrainLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
