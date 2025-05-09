-- AlterEnum
ALTER TYPE "BrandLiftStudyStatus" ADD VALUE 'CHANGES_REQUESTED';

-- AlterTable
ALTER TABLE "BrandLiftStudy" ALTER COLUMN "organizationId" DROP NOT NULL;
