-- CreateTable
CREATE TABLE "MarketplaceInfluencer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "platforms" "Platform"[],
    "followersCount" INTEGER,
    "justifyScore" DOUBLE PRECISION,
    "isPhylloVerified" BOOLEAN,
    "primaryAudienceLocation" TEXT,
    "primaryAudienceAgeRange" TEXT,
    "primaryAudienceGender" TEXT,
    "engagementRate" DOUBLE PRECISION,
    "audienceQualityIndicator" TEXT,
    "bio" TEXT,
    "contactEmail" TEXT,
    "audienceDemographics" JSONB,
    "engagementMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phylloDataLastRefreshedAt" TIMESTAMP(3),

    CONSTRAINT "MarketplaceInfluencer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_justifyScore_idx" ON "MarketplaceInfluencer"("justifyScore");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_followersCount_idx" ON "MarketplaceInfluencer"("followersCount");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_primaryAudienceLocation_idx" ON "MarketplaceInfluencer"("primaryAudienceLocation");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_primaryAudienceAgeRange_idx" ON "MarketplaceInfluencer"("primaryAudienceAgeRange");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_isPhylloVerified_idx" ON "MarketplaceInfluencer"("isPhylloVerified");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_platforms_idx" ON "MarketplaceInfluencer"("platforms");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_handle_idx" ON "MarketplaceInfluencer"("handle");

-- AddForeignKey
ALTER TABLE "BrandingSettings" ADD CONSTRAINT "BrandingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
