/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "User";
