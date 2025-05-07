import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { Prisma, BrandLiftStudyStatus } from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { AiConfig, createQuestionGenerationPrompt } from '@/lib/ai/brandlift_prompts';
import { BrandLiftStudyData } from '@/types/brand-lift';

interface RouteContext {
  params: { studyId: string };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StudyContextForPrompt {
  id: string;
  name: string;
  funnelStage: string;
  primaryKpi: string;
  secondaryKpis: string[];
  status: BrandLiftStudyStatus;
  campaign?: {
    campaignName?: string | null;
    primaryCreativeUrl?: string | null;
    primaryCreativeType?: string | null;
  } | null;
}

async function verifyStudyAccess(studyId: string, orgId: string): Promise<StudyContextForPrompt> {
  const study = await db.brandLiftStudy.findFirst({
    where: { id: studyId, organizationId: orgId },
    select: {
      id: true,
      name: true,
      funnelStage: true,
      primaryKpi: true,
      secondaryKpis: true,
      status: true,
      campaign: {
        select: {
          campaignName: true,
        },
      },
    },
  });
  if (!study) throw new NotFoundError('Study not found or not accessible');

  const currentStatus = study.status as BrandLiftStudyStatus;
  if (
    currentStatus !== BrandLiftStudyStatus.DRAFT &&
    currentStatus !== BrandLiftStudyStatus.PENDING_APPROVAL
  ) {
    throw new ForbiddenError(
      `AI suggestions cannot be generated for study status: ${study.status}`
    );
  }

  return {
    id: study.id,
    name: study.name,
    funnelStage: study.funnelStage,
    primaryKpi: study.primaryKpi,
    secondaryKpis: study.secondaryKpis ?? [],
    status: study.status,
    campaign: study.campaign
      ? {
          campaignName: study.campaign.campaignName,
        }
      : undefined,
  } as StudyContextForPrompt;
}

export const POST = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId)
      throw new UnauthenticatedError('Authentication and organization membership required.');

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API Key not configured', { orgId, studyId });
      throw new Error('AI features are currently unavailable due to configuration.');
    }

    const studyDataForPrompt: StudyContextForPrompt = await verifyStudyAccess(studyId, orgId);

    const promptContext: Partial<BrandLiftStudyData> = {
      id: studyDataForPrompt.id,
      name: studyDataForPrompt.name,
      funnelStage: studyDataForPrompt.funnelStage,
      primaryKpi: studyDataForPrompt.primaryKpi,
      secondaryKpis: studyDataForPrompt.secondaryKpis,
      status: studyDataForPrompt.status,
      campaign: studyDataForPrompt.campaign
        ? {
            campaignName: studyDataForPrompt.campaign.campaignName,
          }
        : undefined,
    };
    const userPrompt = createQuestionGenerationPrompt(promptContext);

    logger.info('Requesting AI question suggestions', { studyId, orgId, model: AiConfig.model });

    const completion = await openai.chat.completions.create({
      model: AiConfig.model,
      messages: [
        { role: 'system', content: AiConfig.questionGenSystemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const suggestedYaml = completion.choices[0]?.message?.content;
    if (!suggestedYaml) throw new Error('AI did not return any suggestions.');

    return new NextResponse(suggestedYaml, {
      status: 200,
      headers: { 'Content-Type': 'application/yaml' },
    });
  } catch (error: any) {
    return handleApiError(error, req);
  }
};
