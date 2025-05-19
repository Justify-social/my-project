-- DropForeignKey
ALTER TABLE "Audience" DROP CONSTRAINT "Audience_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "AudienceCompetitor" DROP CONSTRAINT "AudienceCompetitor_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "AudienceGender" DROP CONSTRAINT "AudienceGender_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "AudienceLanguage" DROP CONSTRAINT "AudienceLanguage_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "AudienceLocation" DROP CONSTRAINT "AudienceLocation_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "AudienceScreeningQuestion" DROP CONSTRAINT "AudienceScreeningQuestion_audienceId_fkey";

-- DropForeignKey
ALTER TABLE "CreativeAsset" DROP CONSTRAINT "CreativeAsset_submissionId_fkey";

-- AlterTable
ALTER TABLE "Influencer" ADD COLUMN     "marketplaceInfluencerId" TEXT;

-- CreateIndex
CREATE INDEX "Influencer_marketplaceInfluencerId_idx" ON "Influencer"("marketplaceInfluencerId");

-- AddForeignKey
ALTER TABLE "Influencer" ADD CONSTRAINT "Influencer_marketplaceInfluencerId_fkey" FOREIGN KEY ("marketplaceInfluencerId") REFERENCES "MarketplaceInfluencer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audience" ADD CONSTRAINT "Audience_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceLocation" ADD CONSTRAINT "AudienceLocation_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceGender" ADD CONSTRAINT "AudienceGender_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceScreeningQuestion" ADD CONSTRAINT "AudienceScreeningQuestion_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceLanguage" ADD CONSTRAINT "AudienceLanguage_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceCompetitor" ADD CONSTRAINT "AudienceCompetitor_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
