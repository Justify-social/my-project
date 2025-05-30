/*
  Warnings:

  - You are about to drop the column `userId` on the `BrandingSettings` table. All the data in the column will be lost.
  - Made the column `organizationId` on table `BrandingSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BrandingSettings" DROP CONSTRAINT "BrandingSettings_userId_fkey";

-- DropIndex
DROP INDEX "BrandingSettings_userId_key";

-- AlterTable
ALTER TABLE "BrandingSettings" DROP COLUMN "userId",
ALTER COLUMN "organizationId" SET NOT NULL;
