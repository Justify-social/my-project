/*
  Warnings:

  - You are about to drop the `_CampaignWizardToMarketplaceInfluencer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CampaignWizardToMarketplaceInfluencer" DROP CONSTRAINT "_CampaignWizardToMarketplaceInfluencer_A_fkey";

-- DropForeignKey
ALTER TABLE "_CampaignWizardToMarketplaceInfluencer" DROP CONSTRAINT "_CampaignWizardToMarketplaceInfluencer_B_fkey";

-- DropTable
DROP TABLE "_CampaignWizardToMarketplaceInfluencer";

-- CreateTable
CREATE TABLE "CampaignSelectedInfluencer" (
    "campaignWizardId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignSelectedInfluencer_pkey" PRIMARY KEY ("campaignWizardId","influencerId")
);

-- CreateIndex
CREATE INDEX "CampaignSelectedInfluencer_campaignWizardId_idx" ON "CampaignSelectedInfluencer"("campaignWizardId");

-- CreateIndex
CREATE INDEX "CampaignSelectedInfluencer_influencerId_idx" ON "CampaignSelectedInfluencer"("influencerId");

-- AddForeignKey
ALTER TABLE "CampaignSelectedInfluencer" ADD CONSTRAINT "CampaignSelectedInfluencer_campaignWizardId_fkey" FOREIGN KEY ("campaignWizardId") REFERENCES "CampaignWizard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSelectedInfluencer" ADD CONSTRAINT "CampaignSelectedInfluencer_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "MarketplaceInfluencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
