import { PrismaClient } from '@prisma/client';

/**
 * This file adds type extensions to the PrismaClient to support model access by name.
 * This is helpful for TypeScript to recognize our models when accessed as properties.
 */

// Generic type for Prisma delegates to avoid type errors
type PrismaDelegate = {
  findUnique: Function;
  findFirst: Function;
  findMany: Function;
  create: Function;
  createMany: Function;
  update: Function;
  updateMany: Function;
  upsert: Function;
  delete: Function;
  deleteMany: Function;
  count: Function;
  aggregate: Function;
  groupBy: Function;
}

/**
 * Extended PrismaClient type with explicit model definitions
 */
export type ExtendedPrismaClient = PrismaClient & {
  // Main models
  campaignWizard: PrismaDelegate;
  influencer: PrismaDelegate;
  wizardHistory: PrismaDelegate;
  
  // CampaignWizardSubmission related models
  campaignWizardSubmission: PrismaDelegate;
  primaryContact: PrismaDelegate;
  secondaryContact: PrismaDelegate;
  audience: PrismaDelegate;
  audienceLocation: PrismaDelegate;
  audienceGender: PrismaDelegate;
  audienceScreeningQuestion: PrismaDelegate;
  audienceLanguage: PrismaDelegate;
  audienceCompetitor: PrismaDelegate;
  creativeAsset: PrismaDelegate;
  creativeRequirement: PrismaDelegate;
  
  // User model
  user: PrismaDelegate;
};

/**
 * Helper function to cast the standard PrismaClient to our extended type
 */
export const extendPrismaClient = (prisma: PrismaClient): ExtendedPrismaClient => {
  return prisma as unknown as ExtendedPrismaClient;
}; 