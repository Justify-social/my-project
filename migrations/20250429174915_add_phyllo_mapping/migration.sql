/*
  Warnings:

  - A unique constraint covering the columns `[phylloUserId]` on the table `MarketplaceInfluencer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MarketplaceInfluencer" ADD COLUMN     "phylloUserId" TEXT;

-- CreateTable
CREATE TABLE "PhylloAccountLink" (
    "id" TEXT NOT NULL,
    "marketplaceInfluencerId" TEXT NOT NULL,
    "phylloAccountId" TEXT NOT NULL,
    "phylloUserId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhylloAccountLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhylloAccountLink_phylloAccountId_key" ON "PhylloAccountLink"("phylloAccountId");

-- CreateIndex
CREATE INDEX "PhylloAccountLink_marketplaceInfluencerId_idx" ON "PhylloAccountLink"("marketplaceInfluencerId");

-- CreateIndex
CREATE INDEX "PhylloAccountLink_phylloUserId_idx" ON "PhylloAccountLink"("phylloUserId");

-- CreateIndex
CREATE INDEX "PhylloAccountLink_status_idx" ON "PhylloAccountLink"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceInfluencer_phylloUserId_key" ON "MarketplaceInfluencer"("phylloUserId");

-- CreateIndex
CREATE INDEX "MarketplaceInfluencer_phylloUserId_idx" ON "MarketplaceInfluencer"("phylloUserId");

-- AddForeignKey
ALTER TABLE "PhylloAccountLink" ADD CONSTRAINT "PhylloAccountLink_marketplaceInfluencerId_fkey" FOREIGN KEY ("marketplaceInfluencerId") REFERENCES "MarketplaceInfluencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
