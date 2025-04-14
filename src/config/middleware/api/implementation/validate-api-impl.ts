/**
 * API Validation Middleware Implementation for App Router
 *
 * This module provides the actual implementation of the validation middleware.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';

/**
 * Validate the request body against a Zod schema
 *
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @param options Configuration options
 * @returns A tuple of [isValid, validatedData, response] - if isValid is false, response contains the error
 */
export async function validateRequestImpl<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
  options: {
    logValidationErrors?: boolean;
    logRequestBody?: boolean;
    entityName?: string;
  } = {}
): Promise<[boolean, z.infer<T> | null, NextResponse | null]> {
  const { logValidationErrors = true, logRequestBody = false, entityName = 'Entity' } = options;

  try {
    // Try to parse the request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return [
        false,
        null,
        NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON in request body',
          },
          { status: 400 }
        ),
      ];
    }

    // Log the request body if enabled
    if (logRequestBody) {
      dbLogger.info(DbOperation.VALIDATION, `Validating ${entityName} request`, {
        requestBody: body,
      });
    }

    // Validate against the schema
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      // Log validation errors if enabled
      if (logValidationErrors) {
        dbLogger.warn(DbOperation.VALIDATION, `${entityName} validation failed`, {
          errors: validationResult.error.format(),
        });
      }

      // Return validation error
      return [
        false,
        null,
        NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error.format(),
          },
          { status: 400 }
        ),
      ];
    }

    // Return the validated data
    return [true, validationResult.data, null];
  } catch (error) {
    // Log and return any unexpected errors
    dbLogger.error(
      DbOperation.VALIDATION,
      `Error validating ${entityName} request`,
      {},
      error instanceof Error ? error : new Error(String(error))
    );

    return [
      false,
      null,
      NextResponse.json(
        {
          success: false,
          error: 'An error occurred during request validation',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      ),
    ];
  }
}

/**
 * Higher-order function to create a handler with request validation
 *
 * @param schema The Zod schema to validate against
 * @param handler The handler function to call with validated data
 * @param options Configuration options
 * @returns A function that validates the request and calls the handler
 */
export function withValidationImpl<T extends z.ZodType>(
  schema: T,
  handler: (data: z.infer<T>, request: NextRequest) => Promise<NextResponse>,
  options: {
    logValidationErrors?: boolean;
    logRequestBody?: boolean;
    entityName?: string;
  } = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const [isValid, data, errorResponse] = await validateRequestImpl(request, schema, options);

    if (!isValid || !data) {
      return errorResponse as NextResponse;
    }

    return handler(data, request);
  };
}
