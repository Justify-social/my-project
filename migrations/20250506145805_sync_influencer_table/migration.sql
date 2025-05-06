/*
  Warnings:

  - You are about to drop the `CampaignSelectedInfluencer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CampaignSelectedInfluencer" DROP CONSTRAINT "CampaignSelectedInfluencer_campaignWizardId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignSelectedInfluencer" DROP CONSTRAINT "CampaignSelectedInfluencer_influencerId_fkey";

-- DropTable
DROP TABLE "CampaignSelectedInfluencer";

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

-- CreateIndex
CREATE INDEX "Influencer_campaignId_idx" ON "Influencer"("campaignId");

-- AddForeignKey
ALTER TABLE "Influencer" ADD CONSTRAINT "Influencer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CampaignWizard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
