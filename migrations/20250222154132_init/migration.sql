-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GBP', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('Instagram', 'YouTube', 'TikTok');

-- CreateEnum
CREATE TYPE "KPI" AS ENUM ('adRecall', 'brandAwareness', 'consideration', 'messageAssociation', 'brandPreference', 'purchaseIntent', 'actionIntent', 'recommendationIntent', 'advocacy');

-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('CREATIVE_ASSET_TESTING', 'BRAND_LIFT', 'BRAND_HEALTH', 'MIXED_MEDIA_MODELLING');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('Manager', 'Director', 'VP');

-- CreateEnum
CREATE TYPE "CreativeAssetType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted');

-- CreateTable
CREATE TABLE "CampaignWizardSubmission" (
    "id" SERIAL NOT NULL,
    "campaignName" TEXT NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "contacts" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "totalBudget" DOUBLE PRECISION NOT NULL,
    "socialMediaBudget" DOUBLE PRECISION NOT NULL,
    "platform" "Platform" NOT NULL,
    "influencerHandle" TEXT NOT NULL,
    "primaryContactId" INTEGER NOT NULL,
    "secondaryContactId" INTEGER NOT NULL,
    "mainMessage" VARCHAR(3000) NOT NULL,
    "hashtags" TEXT NOT NULL,
    "memorability" TEXT NOT NULL,
    "keyBenefits" TEXT NOT NULL,
    "expectedAchievements" TEXT NOT NULL,
    "purchaseIntent" TEXT NOT NULL,
    "brandPerception" TEXT NOT NULL,
    "primaryKPI" "KPI" NOT NULL,
    "secondaryKPIs" "KPI"[],
    "features" "Feature"[],
    "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignWizardSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrimaryContact" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" "Position" NOT NULL,

    CONSTRAINT "PrimaryContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecondaryContact" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" "Position" NOT NULL,

    CONSTRAINT "SecondaryContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audience" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "age1824" INTEGER NOT NULL,
    "age2534" INTEGER NOT NULL,
    "age3544" INTEGER NOT NULL,
    "age4554" INTEGER NOT NULL,
    "age5564" INTEGER NOT NULL,
    "age65plus" INTEGER NOT NULL,
    "otherGender" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "jobTitles" TEXT NOT NULL,
    "incomeLevel" TEXT NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceLocation" (
    "id" SERIAL NOT NULL,
    "audienceId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "AudienceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceGender" (
    "id" SERIAL NOT NULL,
    "audienceId" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,

    CONSTRAINT "AudienceGender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceScreeningQuestion" (
    "id" SERIAL NOT NULL,
    "audienceId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "AudienceScreeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceLanguage" (
    "id" SERIAL NOT NULL,
    "audienceId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "AudienceLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceCompetitor" (
    "id" SERIAL NOT NULL,
    "audienceId" INTEGER NOT NULL,
    "competitor" TEXT NOT NULL,

    CONSTRAINT "AudienceCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeAsset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "assetName" TEXT NOT NULL,
    "influencerHandle" TEXT,
    "influencerName" TEXT,
    "influencerFollowers" TEXT,
    "whyInfluencer" TEXT,
    "budget" DOUBLE PRECISION,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "CreativeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeRequirement" (
    "id" SERIAL NOT NULL,
    "requirement" TEXT NOT NULL,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "CreativeRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizardSubmission_primaryContactId_key" ON "CampaignWizardSubmission"("primaryContactId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizardSubmission_secondaryContactId_key" ON "CampaignWizardSubmission"("secondaryContactId");

-- CreateIndex
CREATE UNIQUE INDEX "Audience_campaignId_key" ON "Audience"("campaignId");

-- CreateIndex
CREATE INDEX "CreativeAsset_submissionId_idx" ON "CreativeAsset"("submissionId");

-- AddForeignKey
ALTER TABLE "CampaignWizardSubmission" ADD CONSTRAINT "CampaignWizardSubmission_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "PrimaryContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizardSubmission" ADD CONSTRAINT "CampaignWizardSubmission_secondaryContactId_fkey" FOREIGN KEY ("secondaryContactId") REFERENCES "SecondaryContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audience" ADD CONSTRAINT "Audience_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceLocation" ADD CONSTRAINT "AudienceLocation_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceGender" ADD CONSTRAINT "AudienceGender_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceScreeningQuestion" ADD CONSTRAINT "AudienceScreeningQuestion_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceLanguage" ADD CONSTRAINT "AudienceLanguage_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceCompetitor" ADD CONSTRAINT "AudienceCompetitor_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeRequirement" ADD CONSTRAINT "CreativeRequirement_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
