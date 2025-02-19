-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "assets" JSONB,
ADD COLUMN     "audience" JSONB,
ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "kpis" TEXT,
ADD COLUMN     "messaging" TEXT,
ADD COLUMN     "objectives" TEXT,
ADD COLUMN     "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';
