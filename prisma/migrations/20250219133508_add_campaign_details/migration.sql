/*
  Warnings:

  - You are about to drop the column `assets` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `audience` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `kpis` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `messaging` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `objectives` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "assets",
DROP COLUMN "audience",
DROP COLUMN "budget",
DROP COLUMN "kpis",
DROP COLUMN "messaging",
DROP COLUMN "objectives",
DROP COLUMN "status",
ADD COLUMN     "businessGoal" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "influencerHandle" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "primaryContact" JSONB,
ADD COLUMN     "secondaryContact" JSONB,
ADD COLUMN     "socialMediaBudget" DOUBLE PRECISION,
ADD COLUMN     "timeZone" TEXT,
ADD COLUMN     "totalBudget" DOUBLE PRECISION;
