/*
  Warnings:

  - You are about to drop the column `organizationId` on the `BrandLiftStudy` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BrandLiftStudy_organizationId_idx";

-- AlterTable
ALTER TABLE "BrandLiftStudy" DROP COLUMN "organizationId";
