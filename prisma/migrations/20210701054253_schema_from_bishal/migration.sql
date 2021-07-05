-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'host', 'admin');

-- CreateEnum
CREATE TYPE "HostType" AS ENUM ('Company', 'Personal');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Reserved', 'Hold', 'NotReserved');

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

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "hostType" "HostType" NOT NULL DEFAULT E'Personal',
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "firstNameKana" VARCHAR(255) NOT NULL,
    "lastNameKana" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(10),
    "dob" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "RegistrationNumber" VARCHAR(50) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
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
    "spaceId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "fromDateTime" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toDateTime" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT E'NotReserved',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "original" VARCHAR(255) NOT NULL,
    "medium" VARCHAR(255) NOT NULL,
    "small" VARCHAR(255) NOT NULL,

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
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "area" VARCHAR(255) NOT NULL,
    "line" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearestStation" (
    "spaceId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,

    PRIMARY KEY ("spaceId","stationId")
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
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "ip" VARCHAR(15) NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Address_hostId_unique" ON "Address"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_unique" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpacePricePlan_spaceId_unique" ON "SpacePricePlan"("spaceId");

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
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;
