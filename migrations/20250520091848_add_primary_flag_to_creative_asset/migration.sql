-- AlterTable
ALTER TABLE "CreativeAsset" ADD COLUMN     "isPrimaryForBrandLiftPreview" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "CreativeAsset_isPrimaryForBrandLiftPreview_idx" ON "CreativeAsset"("isPrimaryForBrandLiftPreview");
