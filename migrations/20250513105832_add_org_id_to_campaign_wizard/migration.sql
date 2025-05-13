-- AlterTable
ALTER TABLE "BrandLiftStudy" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "CampaignWizard" ADD COLUMN     "orgId" TEXT;

-- CreateIndex
CREATE INDEX "BrandLiftStudy_orgId_idx" ON "BrandLiftStudy"("orgId");

-- CreateIndex
CREATE INDEX "CampaignWizard_orgId_idx" ON "CampaignWizard"("orgId");
