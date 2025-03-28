import { PrismaClient } from '@prisma/client';

/**
 * This file adds type extensions to the PrismaClient to support model access by name.
 * This is helpful for TypeScript to recognize our models when accessed as properties.
 */

// Define common parameter and return types for Prisma operations
type PrismaParams = Record<string, unknown>;
type PrismaReturn<T = unknown> = Promise<T>;

// Generic type for Prisma delegates to avoid type errors
type PrismaDelegate = {
  findUnique: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T | null>;
  findFirst: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T | null>;
  findMany: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T[]>;
  create: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T>;
  createMany: <_T = unknown>(args: PrismaParams) => PrismaReturn<{ count: number }>;
  update: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T>;
  updateMany: <_T = unknown>(args: PrismaParams) => PrismaReturn<{ count: number }>;
  upsert: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T>;
  delete: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T>;
  deleteMany: <_T = unknown>(args: PrismaParams) => PrismaReturn<{ count: number }>;
  count: (args?: PrismaParams) => PrismaReturn<number>;
  aggregate: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T>;
  groupBy: <_T = unknown>(args: PrismaParams) => PrismaReturn<_T[]>;
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