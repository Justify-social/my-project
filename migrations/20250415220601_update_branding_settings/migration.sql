/*
  Warnings:

  - You are about to drop the column `bodyFontSize` on the `BrandingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `BrandingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `headerFontSize` on the `BrandingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `guidelines` on the `CampaignWizard` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `CampaignWizard` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `CampaignWizard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `BrandingSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accentColor` to the `BrandingSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `BrandingSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BrandingSettings_companyId_key";

-- AlterTable
ALTER TABLE "BrandingSettings" DROP COLUMN "bodyFontSize",
DROP COLUMN "companyId",
DROP COLUMN "headerFontSize",
ADD COLUMN     "accentColor" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CampaignWizard" DROP COLUMN "guidelines",
DROP COLUMN "notes",
DROP COLUMN "requirements";

-- CreateIndex
CREATE UNIQUE INDEX "BrandingSettings_userId_key" ON "BrandingSettings"("userId");

-- AddForeignKey
ALTER TABLE "BrandingSettings" ADD CONSTRAINT "BrandingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
