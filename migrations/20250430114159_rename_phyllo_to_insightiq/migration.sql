/*
  Warnings:

  - You are about to drop the column `isPhylloVerified` on the `MarketplaceInfluencer` table. All the data in the column will be lost.
  - You are about to drop the column `phylloDataLastRefreshedAt` on the `MarketplaceInfluencer` table. All the data in the column will be lost.
  - You are about to drop the column `phylloUserId` on the `MarketplaceInfluencer` table. All the data in the column will be lost.
  - You are about to drop the `PhylloAccountLink` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[insightiqUserId]` on the table `MarketplaceInfluencer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PhylloAccountLink" DROP CONSTRAINT "PhylloAccountLink_marketplaceInfluencerId_fkey";

-- DropIndex
DROP INDEX "MarketplaceInfluencer_isPhylloVerified_idx";

-- DropIndex
DROP INDEX "MarketplaceInfluencer_phylloUserId_idx";

-- DropIndex
DROP INDEX "MarketplaceInfluencer_phylloUserId_key";

-- AlterTable
ALTER TABLE "MarketplaceInfluencer" DROP COLUMN "isPhylloVerified",
DROP COLUMN "phylloDataLastRefreshedAt",
DROP COLUMN "phylloUserId",
ADD COLUMN     "insightiqDataLastRefreshedAt" TIMESTAMP(3),
ADD COLUMN     "insightiqUserId" TEXT,
ADD COLUMN     "isInsightIQVerified" BOOLEAN;

-- DropTable
DROP TABLE "PhylloAccountLink";

-- CreateTable
CREATE TABLE "InsightIQAccountLink" (
    "id" TEXT NOT NULL,
    "marketplaceInfluencerId" TEXT NOT NULL,
    "insightiqAccountId" TEXT NOT NULL,
    "insightiqUserId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsightIQAccountLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsightIQAccountLink_insightiqAccountId_key" ON "InsightIQAccountLink"("insightiqAccountId");

-- CreateIndex
CREATE INDEX "InsightIQAccountLink_marketplaceInfluencerId_idx" ON "InsightIQAccountLink"("marketplaceInfluencerId");

-- CreateIndex
CREATE INDEX "InsightIQAccountLink_insightiqUserId_idx" ON "InsightIQAccountLink"("insightiqUserId");

-- CreateIndex
CREATE INDEX "InsightIQAccountLink_status_idx" ON "InsightIQAccountLink"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceInfluencer_insightiqUserId_key" ON "MarketplaceInfluencer"("insightiqUserId");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_isInsightIQVerified_idx" ON "MarketplaceInfluencer"("isInsightIQVerified");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_insightiqUserId_idx" ON "MarketplaceInfluencer"("insightiqUserId");

-- AddForeignKey
ALTER TABLE "InsightIQAccountLink" ADD CONSTRAINT "InsightIQAccountLink_marketplaceInfluencerId_fkey" FOREIGN KEY ("marketplaceInfluencerId") REFERENCES "MarketplaceInfluencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
