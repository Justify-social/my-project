import { PrismaClient } from '@prisma/client';
import { ExtendedPrismaClient } from '@/types/prisma-extensions';

// --- Add runtime logging for database URL ---
// Prioritize POSTGRES_DATABASE_URL from Vercel/Neon integration
const effectiveDbUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
console.log(
  '[src/lib/prisma.ts] Effective Database URL Source:',
  process.env.POSTGRES_DATABASE_URL ? 'POSTGRES_DATABASE_URL' : 'DATABASE_URL'
);
console.log(
  '[src/lib/prisma.ts] Runtime Effective DATABASE_URL:',
  effectiveDbUrl ? effectiveDbUrl.substring(0, effectiveDbUrl.indexOf('@') + 1) + '...' : undefined
);
// -------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

// Create a new PrismaClient instance
// Prisma automatically uses DATABASE_URL if no explicit URL is provided.
// By ensuring POSTGRES_DATABASE_URL is set in Vercel and removing the manual
// DATABASE_URL override, Prisma should effectively use the correct Vercel/Neon URL.
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
    // Optionally explicitly provide the URL, though Prisma detects DATABASE_URL:
    // datasourceUrl: effectiveDbUrl,
  }) as unknown as ExtendedPrismaClient;
};

// Use the global instance in development to prevent multiple instances during hot reloading
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Note: Removed $connect() call here to avoid eager connection on import.
// Connections are managed automatically by PrismaClient when queries are executed.
