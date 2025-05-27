import { PrismaClient } from '@prisma/client';
import { ExtendedPrismaClient } from '@/types/prisma-extensions';

// Determine the correct database URL
const effectiveDbUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
const dbUrlSource = process.env.DATABASE_URL_SOURCE || 'DATABASE_URL';

// Log only once during initialization if needed for debugging deployed env
if (
  typeof globalThis !== 'undefined' &&
  !(globalThis as { _prismaDbUrlLogged?: boolean })._prismaDbUrlLogged
) {
  console.log(`[src/lib/prisma.ts] Effective Database URL Source: ${dbUrlSource}`);
  console.log(
    '[src/lib/prisma.ts] Runtime Effective DATABASE_URL:',
    effectiveDbUrl
      ? effectiveDbUrl.substring(0, effectiveDbUrl.indexOf('@') + 1) + '...'
      : 'NOT SET'
  );
  (globalThis as { _prismaDbUrlLogged?: boolean })._prismaDbUrlLogged = true;
}

// Don't throw error during build time - defer validation to runtime
function validateDatabaseUrl() {
  if (!effectiveDbUrl) {
    throw new Error('Database URL is missing. Set DATABASE_URL or POSTGRES_DATABASE_URL.');
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

// Create a new PrismaClient instance
const createPrismaClient = () => {
  // Only validate database URL when actually creating the client (at runtime)
  validateDatabaseUrl();

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

// Create a lazy-loaded Prisma client that only initializes when first accessed
let _prisma: ExtendedPrismaClient | undefined;

export const prisma = new Proxy({} as ExtendedPrismaClient, {
  get(target, prop) {
    // Initialize the client only when first accessed, not at import time
    if (!_prisma) {
      _prisma = globalForPrisma.prisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = _prisma;
      }
    }
    return _prisma[prop as keyof ExtendedPrismaClient];
  },
});

// Note: Removed $connect() call here to avoid eager connection on import.
// Connections are managed automatically by PrismaClient when queries are executed.
