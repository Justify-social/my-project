/**
 * API Middleware Exports
 * 
 * This file exports all middleware functions for the App Router API routes.
 */

export * from './validateApi';
export * from './handleApiErrors';

// Usage examples:
/**
 * Example 1: Using validation middleware with a schema
 * 
 * ```typescript
 * import { NextRequest, NextResponse } from 'next/server';
 * import { z } from 'zod';
 * import { validateRequest } from '@/middleware/api';
 * 
 * const userSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * });
 * 
 * export async function POST(request: NextRequest) {
 *   const [isValid, data, errorResponse] = await validateRequest(
 *     request, 
 *     userSchema,
 *     { entityName: 'User' }
 *   );
 *   
 *   if (!isValid || !data) {
 *     return errorResponse;
 *   }
 *   
 *   // Process the validated data...
 *   return NextResponse.json({ success: true, data });
 * }
 * ```
 * 
 * Example 2: Using withValidation higher-order function
 * 
 * ```typescript
 * import { NextRequest, NextResponse } from 'next/server';
 * import { z } from 'zod';
 * import { withValidation } from '@/middleware/api';
 * 
 * const userSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * });
 * 
 * // Validate the request and then handle it
 * export const POST = withValidation(
 *   userSchema,
 *   async (data, request) => {
 *     // Process the validated data...
 *     return NextResponse.json({ success: true, data });
 *   },
 *   { entityName: 'User' }
 * );
 * ```
 * 
 * Example 3: Using tryCatch for error handling
 * 
 * ```typescript
 * import { NextResponse } from 'next/server';
 * import { tryCatch } from '@/middleware/api';
 * import { DbOperation } from '@/lib/data-mapping/db-logger';
 * import { prisma } from '@/lib/prisma';
 * 
 * export async function GET(request: NextRequest) {
 *   return tryCatch(
 *     async () => {
 *       const users = await prisma.user.findMany();
 *       return NextResponse.json({ success: true, data: users });
 *     },
 *     { entityName: 'User', operation: DbOperation.FIND_MANY }
 *   );
 * }
 * ```
 */ 