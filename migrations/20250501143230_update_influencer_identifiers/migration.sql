/*
  Warnings:

  - You are about to drop the column `insightiqProfileId` on the `MarketplaceInfluencer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[searchIdentifier]` on the table `MarketplaceInfluencer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MarketplaceInfluencer_insightiqProfileId_key";

-- AlterTable
ALTER TABLE "MarketplaceInfluencer" DROP COLUMN "insightiqProfileId",
ADD COLUMN     "platformSpecificId" TEXT,
ADD COLUMN     "searchIdentifier" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceInfluencer_searchIdentifier_key" ON "MarketplaceInfluencer"("searchIdentifier");
