-- CreateEnum
CREATE TYPE "WalletProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "WalletAccountStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "WalletPaymentMethodType" AS ENUM ('LINK', 'CARD', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WalletPaymentMethodStatus" AS ENUM ('ACTIVE', 'DETACHED');

-- CreateEnum
CREATE TYPE "StarPointPurchaseStatus" AS ENUM ('CREATED', 'CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID', 'POINTS_GRANTED', 'FAILED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "StarPointLedgerEntryType" AS ENUM ('CREDIT_PURCHASE', 'DEBIT_SPEND', 'DEBIT_REFUND', 'CREDIT_ADJUSTMENT', 'DEBIT_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WalletAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "WalletProvider" NOT NULL,
    "providerCustomerId" TEXT NOT NULL,
    "status" "WalletAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletPaymentMethod" (
    "id" TEXT NOT NULL,
    "walletAccountId" TEXT NOT NULL,
    "providerPaymentMethodId" TEXT NOT NULL,
    "type" "WalletPaymentMethodType" NOT NULL DEFAULT 'UNKNOWN',
    "brand" TEXT,
    "last4" TEXT,
    "expMonth" INTEGER,
    "expYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" "WalletPaymentMethodStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletPaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarPointPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAccountId" TEXT,
    "status" "StarPointPurchaseStatus" NOT NULL DEFAULT 'CREATED',
    "provider" "WalletProvider" NOT NULL,
    "productCode" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "providerSessionId" TEXT,
    "providerPaymentIntentId" TEXT,
    "providerChargeId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StarPointPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarPointLedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchaseId" TEXT,
    "entryType" "StarPointLedgerEntryType" NOT NULL,
    "pointsDelta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarPointLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "WalletProvider" NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "payloadHash" TEXT NOT NULL,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "logoUrl" TEXT,
    "league" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "period" INTEGER,
    "timeRemaining" TEXT,
    "possession" TEXT,
    "league" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_provider_userId_key" ON "WalletAccount"("provider", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_provider_providerCustomerId_key" ON "WalletAccount"("provider", "providerCustomerId");

-- CreateIndex
CREATE INDEX "WalletPaymentMethod_walletAccountId_status_idx" ON "WalletPaymentMethod"("walletAccountId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WalletPaymentMethod_walletAccountId_providerPaymentMethodId_key" ON "WalletPaymentMethod"("walletAccountId", "providerPaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "StarPointPurchase_idempotencyKey_key" ON "StarPointPurchase"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "StarPointPurchase_providerSessionId_key" ON "StarPointPurchase"("providerSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "StarPointPurchase_providerPaymentIntentId_key" ON "StarPointPurchase"("providerPaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "StarPointPurchase_providerChargeId_key" ON "StarPointPurchase"("providerChargeId");

-- CreateIndex
CREATE INDEX "StarPointPurchase_userId_createdAt_idx" ON "StarPointPurchase"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StarPointPurchase_status_createdAt_idx" ON "StarPointPurchase"("status", "createdAt");

-- CreateIndex
CREATE INDEX "StarPointLedgerEntry_userId_createdAt_idx" ON "StarPointLedgerEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StarPointLedgerEntry_purchaseId_entryType_idx" ON "StarPointLedgerEntry"("purchaseId", "entryType");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_createdAt_idx" ON "WebhookEvent"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_providerEventId_key" ON "WebhookEvent"("provider", "providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_abbreviation_key" ON "Team"("abbreviation");

-- CreateIndex
CREATE INDEX "Team_league_idx" ON "Team"("league");

-- CreateIndex
CREATE UNIQUE INDEX "Game_externalId_key" ON "Game"("externalId");

-- CreateIndex
CREATE INDEX "Game_state_idx" ON "Game"("state");

-- CreateIndex
CREATE INDEX "Game_scheduledTime_idx" ON "Game"("scheduledTime");

-- CreateIndex
CREATE INDEX "Game_league_idx" ON "Game"("league");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletPaymentMethod" ADD CONSTRAINT "WalletPaymentMethod_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarPointPurchase" ADD CONSTRAINT "StarPointPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarPointPurchase" ADD CONSTRAINT "StarPointPurchase_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarPointLedgerEntry" ADD CONSTRAINT "StarPointLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarPointLedgerEntry" ADD CONSTRAINT "StarPointLedgerEntry_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "StarPointPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
