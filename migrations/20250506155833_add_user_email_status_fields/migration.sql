-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailMarketingConsent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailStatusLastUpdated" TIMESTAMP(3),
ADD COLUMN     "isEmailDeliverable" BOOLEAN NOT NULL DEFAULT true;
