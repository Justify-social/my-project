/*
  Warnings:

  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('CREATIVE_ASSET_TESTING', 'BRAND_LIFT', 'BRAND_HEALTH', 'MIXED_MEDIA_MODELING');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'TIKTOK');

-- CreateEnum
CREATE TYPE "KPI" AS ENUM ('AD_RECALL', 'BRAND_AWARENESS', 'CONSIDERATION', 'MESSAGE_ASSOCIATION', 'BRAND_PREFERENCE', 'PURCHASE_INTENT', 'ACTION_INTENT', 'RECOMMENDATION_INTENT', 'ADVOCACY');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GBP', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- DropTable
DROP TABLE "Campaign";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assetsId" TEXT NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignWizard" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "detailsId" TEXT NOT NULL,
    "objectivesId" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "assetsId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "CampaignWizard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignDetails" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "businessGoal" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "contacts" JSONB NOT NULL,
    "budget" JSONB NOT NULL,
    "platform" "Platform" NOT NULL,
    "influencerHandle" VARCHAR(255) NOT NULL,

    CONSTRAINT "CampaignDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignObjectives" (
    "id" TEXT NOT NULL,
    "primaryKPI" "KPI" NOT NULL,
    "secondaryKPIs" "KPI"[],
    "messaging" JSONB NOT NULL,
    "expectedOutcomes" JSONB NOT NULL,
    "features" "Feature"[],

    CONSTRAINT "CampaignObjectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceTargeting" (
    "id" TEXT NOT NULL,
    "demographics" JSONB NOT NULL,
    "targeting" JSONB NOT NULL,
    "competitors" TEXT[],

    CONSTRAINT "AudienceTargeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeAssets" (
    "id" TEXT NOT NULL,
    "assets" JSONB[],
    "guidelines" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CreativeAssets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignPeriod" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,

    CONSTRAINT "CampaignPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "primaryId" TEXT NOT NULL,
    "secondaryId" TEXT,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetInfo" (
    "id" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "totalBudget" DECIMAL(65,30) NOT NULL,
    "socialMediaBudget" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BudgetInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessagingInfo" (
    "id" TEXT NOT NULL,
    "mainMessage" TEXT NOT NULL,
    "hashtags" TEXT[],
    "brandPerception" TEXT NOT NULL,
    "keyBenefits" TEXT[],

    CONSTRAINT "MessagingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutcomesInfo" (
    "id" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "purchaseIntent" TEXT NOT NULL,

    CONSTRAINT "OutcomesInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demographics" (
    "id" TEXT NOT NULL,
    "ageDistribution" JSONB NOT NULL,
    "genderIdentities" TEXT[],
    "languages" TEXT[],

    CONSTRAINT "Demographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetingCriteria" (
    "id" TEXT NOT NULL,
    "educationLevel" TEXT,
    "jobTitles" TEXT[],
    "incomeRangeId" TEXT,
    "screeningQuestions" JSONB,

    CONSTRAINT "TargetingCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeRange" (
    "id" TEXT NOT NULL,
    "min" DECIMAL(65,30) NOT NULL,
    "max" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL,

    CONSTRAINT "IncomeRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(65,30),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "performedBy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizard_detailsId_key" ON "CampaignWizard"("detailsId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizard_objectivesId_key" ON "CampaignWizard"("objectivesId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizard_audienceId_key" ON "CampaignWizard"("audienceId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizard_assetsId_key" ON "CampaignWizard"("assetsId");

-- CreateIndex
CREATE INDEX "CampaignWizard_status_createdAt_idx" ON "CampaignWizard"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_primaryId_key" ON "ContactInfo"("primaryId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_secondaryId_key" ON "ContactInfo"("secondaryId");

-- CreateIndex
CREATE UNIQUE INDEX "TargetingCriteria_incomeRangeId_key" ON "TargetingCriteria"("incomeRangeId");

-- CreateIndex
CREATE INDEX "AuditLog_campaignId_timestamp_idx" ON "AuditLog"("campaignId", "timestamp");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "AudienceTargeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_assetsId_fkey" FOREIGN KEY ("assetsId") REFERENCES "CreativeAssets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizard" ADD CONSTRAINT "CampaignWizard_detailsId_fkey" FOREIGN KEY ("detailsId") REFERENCES "CampaignDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizard" ADD CONSTRAINT "CampaignWizard_objectivesId_fkey" FOREIGN KEY ("objectivesId") REFERENCES "CampaignObjectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizard" ADD CONSTRAINT "CampaignWizard_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "AudienceTargeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizard" ADD CONSTRAINT "CampaignWizard_assetsId_fkey" FOREIGN KEY ("assetsId") REFERENCES "CreativeAssets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_primaryId_fkey" FOREIGN KEY ("primaryId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_secondaryId_fkey" FOREIGN KEY ("secondaryId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetingCriteria" ADD CONSTRAINT "TargetingCriteria_incomeRangeId_fkey" FOREIGN KEY ("incomeRangeId") REFERENCES "IncomeRange"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CampaignWizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
