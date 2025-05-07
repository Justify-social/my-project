import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma, BrandLiftStudyStatus, SurveyResponse, SurveyQuestion, SurveyOption } from '@prisma/client';
import { stringify } from 'csv-stringify/sync'; // For CSV generation

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, NotFoundError, UnauthenticatedError, ForbiddenError } from '@/lib/errors';

// Helper to verify study access and if it's in a state suitable for export (e.g., COMPLETED)
async function verifyStudyForExport(studyId: string, orgId: string) {
    const study = await db.brandLiftStudy.findFirst({
        where: { id: studyId, organizationId: orgId },
        select: { id: true, status: true, name: true } // Include name for filename
    });
    if (!study) throw new NotFoundError('Study not found or not accessible.');

    // Typically, export is allowed for COMPLETED or perhaps COLLECTING studies
    const allowedStatuses: BrandLiftStudyStatus[] = [
        BrandLiftStudyStatus.COMPLETED,
        BrandLiftStudyStatus.COLLECTING
    ];
    if (!allowedStatuses.includes(study.status as BrandLiftStudyStatus)) {
        throw new ForbiddenError(`Response data cannot be exported when study status is ${study.status}.`);
    }
    return study;
}

export const GET = async (req: NextRequest, { params: paramsPromise }: { params: Promise<{ studyId: string }> }) => {
    try {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) throw new UnauthenticatedError('Authentication and organization membership required.');

        const { studyId } = await paramsPromise;
        if (!studyId) throw new BadRequestError('Study ID is required.');

        const study = await verifyStudyForExport(studyId, orgId);

        const responses: (SurveyResponse & { study: { questions: (SurveyQuestion & { options: SurveyOption[] })[] } })[] = await db.surveyResponse.findMany({
            where: { studyId: studyId },
            include: {
                study: {
                    include: { questions: { include: { options: true } } }
                }
            }
        });

        if (responses.length === 0) {
            // Return a 200 with an empty CSV or a message, rather than 404, as the study exists.
            // Or a specific status code like 204 No Content if preferred and handled by client.
            logger.info('No responses found to export for study', { studyId, orgId });
            const emptyCsv = stringify([['No responses found for this study']]);
            return new NextResponse(emptyCsv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${study.name.replace(/[^a-z0-9_\-\. ]/ig, '')}_empty_export.csv"`,
                },
            });
        }

        // --- CSV Data Preparation ---
        // Header row for the CSV
        const csvHeaders = [
            'respondentId', 'cintResponseId', 'isControlGroup', 'respondedAt',
            'questionId', 'questionText', 'optionId', 'optionText', 'rawAnswerValue' // For more complex answer structures
            // Add demographic headers dynamically if needed
        ];
        const demographicKeys = new Set<string>();
        responses.forEach((res: SurveyResponse) => {
            if (res.demographics && typeof res.demographics === 'object') {
                Object.keys(res.demographics as Prisma.JsonObject).forEach(key => demographicKeys.add(key));
            }
        });
        const sortedDemographicKeys = Array.from(demographicKeys).sort();
        csvHeaders.push(...sortedDemographicKeys.map(k => `demo_${k}`));

        const csvData: (string | number | boolean | Date | null | undefined)[][] = [csvHeaders];

        // Flatten responses: one row per answer to a question by a respondent
        for (const res of responses) {
            const baseRow: (string | number | boolean | Date | null | undefined)[] = [
                res.respondentId,
                res.cintResponseId,
                res.isControlGroup,
                res.respondedAt,
            ];

            const demographicsForRow = sortedDemographicKeys.map(key => {
                const value = (res.demographics && typeof res.demographics === 'object') ? (res.demographics as Prisma.JsonObject)[key] : null;

                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
                    return value;
                }
                // For anything else (arrays, objects), stringify it.
                // Dates would be ISO strings from JSON, so typeof value === 'string' handles them.
                return JSON.stringify(value);
            });

            if (Array.isArray(res.answers) && res.answers.length > 0) {
                for (const answer of res.answers as Prisma.JsonArray) {
                    if (typeof answer === 'object' && answer !== null && 'questionId' in answer) {
                        const typedAnswer = answer as { questionId: string; optionIds?: string[]; textAnswer?: string | null };
                        const question = res.study.questions.find((q: SurveyQuestion) => q.id === typedAnswer.questionId);

                        if (typedAnswer.optionIds && typedAnswer.optionIds.length > 0) {
                            for (const optionId of typedAnswer.optionIds) {
                                const option = question?.options.find((o: SurveyOption) => o.id === optionId);
                                csvData.push([
                                    ...baseRow,
                                    typedAnswer.questionId,
                                    question?.text ?? 'N/A',
                                    optionId,
                                    option?.text ?? 'N/A',
                                    null, // No rawAnswerValue if it's an option selection
                                    ...demographicsForRow
                                ]);
                            }
                        } else if (typedAnswer.textAnswer) {
                            csvData.push([
                                ...baseRow,
                                typedAnswer.questionId,
                                question?.text ?? 'N/A',
                                null, // No optionId
                                null, // No optionText
                                typedAnswer.textAnswer,
                                ...demographicsForRow
                            ]);
                        } else {
                            // Case for question answered but no option/text (e.g. skipped if not mandatory)
                            csvData.push([...baseRow, typedAnswer.questionId, question?.text ?? 'N/A', null, null, 'SKIPPED/NO_ANSWER', ...demographicsForRow]);
                        }
                    } else {
                        // Malformed answer, log and skip or add with placeholder
                        csvData.push([...baseRow, 'MALFORMED_ANSWER', null, null, null, JSON.stringify(answer), ...demographicsForRow]);
                    }
                }
            } else {
                // Respondent with no answers recorded for any question
                csvData.push([...baseRow, 'NO_ANSWERS_RECORDED', null, null, null, null, ...demographicsForRow]);
            }
        }
        // --- End CSV Data Preparation ---

        const csvString = stringify(csvData);
        const safeFilename = study.name.replace(/[^a-z0-9_\-\. ]/ig, '') || 'brand_lift_export';

        logger.info(`Exporting ${responses.length} responses for study`, { studyId, orgId });
        return new NextResponse(csvString, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${safeFilename}.csv"`,
            },
        });

    } catch (error: any) {
        return handleApiError(error, req);
    }
}; 