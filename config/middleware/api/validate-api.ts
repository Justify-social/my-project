/**
 * API Validation Middleware for App Router
 *
 * This module provides middleware functions for validating API requests
 * in the App Router API routes, using Zod schemas for validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestImpl, withValidationImpl } from './implementation/validate-api-impl';

export type ValidationOptions = {
  logValidationErrors?: boolean;
  logRequestBody?: boolean;
  entityName?: string;
};

/**
 * Validate the request body against a Zod schema
 *
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @param options Configuration options
 * @returns A tuple of [isValid, validatedData, response] - if isValid is false, response contains the error
 */
export async function validateRequest<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
  options: ValidationOptions = {}
): Promise<[boolean, z.infer<T> | null, NextResponse | null]> {
  return validateRequestImpl(request, schema, options);
}

/**
 * Higher-order function to create a handler with request validation
 *
 * @param schema The Zod schema to validate against
 * @param handler The handler function to call with validated data
 * @param options Configuration options
 * @returns A function that validates the request and calls the handler
 */
export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (data: z.infer<T>, request: NextRequest) => Promise<NextResponse>,
  options: ValidationOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return withValidationImpl(schema, handler, options);
}
