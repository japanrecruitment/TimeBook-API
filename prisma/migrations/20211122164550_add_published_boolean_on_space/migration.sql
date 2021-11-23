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
CREATE TYPE "PhotoType" AS ENUM ('Profile', 'Cover', 'General');

-- CreateEnum
CREATE TYPE "SpacePricePlanType" AS ENUM ('DAILY', 'HOURLY');

-- CreateEnum
CREATE TYPE "PaymentSourceType" AS ENUM ('Card');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('SINGLE', 'GROUP');

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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "PaymentSource_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "IpData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(255) NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "postalCode" VARCHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prefectureId" INTEGER NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "spaceId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "maximumCapacity" INTEGER NOT NULL DEFAULT 0,
    "numberOfSeats" INTEGER NOT NULL DEFAULT 0,
    "spaceSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "needApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpacePricePlan" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "SpacePricePlanType" NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maintenanceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastMinuteDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cooldownTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "SpacePricePlan_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "TrainLine_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearestStation" (
    "spaceId" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "via" TEXT NOT NULL,

    CONSTRAINT "NearestStation_pkey" PRIMARY KEY ("spaceId","stationId")
);

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "nameKana" VARCHAR(255) NOT NULL,
    "nameRomaji" VARCHAR(255) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Prefecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceType" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SpaceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space_To_SpaceType" (
    "spaceId" TEXT NOT NULL,
    "spaceTypeId" TEXT NOT NULL,

    CONSTRAINT "Space_To_SpaceType_pkey" PRIMARY KEY ("spaceId","spaceTypeId")
);

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "remainingCredit" INTEGER DEFAULT 0,
    "expiryDate" DATE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "mime" VARCHAR(15) NOT NULL,
    "type" "PhotoType" NOT NULL,
    "thumbnail" JSONB,
    "medium" JSONB,
    "small" JSONB,
    "large" JSONB,
    "postUploadInfo" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT,
    "spaceTypeId" TEXT,
    "userId" TEXT,
    "companyId" TEXT,
    "hostId" TEXT,
    "photoId" TEXT,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "type" "ChatType" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__AccountsChat" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_accountId_key" ON "Company"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Host_accountId_key" ON "Host"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "IpData_ipAddress_key" ON "IpData"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_companyId_key" ON "Address"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_spaceId_key" ON "Address"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Credit_accountId_key" ON "Credit"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_spaceTypeId_key" ON "Photo"("spaceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_userId_key" ON "Photo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_companyId_key" ON "Photo"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_hostId_key" ON "Photo"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_photoId_key" ON "Photo"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "__AccountsChat_AB_unique" ON "__AccountsChat"("A", "B");

-- CreateIndex
CREATE INDEX "__AccountsChat_B_index" ON "__AccountsChat"("B");

-- AddForeignKey
ALTER TABLE "PaymentSource" ADD CONSTRAINT "PaymentSource_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpData" ADD CONSTRAINT "IpData_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "Prefecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePricePlan" ADD CONSTRAINT "SpacePricePlan_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_reserveeId_fkey" FOREIGN KEY ("reserveeId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_prefectureCode_fkey" FOREIGN KEY ("prefectureCode") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_lineCode_fkey" FOREIGN KEY ("lineCode") REFERENCES "TrainLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD CONSTRAINT "NearestStation_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearestStation" ADD CONSTRAINT "NearestStation_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD CONSTRAINT "Space_To_SpaceType_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space_To_SpaceType" ADD CONSTRAINT "Space_To_SpaceType_spaceTypeId_fkey" FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_spaceTypeId_fkey" FOREIGN KEY ("spaceTypeId") REFERENCES "SpaceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__AccountsChat" ADD FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__AccountsChat" ADD FOREIGN KEY ("B") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
