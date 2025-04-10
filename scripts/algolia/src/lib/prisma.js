"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@prisma/client");
// --- Add runtime logging for DATABASE_URL ---
console.log("[src/lib/prisma.ts] Runtime DATABASE_URL:", process.env.DATABASE_URL);
// -------------------------------------------
var globalForPrisma = globalThis;
// Create a new PrismaClient instance
var createPrismaClient = function () {
    return new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
    });
};
// Use the global instance in development to prevent multiple instances during hot reloading
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : createPrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
// Note: Removed $connect() call here to avoid eager connection on import.
// Connections are managed automatically by PrismaClient when queries are executed.
