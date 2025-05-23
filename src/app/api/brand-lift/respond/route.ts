import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client'; // For SurveyResponse answsers/demographics Json type

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, NotFoundError } from '@/lib/errors'; // No UnauthenticatedError needed for public webhook

// --- Security TODO ---
// This endpoint must be secured. Methods:
// 1. Shared Secret: Client (Cint) sends a secret in a header, we validate it.
// 2. HMAC Signature: Client signs payload, we verify signature with shared secret.
// 3. IP Whitelisting: Only allow requests from Cint IPs (less flexible).
// For MVP, we will log a warning if security is not implemented via ENV var.
const CINT_WEBHOOK_SECRET = process.env.CINT_WEBHOOK_SECRET;

// Zod schema for the expected Cint S2S Respondent Transition payload (Simplified)
// Refer to `cint-exchange-guide.md` section "Server-to-Server (S2S)" for actual structure.
// This is a conceptual MVP schema and will need refinement based on exact Cint payload.
const cintS2SResponseSchema = z.object({
  id: z.string(), // Respondent ID (RID from Cint)
  status: z.number().int(), // Cint S2S status code (e.g., 5 for Complete, 2 for Terminate)
  // surveyId: z.string().cuid().optional(), // How we map this to our studyId - Cint might send it, or we map RID
  // For now, assume RID can be used to look up the studyId if not directly provided
  // OR that Cint might pass back a custom variable we set in the live_url that contains our studyId.
  custom_vars: z.record(z.string(), z.any()).optional(), // For potential custom variables like our studyId
  answers: z
    .array(
      z.object({
        // Highly simplified answer structure - Cint's actual format might be different
        question_identifier: z.string(), // How Cint identifies the question
        answer_value: z.any(), // Could be string, number, array of strings/numbers
      })
    )
    .optional()
    .default([]),
  demographics: z.record(z.string(), z.any()).optional().default({}), // Simplified demographics
});

export const POST = async (req: NextRequest) => {
  try {
    // --- Security Check --- TODO: Implement robust security
    const receivedSecret = req.headers.get('x-cint-webhook-secret'); // Example header
    if (!CINT_WEBHOOK_SECRET) {
      logger.warn('CINT_WEBHOOK_SECRET not configured. Webhook is insecure!');
      // In production, might choose to reject request if secret not configured.
    } else if (receivedSecret !== CINT_WEBHOOK_SECRET) {
      logger.error('Invalid Cint webhook secret received.', { received: receivedSecret });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // --- End Security Check ---

    const body = await req.json();
    const validation = cintS2SResponseSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid Cint webhook payload', {
        errors: validation.error.flatten().fieldErrors,
        receivedBody: body,
      });
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      id: cintRespondentId,
      custom_vars,
      answers: rawAnswers,
      demographics: rawDemographics,
    } = validation.data;

    // TODO: Logic to map cintRespondentId or custom_vars.studyId to our internal BrandLiftStudy.id
    // This is a CRITICAL step. For MVP, assume custom_vars contains our studyId.
    const studyId = custom_vars?.studyId as string | undefined;
    if (!studyId || !z.string().cuid().safeParse(studyId).success) {
      logger.error('Could not determine internal studyId from Cint webhook', {
        cintRespondentId,
        custom_vars,
      });
      throw new BadRequestError('Missing or invalid study identifier in webhook payload.');
    }

    // Check if study exists
    const study = await db.brandLiftStudy.findUnique({ where: { id: studyId } });
    if (!study) {
      logger.error('Study referenced by Cint webhook not found', { studyId, cintRespondentId });
      throw new NotFoundError('Study not found.'); // Or a BadRequestError if studyId should always be valid
    }

    // TODO: Map rawAnswers to our internal answers format: Array<{ questionId: string, optionIds?: string[], textAnswer?: string | null }>
    // This requires knowing how Cint sends question identifiers and answer values, and mapping them to our SurveyQuestion.id and SurveyOption.id.
    // For MVP, we might store rawAnswers as JSON directly if mapping is too complex initially.
    const processedAnswers = rawAnswers as Prisma.JsonArray; // Placeholder cast
    const processedDemographics = rawDemographics as Prisma.JsonObject; // Placeholder cast

    // TODO: Determine isControlGroup. This needs to come from Cint or study setup.
    // For now, defaulting to false.
    const isControlGroup = false;

    // TODO: Map Cint S2S status to our internal respondent status if we have one, or store Cint's directly.
    // For now, we are just creating the SurveyResponse record upon valid webhook.

    const surveyResponse = await db.surveyResponse.create({
      data: {
        studyId: studyId,
        respondentId: cintRespondentId,
        cintResponseId: cintRespondentId, // Can use RID as a unique ID from Cint
        isControlGroup: isControlGroup,
        answers: processedAnswers, // Store as JSON
        demographics: processedDemographics, // Store as JSON
        respondedAt: new Date(), // Assuming webhook is near real-time
        // Potentially add rawCintStatus: cintStatus if needed
      },
    });

    logger.info('SurveyResponse record created from Cint webhook', {
      surveyResponseId: surveyResponse.id,
      studyId,
      cintRespondentId,
    });
    return NextResponse.json(
      { message: 'Webhook received successfully.', surveyResponseId: surveyResponse.id },
      { status: 201 }
    );
  } catch (error) {
    // Log error before passing to generic handler
    logger.error('Error processing Cint webhook /api/brand-lift/respond', {
      errorMessage: error instanceof Error ? error.message : String(error), // Safely access error message
      stack: error instanceof Error ? error.stack : undefined, // Safely access error stack
      requestBody: await req.text().catch(() => 'Could not read request body'), // Log raw body on error if possible
    });
    return handleApiError(error, req);
  }
};
