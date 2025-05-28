-- AlterTable
ALTER TABLE "Influencer" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "engagementRate" DOUBLE PRECISION,
ADD COLUMN     "followersCount" INTEGER,
ADD COLUMN     "isVerified" BOOLEAN,
ADD COLUMN     "name" TEXT;
