import { NextResponse } from 'next/server';
import { tryCatch } from '@/middleware/api';
import { DbOperation } from '@/lib/data-mapping/db-logger';

export async function GET() {
  return tryCatch(
    async () => {
      return NextResponse.json({
        success: true,
        data: { reports: [] }
      });
    },
    { entityName: 'BrandLiftReport', operation: DbOperation.FETCH }
  );
} 