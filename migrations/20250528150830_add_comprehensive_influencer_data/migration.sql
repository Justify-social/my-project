-- AlterTable
ALTER TABLE "Influencer" ADD COLUMN     "audienceDemographics" JSONB,
ADD COLUMN     "audienceQuality" TEXT,
ADD COLUMN     "averageComments" INTEGER,
ADD COLUMN     "averageImpressions" INTEGER,
ADD COLUMN     "averageLikes" INTEGER,
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "averageReach" INTEGER,
ADD COLUMN     "averageShares" INTEGER,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "blacklistedBrands" TEXT[],
ADD COLUMN     "brandCollaborations" JSONB,
ADD COLUMN     "brandLiftMetrics" JSONB,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "completionRate" DOUBLE PRECISION,
ADD COLUMN     "contentTypes" TEXT[],
ADD COLUMN     "conversionRate" DOUBLE PRECISION,
ADD COLUMN     "cpc" DOUBLE PRECISION,
ADD COLUMN     "cpm" DOUBLE PRECISION,
ADD COLUMN     "ctr" DOUBLE PRECISION,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fakeFollowerPercent" DOUBLE PRECISION,
ADD COLUMN     "instagramData" JSONB,
ADD COLUMN     "isMarketplaceVisible" BOOLEAN DEFAULT true,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "lastActiveDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "marketplaceRating" DOUBLE PRECISION,
ADD COLUMN     "postingFrequency" TEXT,
ADD COLUMN     "preferredBrands" TEXT[],
ADD COLUMN     "rateCard" JSONB,
ADD COLUMN     "responseTime" TEXT,
ADD COLUMN     "tiktokData" JSONB,
ADD COLUMN     "totalCampaigns" INTEGER DEFAULT 0,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "youtubeData" JSONB;

-- CreateIndex
CREATE INDEX "Influencer_isMarketplaceVisible_idx" ON "Influencer"("isMarketplaceVisible");

-- CreateIndex
CREATE INDEX "Influencer_category_idx" ON "Influencer"("category");

-- CreateIndex
CREATE INDEX "Influencer_followersCount_idx" ON "Influencer"("followersCount");

-- CreateIndex
CREATE INDEX "Influencer_engagementRate_idx" ON "Influencer"("engagementRate");

-- CreateIndex
CREATE INDEX "Influencer_location_idx" ON "Influencer"("location");

-- CreateIndex
CREATE INDEX "Influencer_platform_followersCount_idx" ON "Influencer"("platform", "followersCount");
