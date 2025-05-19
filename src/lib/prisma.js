'use strict';
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.prisma = void 0;
var client_1 = require('@prisma/client');
// Determine the correct database URL
var effectiveDbUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
var dbUrlSource = process.env.DATABASE_URL_SOURCE || 'DATABASE_URL';
// Log only once during initialization if needed for debugging deployed env
if (typeof globalThis !== 'undefined' && !globalThis._prismaDbUrlLogged) {
  console.log('[src/lib/prisma.ts] Effective Database URL Source: '.concat(dbUrlSource));
  console.log(
    '[src/lib/prisma.ts] Runtime Effective DATABASE_URL:',
    effectiveDbUrl
      ? effectiveDbUrl.substring(0, effectiveDbUrl.indexOf('@') + 1) + '...'
      : 'NOT SET'
  );
  globalThis._prismaDbUrlLogged = true;
}
if (!effectiveDbUrl) {
  // Throw a clearer error during initialization if no URL is found
  // This helps diagnose missing environment variables earlier.
  throw new Error('Database URL is missing. Set DATABASE_URL or POSTGRES_DATABASE_URL.');
}
var globalForPrisma = globalThis;
// Create a new PrismaClient instance
// Prisma automatically uses DATABASE_URL if no explicit URL is provided.
// By ensuring POSTGRES_DATABASE_URL is set in Vercel and removing the manual
// DATABASE_URL override, Prisma should effectively use the correct Vercel/Neon URL.
var createPrismaClient = function () {
  console.log('[src/lib/prisma.ts] Creating new PrismaClient instance.');
  return new client_1.PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'], // Adjust prod logging
    // Explicitly pass the datasource URL
    datasourceUrl: effectiveDbUrl,
  });
};
// Use the global instance in development to prevent multiple instances during hot reloading
var prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : createPrismaClient();
exports.prisma = prisma;
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  if (process.env.NODE_ENV !== 'test') {
    // Avoid logging during tests
    // console.log('[src/lib/prisma.ts] Creating new PrismaClient instance.');
  }
}
