import { PrismaClient } from '@prisma/client';
import { ExtendedPrismaClient } from '@/types/prisma-extensions';

// Determine the correct database URL
const effectiveDbUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
const dbUrlSource = process.env.POSTGRES_DATABASE_URL ? 'POSTGRES_DATABASE_URL' : 'DATABASE_URL';

// Log only once during initialization if needed for debugging deployed env
if (typeof globalThis !== 'undefined' && !(globalThis as any)._prismaDbUrlLogged) {
  console.log(`[src/lib/prisma.ts] Effective Database URL Source: ${dbUrlSource}`);
  console.log(
    '[src/lib/prisma.ts] Runtime Effective DATABASE_URL:',
    effectiveDbUrl
      ? effectiveDbUrl.substring(0, effectiveDbUrl.indexOf('@') + 1) + '...'
      : 'NOT SET'
  );
  (globalThis as any)._prismaDbUrlLogged = true;
}

if (!effectiveDbUrl) {
  // Throw a clearer error during initialization if no URL is found
  // This helps diagnose missing environment variables earlier.
  throw new Error('Database URL is missing. Set DATABASE_URL or POSTGRES_DATABASE_URL.');
}

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

// Create a new PrismaClient instance
// Prisma automatically uses DATABASE_URL if no explicit URL is provided.
// By ensuring POSTGRES_DATABASE_URL is set in Vercel and removing the manual
// DATABASE_URL override, Prisma should effectively use the correct Vercel/Neon URL.
const createPrismaClient = () => {
  console.log('[src/lib/prisma.ts] Creating new PrismaClient instance.');
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'], // Adjust prod logging
    // Explicitly pass the datasource URL
    datasourceUrl: effectiveDbUrl,
  }) as unknown as ExtendedPrismaClient;
};

// Use the global instance in development to prevent multiple instances during hot reloading
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Note: Removed $connect() call here to avoid eager connection on import.
// Connections are managed automatically by PrismaClient when queries are executed.
