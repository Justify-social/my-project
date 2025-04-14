/**
 * API Middleware Exports
 *
 * This file exports middleware functions for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';

// Type for handler options
export type HandlerOptions = {
  entityName?: string;
  operation?: string;
  logValidationErrors?: boolean;
  logRequestBody?: boolean;
};

// Improved withValidation with better TypeScript support
export const withValidation = <T>(
  schema: any,
  handler: (data: T, req: NextRequest, params?: any) => Promise<NextResponse>,
  options?: HandlerOptions
) => {
  return async (req: NextRequest, params?: any) => {
    const data = await req.json();

    try {
      // Validate the request data against the schema
      await schema.validate(data);
      // If validation passes, call the handler
      return handler(data as T, req, params);
    } catch (error: any) {
      // If validation fails, return a 400 response
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  };
};

// Improved tryCatch with better TypeScript support
export const tryCatch = (
  handler: (req: NextRequest, params?: any) => Promise<NextResponse>,
  options?: HandlerOptions
) => {
  return async (req: NextRequest, params?: any) => {
    try {
      return await handler(req, params);
    } catch (error: any) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: error.message || 'An unexpected error occurred' },
        { status: error.status || 500 }
      );
    }
  };
};
