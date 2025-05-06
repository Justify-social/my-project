/*
  Warnings:

  - You are about to drop the column `platformId` on the `Influencer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[campaignId,handle,platform]` on the table `Influencer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Influencer" DROP COLUMN "platformId";

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_campaignId_handle_platform_key" ON "Influencer"("campaignId", "handle", "platform");
