/*
  Warnings:

  - You are about to alter the column `influencerHandle` on the `CampaignWizard` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GBP', 'USD', 'EUR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Status" ADD VALUE 'PAUSED';
ALTER TYPE "Status" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "CampaignWizard" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "influencerHandle" SET DATA TYPE VARCHAR(255);
