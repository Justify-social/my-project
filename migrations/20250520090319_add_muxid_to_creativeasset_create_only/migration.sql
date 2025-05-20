/*
  Warnings:

  - You are about to drop the column `marketplaceInfluencerId` on the `Influencer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[muxPlaybackId]` on the table `CreativeAsset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CreativeAsset` table without a default value. This is not possible if the table is not empty.

*/
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
ALTER TABLE "Influencer" DROP CONSTRAINT "Influencer_marketplaceInfluencerId_fkey";

-- DropIndex
DROP INDEX "Influencer_marketplaceInfluencerId_idx";

-- AlterTable
ALTER TABLE "CreativeAsset" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "muxPlaybackId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "fileSize" DROP NOT NULL,
ALTER COLUMN "format" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Influencer" DROP COLUMN "marketplaceInfluencerId";

-- CreateIndex
CREATE UNIQUE INDEX "CreativeAsset_muxPlaybackId_key" ON "CreativeAsset"("muxPlaybackId");

-- CreateIndex
CREATE INDEX "CreativeAsset_submissionId_idx" ON "CreativeAsset"("submissionId");

-- CreateIndex
CREATE INDEX "CreativeAsset_muxPlaybackId_idx" ON "CreativeAsset"("muxPlaybackId");

-- AddForeignKey
ALTER TABLE "Audience" ADD CONSTRAINT "Audience_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
