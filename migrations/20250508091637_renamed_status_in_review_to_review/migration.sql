/*
  Warnings:

  - The values [IN_REVIEW] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `campaignId` on the `Audience` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `BrandLiftStudy` table. All the data in the column will be lost.
  - Added the required column `submissionId` to the `Audience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionId` to the `BrandLiftStudy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED', 'PAUSED');
ALTER TABLE "CampaignWizard" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CampaignWizard" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "CampaignWizard" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Audience" DROP CONSTRAINT "Audience_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "BrandLiftStudy" DROP CONSTRAINT "BrandLiftStudy_campaignId_fkey";

-- DropIndex
DROP INDEX "BrandLiftStudy_campaignId_idx";

-- AlterTable
ALTER TABLE "Audience" DROP COLUMN "campaignId",
ADD COLUMN     "submissionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BrandLiftStudy" DROP COLUMN "campaignId",
ADD COLUMN     "submissionId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "BrandLiftStudy_submissionId_idx" ON "BrandLiftStudy"("submissionId");

-- AddForeignKey
ALTER TABLE "Audience" ADD CONSTRAINT "Audience_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandLiftStudy" ADD CONSTRAINT "BrandLiftStudy_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
