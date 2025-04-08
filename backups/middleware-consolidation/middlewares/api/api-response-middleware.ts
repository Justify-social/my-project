import { NextResponse } from 'next/server';

/**
 * Custom middleware to replace the default NextResponse.json serialization
 * This ensures proper handling of Date objects at the HTTP level
 */
export function createApiResponse(data: any, options?: ResponseInit) {
  const serialized = JSON.stringify(data, (key, value) => {
    // Properly serialize Date objects at the HTTP response level
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Handle special case of empty objects (may be corrupted dates)
    if (value && typeof value === 'object' && Object.keys(value).length === 0) {
      // Check if key is a known date field
      if (['startDate', 'endDate', 'createdAt', 'updatedAt'].includes(key)) {
        return null;
      }
    }
    return value;
  });

  return new NextResponse(serialized, {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  });
} 