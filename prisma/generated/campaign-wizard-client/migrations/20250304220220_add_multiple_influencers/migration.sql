-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'TIKTOK');

-- CreateEnum
CREATE TYPE "KPI" AS ENUM ('AD_RECALL', 'BRAND_AWARENESS', 'CONSIDERATION', 'MESSAGE_ASSOCIATION', 'BRAND_PREFERENCE', 'PURCHASE_INTENT', 'ACTION_INTENT', 'RECOMMENDATION_INTENT', 'ADVOCACY');

-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('CREATIVE_ASSET_TESTING', 'BRAND_LIFT', 'BRAND_HEALTH', 'MIXED_MEDIA_MODELING');

-- CreateTable
CREATE TABLE "CampaignWizard" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "name" VARCHAR(255) NOT NULL,
    "businessGoal" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "primaryContact" JSONB NOT NULL,
    "secondaryContact" JSONB,
    "budget" JSONB NOT NULL,
    "step1Complete" BOOLEAN NOT NULL DEFAULT false,
    "primaryKPI" "KPI",
    "secondaryKPIs" "KPI"[],
    "messaging" JSONB,
    "expectedOutcomes" JSONB,
    "features" "Feature"[],
    "step2Complete" BOOLEAN NOT NULL DEFAULT false,
    "demographics" JSONB,
    "locations" JSONB[],
    "targeting" JSONB,
    "competitors" TEXT[],
    "step3Complete" BOOLEAN NOT NULL DEFAULT false,
    "assets" JSONB[],
    "guidelines" TEXT,
    "requirements" JSONB[],
    "notes" TEXT,
    "step4Complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CampaignWizard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Influencer" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "handle" TEXT NOT NULL,
    "platformId" TEXT,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WizardHistory" (
    "id" TEXT NOT NULL,
    "wizardId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "performedBy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WizardHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignWizard_status_createdAt_idx" ON "CampaignWizard"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Influencer_campaignId_idx" ON "Influencer"("campaignId");

-- CreateIndex
CREATE INDEX "WizardHistory_wizardId_timestamp_idx" ON "WizardHistory"("wizardId", "timestamp");

-- AddForeignKey
ALTER TABLE "Influencer" ADD CONSTRAINT "Influencer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CampaignWizard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WizardHistory" ADD CONSTRAINT "WizardHistory_wizardId_fkey" FOREIGN KEY ("wizardId") REFERENCES "CampaignWizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
