import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';

/**
 * Middleware factory for validating request bodies against a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param options Configuration options for the validation
 * @returns A middleware function that validates the request body
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  options: {
    logValidationErrors?: boolean;
    logRequestBody?: boolean;
    entityName?: string;
  } = {}
) {
  const {
    logValidationErrors = true,
    logRequestBody = false,
    entityName = 'Entity'
  } = options;

  return async (request: NextRequest, next: () => Promise<Response>) => {
    try {
      if (!request.body) {
        return NextResponse.json(
          {
            success: false,
            error: 'Request body is required',
          },
          { status: 400 }
        );
      }

      // Clone the request to read the body
      const clone = request.clone();
      const body = await clone.json();

      // Optional logging of the request body
      if (logRequestBody) {
        dbLogger.info(
          DbOperation.VALIDATION,
          `Validating ${entityName} request`,
          { requestBody: body }
        );
      }

      // Validate the request body
      const validationResult = schema.safeParse(body);

      if (!validationResult.success) {
        // Log validation errors if enabled
        if (logValidationErrors) {
          dbLogger.warn(
            DbOperation.VALIDATION,
            `${entityName} validation failed`,
            { errors: validationResult.error.format() }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error.format(),
          },
          { status: 400 }
        );
      }

      // Store the validated data in a request header since we can't modify the context directly
      const headers = new Headers(request.headers);
      headers.set('X-Validated-Data', JSON.stringify(validationResult.data));

      // Create a new request with the validated data
      const requestWithValidatedData = new Request(request.url, {
        method: request.method,
        headers: headers,
        body: JSON.stringify(validationResult.data),
      });

      // Pass the validated request to the next middleware or handler
      return next();
    } catch (error) {
      dbLogger.error(
        DbOperation.VALIDATION,
        `Error validating ${entityName} request`,
        {},
        error instanceof Error ? error : new Error(String(error))
      );

      return NextResponse.json(
        {
          success: false,
          error: 'An error occurred during request validation',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to access validated data from the request
 * 
 * @param request The request object
 * @returns The validated data or null if not available
 */
export function getValidatedData<T>(request: NextRequest): T | null {
  try {
    const validatedDataHeader = request.headers.get('X-Validated-Data');
    if (!validatedDataHeader) {
      return null;
    }
    return JSON.parse(validatedDataHeader) as T;
  } catch (error) {
    console.error('Error getting validated data:', error);
    return null;
  }
} 