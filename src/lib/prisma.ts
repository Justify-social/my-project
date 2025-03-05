import { PrismaClient } from '@prisma/client';
import { ExtendedPrismaClient } from '@/types/prisma-extensions';

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

// Create a new PrismaClient instance
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
  }) as unknown as ExtendedPrismaClient;
};

// Use the global instance in development to prevent multiple instances during hot reloading
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Note: Removed $connect() call here to avoid eager connection on import.
// Connections are managed automatically by PrismaClient when queries are executed.