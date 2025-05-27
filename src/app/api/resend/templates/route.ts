import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors';
import { TEMPLATE_METADATA } from '@/components/email-templates/email-templates';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    // Check if user has admin permissions
    if (
      sessionClaims?.['metadata.role'] !== 'super_admin' &&
      sessionClaims?.['metadata.role'] !== 'admin'
    ) {
      throw new ForbiddenError('Admin access required for email templates.');
    }

    // SSOT: Get templates from single source
    const templates = Object.entries(TEMPLATE_METADATA).map(([id, metadata]) => ({
      id,
      name: metadata.name,
      description: metadata.description,
      type: metadata.type,
      subject: metadata.defaultSubject,
      preview: `Email preview for ${metadata.name} - powered by React Email components for perfect compatibility across all email clients.`,
    }));

    logger.info('Email templates fetched', {
      userId: clerkUserId,
      templateCount: templates.length,
    });

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
