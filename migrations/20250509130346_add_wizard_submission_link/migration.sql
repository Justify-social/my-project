/*
  Warnings:

  - A unique constraint covering the columns `[submissionId]` on the table `CampaignWizard` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'SUBMITTED_FINAL';

-- AlterTable
ALTER TABLE "CampaignWizard" ADD COLUMN     "submissionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWizard_submissionId_key" ON "CampaignWizard"("submissionId");

-- AddForeignKey
ALTER TABLE "CampaignWizard" ADD CONSTRAINT "CampaignWizard_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
