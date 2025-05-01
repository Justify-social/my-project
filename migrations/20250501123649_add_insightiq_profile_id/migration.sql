/*
  Warnings:

  - A unique constraint covering the columns `[insightiqProfileId]` on the table `MarketplaceInfluencer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MarketplaceInfluencer" ADD COLUMN     "insightiqProfileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceInfluencer_insightiqProfileId_key" ON "MarketplaceInfluencer"("insightiqProfileId");
