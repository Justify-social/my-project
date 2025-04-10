-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'TIKTOK');

-- CreateEnum
CREATE TYPE "KPI" AS ENUM ('AD_RECALL', 'BRAND_AWARENESS', 'CONSIDERATION', 'MESSAGE_ASSOCIATION', 'BRAND_PREFERENCE', 'PURCHASE_INTENT', 'ACTION_INTENT', 'RECOMMENDATION_INTENT', 'ADVOCACY');

-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('CREATIVE_ASSET_TESTING', 'BRAND_LIFT', 'BRAND_HEALTH', 'MIXED_MEDIA_MODELING');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GBP', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('Manager', 'Director', 'VP');

-- CreateEnum
CREATE TYPE "CreativeAssetType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

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
    "additionalContacts" JSONB,
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
    "userId" TEXT,

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
    "secondaryContactId" INTEGER,
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
    "userId" TEXT,

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
    "ageRangeMin" INTEGER NOT NULL,
    "ageRangeMax" INTEGER NOT NULL,
    "keywords" TEXT[],
    "interests" TEXT[],
    "campaignId" INTEGER NOT NULL,
    "age1824" INTEGER NOT NULL DEFAULT 0,
    "age2534" INTEGER NOT NULL DEFAULT 0,
    "age3544" INTEGER NOT NULL DEFAULT 0,
    "age4554" INTEGER NOT NULL DEFAULT 0,
    "age5564" INTEGER NOT NULL DEFAULT 0,
    "age65plus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceLocation" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "proportion" DOUBLE PRECISION NOT NULL,
    "audienceId" INTEGER NOT NULL,

    CONSTRAINT "AudienceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceGender" (
    "id" SERIAL NOT NULL,
    "gender" TEXT NOT NULL,
    "proportion" DOUBLE PRECISION NOT NULL,
    "audienceId" INTEGER NOT NULL,

    CONSTRAINT "AudienceGender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceScreeningQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "audienceId" INTEGER NOT NULL,

    CONSTRAINT "AudienceScreeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceLanguage" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "audienceId" INTEGER NOT NULL,

    CONSTRAINT "AudienceLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceCompetitor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "audienceId" INTEGER NOT NULL,

    CONSTRAINT "AudienceCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeAsset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "CreativeAssetType" NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "dimensions" TEXT,
    "duration" INTEGER,
    "format" TEXT NOT NULL,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "CreativeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeRequirement" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "CreativeRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPrefs" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignUpdates" BOOLEAN NOT NULL DEFAULT false,
    "brandHealthAlerts" BOOLEAN NOT NULL DEFAULT false,
    "aiInsightNotifications" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationPrefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandingSettings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "headerFont" TEXT NOT NULL,
    "headerFontSize" TEXT NOT NULL,
    "bodyFont" TEXT NOT NULL,
    "bodyFontSize" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignWizard_status_createdAt_idx" ON "CampaignWizard"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Influencer_campaignId_idx" ON "Influencer"("campaignId");

-- CreateIndex
CREATE INDEX "WizardHistory_wizardId_timestamp_idx" ON "WizardHistory"("wizardId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizardSubmission_primaryContactId_key" ON "CampaignWizardSubmission"("primaryContactId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizardSubmission_secondaryContactId_key" ON "CampaignWizardSubmission"("secondaryContactId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPrefs_userId_key" ON "NotificationPrefs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandingSettings_companyId_key" ON "BrandingSettings"("companyId");

-- AddForeignKey
ALTER TABLE "CampaignWizard" ADD CONSTRAINT "CampaignWizard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Influencer" ADD CONSTRAINT "Influencer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CampaignWizard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WizardHistory" ADD CONSTRAINT "WizardHistory_wizardId_fkey" FOREIGN KEY ("wizardId") REFERENCES "CampaignWizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizardSubmission" ADD CONSTRAINT "CampaignWizardSubmission_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "PrimaryContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizardSubmission" ADD CONSTRAINT "CampaignWizardSubmission_secondaryContactId_fkey" FOREIGN KEY ("secondaryContactId") REFERENCES "SecondaryContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWizardSubmission" ADD CONSTRAINT "CampaignWizardSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "NotificationPrefs" ADD CONSTRAINT "NotificationPrefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
