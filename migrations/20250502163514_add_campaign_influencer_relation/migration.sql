/*
  Warnings:

  - You are about to drop the `Influencer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Influencer" DROP CONSTRAINT "Influencer_campaignId_fkey";

-- DropTable
DROP TABLE "Influencer";

-- CreateTable
CREATE TABLE "_CampaignWizardToMarketplaceInfluencer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampaignWizardToMarketplaceInfluencer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CampaignWizardToMarketplaceInfluencer_B_index" ON "_CampaignWizardToMarketplaceInfluencer"("B");

-- AddForeignKey
ALTER TABLE "_CampaignWizardToMarketplaceInfluencer" ADD CONSTRAINT "_CampaignWizardToMarketplaceInfluencer_A_fkey" FOREIGN KEY ("A") REFERENCES "CampaignWizard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignWizardToMarketplaceInfluencer" ADD CONSTRAINT "_CampaignWizardToMarketplaceInfluencer_B_fkey" FOREIGN KEY ("B") REFERENCES "MarketplaceInfluencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
