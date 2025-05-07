/*
  Warnings:

  - Added the required column `organizationId` to the `BrandLiftStudy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BrandLiftReport" ALTER COLUMN "recommendations" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "BrandLiftStudy" ADD COLUMN     "organizationId" TEXT NOT NULL,
ALTER COLUMN "secondaryKpis" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "SurveyApprovalComment" ADD COLUMN     "resolutionNote" TEXT;

-- CreateIndex
CREATE INDEX "BrandLiftStudy_organizationId_idx" ON "BrandLiftStudy"("organizationId");
