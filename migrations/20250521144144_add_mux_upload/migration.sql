/*
  Warnings:

  - A unique constraint covering the columns `[muxUploadId]` on the table `CreativeAsset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CreativeAsset" ADD COLUMN     "muxUploadId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CreativeAsset_muxUploadId_key" ON "CreativeAsset"("muxUploadId");
