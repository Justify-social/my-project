import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';

/**
 * Standardized error handling for database operations
 * This middleware can wrap database operations to provide consistent error handling
 *
 * @param error The error that occurred during the database operation
 * @param entityName The name of the entity being operated on (e.g., 'Campaign', 'User')
 * @param operation The type of operation that was being performed
 * @returns A standardized NextResponse with appropriate status code and error details
 */
export function handleDbError(
  error: unknown,
  entityName: string = 'Entity',
  operation: DbOperation = DbOperation.VALIDATION
): NextResponse {
  // Log the error
  dbLogger.error(
    operation,
    `Database error during ${operation} operation on ${entityName}`,
    {},
    error instanceof Error ? error : new Error(String(error))
  );

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[]) || ['unknown field'];
      return NextResponse.json(
        {
          success: false,
          error: `A ${entityName.toLowerCase()} with this ${field.join(', ')} already exists`,
          code: error.code,
          fields: field,
        },
        { status: 409 }
      );
    }

    // Foreign key constraint failure
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error: 'Foreign key constraint failed',
          details: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    // Record not found
    if (error.code === 'P2001' || error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: `${entityName} not found`,
          details: error.message,
          code: error.code,
        },
        { status: 404 }
      );
    }

    // Required field constraint failure
    if (error.code === 'P2011' || error.code === 'P2012') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }
  }

  // Handle validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error in database operation',
        details: error.message,
      },
      { status: 400 }
    );
  }

  // Handle initialization errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection error',
        details: 'Unable to connect to the database. Please try again later.',
      },
      { status: 503 }
    );
  }

  // Generic error response for any other types of errors
  return NextResponse.json(
    {
      success: false,
      error: `Failed to ${operation.toLowerCase()} ${entityName.toLowerCase()}`,
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
}

/**
 * Higher-order function to create a database operation with error handling
 *
 * @param operation The database operation to perform
 * @param entityName The name of the entity being operated on
 * @returns A function that performs the operation and handles errors
 */
export function withDbErrorHandling<T>(
  operation: () => Promise<T>,
  entityName: string = 'Entity',
  operationType: DbOperation = DbOperation.VALIDATION
): Promise<NextResponse | T> {
  return operation()
    .then(result => result)
    .catch(error => handleDbError(error, entityName, operationType));
}
