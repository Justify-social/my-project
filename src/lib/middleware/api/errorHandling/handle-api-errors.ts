/**
 * API Error Handling Middleware for App Router
 *
 * This module provides middleware functions for handling database errors
 * in the App Router API routes, providing consistent error responses.
 */

import { NextResponse } from 'next/server';
import { handleDbError } from './handle-db-errors'; // Assuming this is in the same dir now or re-exported
import { DbOperation } from '@/lib/data-mapping/db-logger';
import { tryCatchImpl } from '../implementation/handle-api-errors-impl';

export type ErrorHandlingOptions = {
  entityName?: string;
  operation?: DbOperation;
  logError?: boolean;
};

/**
 * Handle database errors and return a standardized response
 *
 * @param error The error to handle
 * @param entityName The name of the entity being operated on
 * @param operation The database operation being performed
 * @returns A standardized NextResponse with error details
 */
export function handleDbErrorImpl(
  error: unknown,
  entityName: string = 'Entity',
  operation: DbOperation = DbOperation.VALIDATION
): NextResponse {
  return handleDbError(error, entityName, operation);
}

/**
 * Higher-order function to wrap API route handlers with try-catch blocks.
 * Automatically handles Zod validation errors, Prisma errors, and general errors.
 *
 * @param handler The API route handler function.
 * @param entityName Optional: The name of the entity being operated on (for logging).
 * @param operation Optional: The database operation being performed (for logging).
 * @returns A new function that wraps the handler with error handling.
 */
export function tryCatch<TResponse, TArgs extends unknown[]>(
  handler: (
    ...args: TArgs
  ) => Promise<NextResponse<TResponse | { success: boolean; error: string; details?: unknown }>>,
  options?: { entityName?: string; operation?: DbOperation }
) {
  return async (...args: TArgs) => {
    return tryCatchImpl(() => handler(...args), options);
  };
}
