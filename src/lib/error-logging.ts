import * as Sentry from '@sentry/nextjs'
import { Prisma } from '@prisma/client'

export interface ErrorLogContext {
  userId?: string
  route?: string
  additionalData?: Record<string, any>
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public context?: ErrorLogContext
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const logError = (error: unknown, context?: ErrorLogContext) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error
  }

  // Console logging for development
  console.error('Error occurred:', errorDetails)

  // Sentry logging for production
  Sentry.captureException(error, {
    extra: errorDetails
  })

  return errorDetails
}

export const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError, context?: ErrorLogContext) => {
  const errorDetails = {
    code: error.code,
    message: error.message,
    meta: error.meta,
    target: error.meta?.target,
    ...context
  }

  logError(error, errorDetails)

  switch (error.code) {
    case 'P2002':
      return {
        statusCode: 409,
        message: 'A unique constraint violation occurred'
      }
    case 'P2025':
      return {
        statusCode: 404,
        message: 'Record not found'
      }
    default:
      return {
        statusCode: 500,
        message: 'Database operation failed'
      }
  }
}

export const createErrorResponse = (error: unknown, context?: ErrorLogContext) => {
  if (error instanceof APIError) {
    logError(error, context)
    return Response.json({
      error: error.message,
      statusCode: error.statusCode
    }, { status: error.statusCode })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { statusCode, message } = handlePrismaError(error, context)
    return Response.json({ error: message }, { status: statusCode })
  }

  const errorDetails = logError(error, context)
  return Response.json({
    error: 'Internal server error',
    requestId: errorDetails.timestamp
  }, { status: 500 })
} 