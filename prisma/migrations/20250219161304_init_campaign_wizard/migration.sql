/*
  Warnings:

  - You are about to drop the column `assetsId` on the `CampaignWizard` table. All the data in the column will be lost.
  - You are about to drop the column `audienceId` on the `CampaignWizard` table. All the data in the column will be lost.
  - You are about to drop the column `detailsId` on the `CampaignWizard` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `CampaignWizard` table. All the data in the column will be lost.
  - You are about to drop the column `objectivesId` on the `CampaignWizard` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `CampaignWizard` table. All the data in the column will be lost.
  - The `status` column on the `CampaignWizard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AudienceTargeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignObjectives` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignPeriod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreativeAssets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Demographics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncomeRange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessagingInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OutcomesInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Requirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TargetingCriteria` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `budget` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessGoal` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `influencerHandle` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryContact` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeZone` to the `CampaignWizard` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignWizard" DROP CONSTRAINT "CampaignWizard_assetsId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignWizard" DROP CONSTRAINT "CampaignWizard_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignWizard" DROP CONSTRAINT "CampaignWizard_detailsId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignWizard" DROP CONSTRAINT "CampaignWizard_objectivesId_fkey";

-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_primaryId_fkey";

-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_secondaryId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "Requirement" DROP CONSTRAINT "Requirement_assetsId_fkey";

-- DropForeignKey
ALTER TABLE "TargetingCriteria" DROP CONSTRAINT "TargetingCriteria_incomeRangeId_fkey";

-- DropIndex
DROP INDEX "CampaignWizard_assetsId_key";

-- DropIndex
DROP INDEX "CampaignWizard_audienceId_key";

-- DropIndex
DROP INDEX "CampaignWizard_detailsId_key";

-- DropIndex
DROP INDEX "CampaignWizard_objectivesId_key";

-- AlterTable
ALTER TABLE "CampaignWizard" DROP COLUMN "assetsId",
DROP COLUMN "audienceId",
DROP COLUMN "detailsId",
DROP COLUMN "metadata",
DROP COLUMN "objectivesId",
DROP COLUMN "version",
ADD COLUMN     "assets" JSONB[],
ADD COLUMN     "budget" JSONB NOT NULL,
ADD COLUMN     "businessGoal" TEXT NOT NULL,
ADD COLUMN     "competitors" TEXT[],
ADD COLUMN     "demographics" JSONB,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expectedOutcomes" JSONB,
ADD COLUMN     "features" "Feature"[],
ADD COLUMN     "guidelines" TEXT,
ADD COLUMN     "influencerHandle" TEXT NOT NULL,
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locations" JSONB[],
ADD COLUMN     "messaging" JSONB,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "platform" "Platform" NOT NULL,
ADD COLUMN     "primaryContact" JSONB NOT NULL,
ADD COLUMN     "primaryKPI" "KPI",
ADD COLUMN     "requirements" JSONB[],
ADD COLUMN     "secondaryContact" JSONB,
ADD COLUMN     "secondaryKPIs" "KPI"[],
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "step1Complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "step2Complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "step3Complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "step4Complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targeting" JSONB,
ADD COLUMN     "timeZone" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "AudienceTargeting";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "BudgetInfo";

-- DropTable
DROP TABLE "CampaignDetails";

-- DropTable
DROP TABLE "CampaignObjectives";

-- DropTable
DROP TABLE "CampaignPeriod";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "ContactInfo";

-- DropTable
DROP TABLE "CreativeAssets";

-- DropTable
DROP TABLE "Demographics";

-- DropTable
DROP TABLE "IncomeRange";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "MessagingInfo";

-- DropTable
DROP TABLE "OutcomesInfo";

-- DropTable
DROP TABLE "Requirement";

-- DropTable
DROP TABLE "TargetingCriteria";

-- DropEnum
DROP TYPE "AssetType";

-- DropEnum
DROP TYPE "CampaignStatus";

-- DropEnum
DROP TYPE "Currency";

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
CREATE INDEX "WizardHistory_wizardId_timestamp_idx" ON "WizardHistory"("wizardId", "timestamp");

-- CreateIndex
CREATE INDEX "CampaignWizard_status_createdAt_idx" ON "CampaignWizard"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "WizardHistory" ADD CONSTRAINT "WizardHistory_wizardId_fkey" FOREIGN KEY ("wizardId") REFERENCES "CampaignWizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
