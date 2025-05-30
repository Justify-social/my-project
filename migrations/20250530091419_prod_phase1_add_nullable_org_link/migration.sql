/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `BrandingSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BrandingSettings" DROP CONSTRAINT "BrandingSettings_userId_fkey";

-- AlterTable
ALTER TABLE "BrandingSettings" ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "primaryColor" SET DEFAULT '#333333',
ALTER COLUMN "secondaryColor" SET DEFAULT '#4A5568',
ALTER COLUMN "headerFont" SET DEFAULT 'Inter',
ALTER COLUMN "bodyFont" SET DEFAULT 'Inter',
ALTER COLUMN "accentColor" SET DEFAULT '#00BFFF',
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerkOrganizationId" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_clerkOrgId_key" ON "Organization"("clerkOrgId");

-- CreateIndex
CREATE INDEX "Organization_clerkOrgId_idx" ON "Organization"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandingSettings_organizationId_key" ON "BrandingSettings"("organizationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clerkOrganizationId_fkey" FOREIGN KEY ("clerkOrganizationId") REFERENCES "Organization"("clerkOrgId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandingSettings" ADD CONSTRAINT "BrandingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandingSettings" ADD CONSTRAINT "BrandingSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
