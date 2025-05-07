import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import logger from './logger'; // Assuming logger.ts is in the same lib directory
import { UnauthenticatedError, ForbiddenError, NotFoundError, BadRequestError } from './errors'; // Assuming errors.ts is in the same lib directory

export const handleApiError = (error: any, request?: NextRequest): NextResponse => {
  let statusCode = 500;
  let errorMessage = 'An unexpected internal server error occurred. Please try again later.';

  const requestInfo = request ? { method: request.method, url: request.url } : {};

  if (error instanceof UnauthenticatedError) {
    statusCode = 401;
    errorMessage = error.message;
    logger.warn(`API Authentication Error: ${error.message}`, { ...requestInfo, statusCode });
  } else if (error instanceof ForbiddenError) {
    statusCode = 403;
    errorMessage = error.message;
    logger.warn(`API Authorization Error: ${error.message}`, { ...requestInfo, statusCode });
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    errorMessage = error.message;
    logger.info(`API Resource Not Found Error: ${error.message}`, { ...requestInfo, statusCode });
  } else if (error instanceof BadRequestError) {
    statusCode = 400;
    errorMessage = error.message;
    logger.warn(`API Bad Request Error: ${error.message}`, { ...requestInfo, statusCode });
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    errorMessage = error.errors.map(e => `${e.path.join('.') || 'input'}: ${e.message}`).join('; ');
    logger.warn('API Validation Error (Zod)', {
      errors: error.format(),
      ...requestInfo,
      statusCode,
    });
  } else if (error && typeof error === 'object' && error.name === 'PrismaClientKnownRequestError') {
    logger.error(error, { ...requestInfo, prismaCode: error.code });
    if (error.code === 'P2002') {
      statusCode = 409; // Conflict
      errorMessage = `A record with this information already exists. Please check your input. (Fields: ${error.meta?.target?.join(', ')})`;
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = (error.meta?.cause as string) || 'The requested resource was not found.';
    } else if (error.code === 'P2003') {
      statusCode = 400; // Bad request due to foreign key constraint
      errorMessage = `Invalid reference: The operation failed due to a missing related record. (Field: ${error.meta?.field_name})`;
    } else {
      // Generic Prisma error, don't leak too much detail
      errorMessage = 'A database error occurred. Please try again.';
    }
  } else if (error instanceof Error) {
    // Generic Error object
    logger.error(error, { ...requestInfo, statusCode });
    errorMessage = 'An unexpected error occurred. Our team has been notified.';
  } else {
    // Fallback for non-Error objects thrown
    logger.error('API Unknown Error: Non-Error thrown', {
      errorDetails: error,
      ...requestInfo,
      statusCode,
    });
    errorMessage = 'An unexpected error occurred.';
  }

  return NextResponse.json(
    { error: errorMessage, details: error instanceof z.ZodError ? error.format() : undefined },
    { status: statusCode }
  );
};
