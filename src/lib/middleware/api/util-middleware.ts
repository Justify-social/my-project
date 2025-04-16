import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';

/**
 * A middleware factory that validates requests against a Zod schema
 *
 * @param schema The Zod schema to validate against
 * @param handler The handler function to call if validation passes
 * @returns A function that validates the request and calls the handler
 */
export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (request: NextRequest, validatedData: z.infer<T>) => Promise<Response>
) {
  return async (request: NextRequest) => {
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

      // Validate the request body
      const validationResult = schema.safeParse(body);

      if (!validationResult.success) {
        dbLogger.warn(DbOperation.VALIDATION, 'Validation failed', {
          errors: validationResult.error.format(),
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error.format(),
          },
          { status: 400 }
        );
      }

      // Call the handler with the validated data
      return handler(request, validationResult.data);
    } catch (error) {
      dbLogger.error(
        DbOperation.VALIDATION,
        'Error during validation',
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
 * A utility function that wraps an async operation in a try-catch block
 * and returns standardized responses
 *
 * @param operation The async operation to perform
 * @param errorHandler Optional custom error handler
 * @returns The result of the operation or an error response
 */
export async function tryCatch<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: unknown) => Response
): Promise<T | Response> {
  try {
    return await operation();
  } catch (error) {
    if (errorHandler) {
      return errorHandler(error);
    }

    dbLogger.error(
      DbOperation.VALIDATION,
      'Operation failed',
      {},
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Operation failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
