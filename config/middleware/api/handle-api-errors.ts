/**
 * API Error Handling Middleware for App Router
 *
 * This module provides middleware functions for handling database errors
 * in the App Router API routes, providing consistent error responses.
 */

import { NextResponse } from 'next/server';
import { DbOperation } from '@/lib/data-mapping/db-logger';
import { handleDbErrorImpl, tryCatchImpl } from './implementation/handle-api-errors-impl';

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
export function handleDbError(
  error: unknown,
  entityName: string = 'Entity',
  operation: DbOperation = DbOperation.VALIDATION
): NextResponse {
  return handleDbErrorImpl(error, entityName, operation);
}

/**
 * Combine validation and database error handling for a request handler
 *
 * @param fn The handler function to wrap
 * @param options Configuration options
 * @returns A function that handles validation and database errors
 */
export function tryCatch<T>(
  fn: () => Promise<T>,
  options: ErrorHandlingOptions = {}
): Promise<T | NextResponse> {
  return tryCatchImpl(fn, options);
}
