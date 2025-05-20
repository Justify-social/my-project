/*
  Warnings:

  - A unique constraint covering the columns `[muxAssetId]` on the table `CreativeAsset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CreativeAsset" ADD COLUMN     "campaignWizardId" TEXT,
ADD COLUMN     "muxAssetId" TEXT,
ADD COLUMN     "muxProcessingStatus" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "submissionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CreativeAsset_muxAssetId_key" ON "CreativeAsset"("muxAssetId");

-- CreateIndex
CREATE INDEX "CreativeAsset_campaignWizardId_idx" ON "CreativeAsset"("campaignWizardId");

-- CreateIndex
CREATE INDEX "CreativeAsset_muxAssetId_idx" ON "CreativeAsset"("muxAssetId");

-- CreateIndex
CREATE INDEX "CreativeAsset_userId_idx" ON "CreativeAsset"("userId");

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_campaignWizardId_fkey" FOREIGN KEY ("campaignWizardId") REFERENCES "CampaignWizard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
