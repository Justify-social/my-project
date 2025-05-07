-- CreateEnum
CREATE TYPE "BrandLiftStudyStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'COLLECTING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SurveyQuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "SurveyApprovalCommentStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "SurveyOverallApprovalStatus" AS ENUM ('PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'SIGNED_OFF');

-- CreateTable
CREATE TABLE "BrandLiftStudy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "status" "BrandLiftStudyStatus" NOT NULL DEFAULT 'DRAFT',
    "funnelStage" TEXT NOT NULL,
    "primaryKpi" TEXT NOT NULL,
    "secondaryKpis" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cintProjectId" TEXT,
    "cintTargetGroupId" TEXT,

    CONSTRAINT "BrandLiftStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "questionType" "SurveyQuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "isRandomized" BOOLEAN DEFAULT false,
    "isMandatory" BOOLEAN DEFAULT true,
    "kpiAssociation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "respondentId" TEXT NOT NULL,
    "cintResponseId" TEXT,
    "isControlGroup" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "demographics" JSONB,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandLiftReport" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metrics" JSONB,
    "recommendations" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandLiftReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyApprovalStatus" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "status" "SurveyOverallApprovalStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "requestedSignOff" BOOLEAN NOT NULL DEFAULT false,
    "signedOffBy" TEXT,
    "signedOffAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyApprovalStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyApprovalComment" (
    "id" TEXT NOT NULL,
    "approvalStatusId" TEXT NOT NULL,
    "questionId" TEXT,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "SurveyApprovalCommentStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyApprovalComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandLiftStudy_cintProjectId_key" ON "BrandLiftStudy"("cintProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandLiftStudy_cintTargetGroupId_key" ON "BrandLiftStudy"("cintTargetGroupId");

-- CreateIndex
CREATE INDEX "BrandLiftStudy_campaignId_idx" ON "BrandLiftStudy"("campaignId");

-- CreateIndex
CREATE INDEX "BrandLiftStudy_status_idx" ON "BrandLiftStudy"("status");

-- CreateIndex
CREATE INDEX "SurveyQuestion_studyId_idx" ON "SurveyQuestion"("studyId");

-- CreateIndex
CREATE INDEX "SurveyOption_questionId_idx" ON "SurveyOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_cintResponseId_key" ON "SurveyResponse"("cintResponseId");

-- CreateIndex
CREATE INDEX "SurveyResponse_studyId_idx" ON "SurveyResponse"("studyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_respondentId_idx" ON "SurveyResponse"("respondentId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandLiftReport_studyId_key" ON "BrandLiftReport"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyApprovalStatus_studyId_key" ON "SurveyApprovalStatus"("studyId");

-- CreateIndex
CREATE INDEX "SurveyApprovalComment_approvalStatusId_idx" ON "SurveyApprovalComment"("approvalStatusId");

-- CreateIndex
CREATE INDEX "SurveyApprovalComment_questionId_idx" ON "SurveyApprovalComment"("questionId");

-- CreateIndex
CREATE INDEX "SurveyApprovalComment_authorId_idx" ON "SurveyApprovalComment"("authorId");

-- AddForeignKey
ALTER TABLE "BrandLiftStudy" ADD CONSTRAINT "BrandLiftStudy_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CampaignWizardSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "BrandLiftStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyOption" ADD CONSTRAINT "SurveyOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "BrandLiftStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandLiftReport" ADD CONSTRAINT "BrandLiftReport_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "BrandLiftStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyApprovalStatus" ADD CONSTRAINT "SurveyApprovalStatus_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "BrandLiftStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyApprovalComment" ADD CONSTRAINT "SurveyApprovalComment_approvalStatusId_fkey" FOREIGN KEY ("approvalStatusId") REFERENCES "SurveyApprovalStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyApprovalComment" ADD CONSTRAINT "SurveyApprovalComment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
