'use strict';
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.prisma = void 0;
var client_1 = require('@prisma/client');
// --- Add runtime logging for database URL ---
// Prioritize POSTGRES_DATABASE_URL from Vercel/Neon integration
var effectiveDbUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
console.log(
  '[scripts/algolia/src/lib/prisma.js] Effective Database URL Source:',
  process.env.POSTGRES_DATABASE_URL ? 'POSTGRES_DATABASE_URL' : 'DATABASE_URL'
);
console.log(
  '[scripts/algolia/src/lib/prisma.js] Runtime Effective DATABASE_URL:',
  effectiveDbUrl ? effectiveDbUrl.substring(0, effectiveDbUrl.indexOf('@') + 1) + '...' : undefined
);
// -------------------------------------------
var globalForPrisma = globalThis;
// Create a new PrismaClient instance, explicitly providing the URL
var createPrismaClient = function () {
  // Use datasources field for newer Prisma versions
  return new client_1.PrismaClient({
    datasources: {
      db: {
        url: effectiveDbUrl, // Explicitly pass the determined URL
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
  });
};
// Use the global instance in development to prevent multiple instances during hot reloading
exports.prisma =
  (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = exports.prisma;
// Note: Removed $connect() call here to avoid eager connection on import.
// Connections are managed automatically by PrismaClient when queries are executed.
