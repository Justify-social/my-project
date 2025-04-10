import { NextRequest, NextResponse } from "next/server";
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';
import { connectToDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { EnumTransformers } from "@/utils/enum-transformers";
import { tryCatch } from "@/config/middleware/api";
import { z } from 'zod';

// --- Define Schema Locally --- 
// (Copied from src/app/api/campaigns/[id]/route.ts)
const campaignUpdateSchema = z.object({
    campaignName: z.string().min(1).max(255).optional(),
    businessGoal: z.string().optional(),
    description: z.string().optional(),
    startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    timeZone: z.string().optional(),
    currency: z.enum(['USD', 'GBP', 'EUR']).optional(),
    totalBudget: z.number().min(0).optional(),
    socialMediaBudget: z.number().min(0).optional(),
    platform: z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']).optional(),
    influencerHandle: z.string().optional(),
    mainMessage: z.string().optional(),
    hashtags: z.string().optional(),
    memorability: z.string().optional(),
    keyBenefits: z.string().optional(),
    expectedAchievements: z.string().optional(),
    purchaseIntent: z.string().optional(),
    brandPerception: z.string().optional(),
    primaryKPI: z.enum([
        'AD_RECALL',
        'BRAND_AWARENESS',
        'CONSIDERATION',
        'MESSAGE_ASSOCIATION',
        'BRAND_PREFERENCE',
        'PURCHASE_INTENT',
        'ACTION_INTENT',
        'RECOMMENDATION_INTENT',
        'ADVOCACY'
    ]).optional(),
    // Step 2 specific fields
    secondaryKPIs: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    // Allow messaging as a nested object
    messaging: z.object({
        mainMessage: z.string().optional(),
        hashtags: z.string().optional(),
        memorability: z.string().optional(),
        keyBenefits: z.string().optional(),
        expectedAchievements: z.string().optional(),
        purchaseIntent: z.string().optional(),
        brandPerception: z.string().optional()
    }).optional(),
    // Step 3 audience data - add comprehensive schema
    audience: z.object({
        location: z.array(z.string()).optional(),
        ageDistribution: z.object({
            age1824: z.number().optional(),
            age2534: z.number().optional(),
            age3544: z.number().optional(),
            age4554: z.number().optional(),
            age5564: z.number().optional(),
            age65plus: z.number().optional(),
        }).optional(),
        gender: z.array(z.string()).optional(),
        otherGender: z.string().optional(),
        screeningQuestions: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        educationLevel: z.string().optional(),
        jobTitles: z.array(z.string()).optional(),
        incomeLevel: z.number().optional(),
        competitors: z.array(z.string()).optional(),
    }).optional(),
    // Step metadata
    step: z.number().optional(),
    status: z.enum(['draft', 'submitted']).optional(),
    name: z.string().optional(),
    // Other fields
    contacts: z.string().optional(),
    additionalContacts: z.array(z.record(z.string(), z.any())).optional(),
    primaryContact: z.object({
        firstName: z.string(),
        surname: z.string(),
        email: z.string().email(),
        position: z.string()
    }).optional(),
    secondaryContact: z.object({
        firstName: z.string(),
        surname: z.string(),
        email: z.string().email(),
        position: z.string()
    }).optional(),
    creativeRequirements: z.array(z.object({
        requirement: z.string()
    })).optional(),
    brandGuidelines: z.array(z.object({
        guideline: z.string()
    })).optional(),
    // For backward compatibility
    submissionStatus: z.enum(['draft', 'submitted']).optional(),
    influencers: z.array(z.any()).optional(),
});

/**
 * PATCH handler for saving/updating campaign wizard step data
 */
export const PATCH = tryCatch(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ id: string; step: string }> }
    ) => {
        const { id: campaignId, step } = await params;
        const stepNumber = parseInt(step, 10);

        if (!campaignId || isNaN(stepNumber)) {
            return NextResponse.json(
                { error: "Missing or invalid campaign ID or step" },
                { status: 400 }
            );
        }

        console.log(`PATCH /api/campaigns/${campaignId}/wizard/${stepNumber}`);

        // Connect to database
        await connectToDatabase();

        // Parse and validate request body
        const body = await request.json();
        console.log(`Received Step ${stepNumber} body:`, JSON.stringify(body, null, 2));

        const validationResult = campaignUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            console.error("Validation failed:", validationResult.error.format());
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.format(),
                },
                { status: 400 }
            );
        }

        const dataToSave = validationResult.data;

        console.log("Validated data:", JSON.stringify(dataToSave, null, 2));

        // --- Map frontend data to backend schema (based on /api/campaigns/[id]/route.ts) ---
        // Initialize mappedData reliably
        const mappedData: any = {
            updatedAt: new Date(),
            currentStep: stepNumber, // Track current step
            // Initialize nested objects potentially used across steps
            budget: {},
            primaryContact: {},
            secondaryContact: {},
            messaging: {},
            demographics: {},
            locations: [],
            targeting: {},
            competitors: []
        };

        // Set step completion flag based on current step
        if (stepNumber >= 1) mappedData.step1Complete = true;
        if (stepNumber >= 2) mappedData.step2Complete = true;
        if (stepNumber >= 3) mappedData.step3Complete = true;
        if (stepNumber >= 4) mappedData.step4Complete = true;
        // Add step 5 if applicable
        // if (stepNumber >= 5) mappedData.step5Complete = true; 


        // Map fields common across steps or specific to Step 1
        if (dataToSave.name || dataToSave.campaignName) {
            mappedData.name = dataToSave.name || dataToSave.campaignName;
        }
        if (dataToSave.businessGoal || dataToSave.description) {
            mappedData.businessGoal = dataToSave.businessGoal || dataToSave.description;
        }
        if (dataToSave.startDate) {
            mappedData.startDate = new Date(dataToSave.startDate);
        }
        if (dataToSave.endDate) {
            mappedData.endDate = new Date(dataToSave.endDate);
        }
        if (dataToSave.timeZone) {
            mappedData.timeZone = dataToSave.timeZone;
        }
        if (dataToSave.currency || dataToSave.totalBudget || dataToSave.socialMediaBudget) {
            mappedData.budget = {
                currency: dataToSave.currency || 'USD',
                total: dataToSave.totalBudget || 0,
                socialMedia: dataToSave.socialMediaBudget || 0
            };
        }
        if (dataToSave.primaryContact) {
            mappedData.primaryContact = dataToSave.primaryContact;
        }
        if (dataToSave.secondaryContact) {
            mappedData.secondaryContact = dataToSave.secondaryContact;
        }
        // --- Re-added mapping for additionalContacts as it should now exist on the model --- 
        if (Array.isArray(dataToSave.additionalContacts)) {
            mappedData.additionalContacts = dataToSave.additionalContacts;
        }

        // Map Step 2 specific fields (Objective & Messaging)
        if (stepNumber === 2) {
            if (dataToSave.primaryKPI) {
                mappedData.primaryKPI = dataToSave.primaryKPI;
            }
            if (dataToSave.secondaryKPIs) {
                mappedData.secondaryKPIs = Array.isArray(dataToSave.secondaryKPIs)
                    ? dataToSave.secondaryKPIs
                    : [dataToSave.secondaryKPIs];
            }
            if (dataToSave.features) {
                mappedData.features = Array.isArray(dataToSave.features)
                    ? dataToSave.features
                    : [dataToSave.features];
            }
            if (dataToSave.messaging || dataToSave.mainMessage || dataToSave.hashtags || dataToSave.memorability ||
                dataToSave.keyBenefits || dataToSave.expectedAchievements ||
                dataToSave.purchaseIntent || dataToSave.brandPerception) {

                mappedData.messaging = {
                    mainMessage: dataToSave.mainMessage || dataToSave.messaging?.mainMessage || '',
                    hashtags: dataToSave.hashtags || dataToSave.messaging?.hashtags || '',
                    memorability: dataToSave.memorability || dataToSave.messaging?.memorability || '',
                    keyBenefits: dataToSave.keyBenefits || dataToSave.messaging?.keyBenefits || '',
                    expectedAchievements: dataToSave.expectedAchievements || dataToSave.messaging?.expectedAchievements || '',
                    purchaseIntent: dataToSave.purchaseIntent || dataToSave.messaging?.purchaseIntent || '',
                    brandPerception: dataToSave.brandPerception || dataToSave.messaging?.brandPerception || ''
                };
            }
        }

        // Map Step 3 specific fields (Target Audience)
        if (stepNumber === 3 && dataToSave.audience) {
            // Map age distribution
            if (dataToSave.audience.ageDistribution) {
                mappedData.demographics.ageDistribution = dataToSave.audience.ageDistribution;
            }
            // Map gender and otherGender
            if (Array.isArray(dataToSave.audience.gender)) {
                mappedData.demographics.gender = dataToSave.audience.gender;
            }
            if (dataToSave.audience.otherGender) {
                mappedData.demographics.otherGender = dataToSave.audience.otherGender;
            }
            // Map educationLevel and incomeLevel
            if (dataToSave.audience.educationLevel) {
                mappedData.demographics.educationLevel = dataToSave.audience.educationLevel;
            }
            if (dataToSave.audience.incomeLevel) {
                mappedData.demographics.incomeLevel = dataToSave.audience.incomeLevel;
            }
            // Map jobTitles
            if (Array.isArray(dataToSave.audience.jobTitles)) {
                mappedData.demographics.jobTitles = dataToSave.audience.jobTitles;
            }
            // Map location
            if (Array.isArray(dataToSave.audience.location)) {
                mappedData.locations = dataToSave.audience.location.map((loc: string) => ({ location: loc }));
            }
            // Map screeningQuestions
            if (Array.isArray(dataToSave.audience.screeningQuestions)) {
                mappedData.targeting.screeningQuestions = dataToSave.audience.screeningQuestions.map((q: string) => ({ question: q }));
            }
            // Map languages
            if (Array.isArray(dataToSave.audience.languages)) {
                mappedData.targeting.languages = dataToSave.audience.languages.map((lang: string) => ({ language: lang }));
            }
            // Map competitors
            if (Array.isArray(dataToSave.audience.competitors)) {
                mappedData.competitors = dataToSave.audience.competitors;
            }
        }

        // Map Step 4 specific fields (Creative Assets)
        // TODO: Add mapping logic for step 4 fields (e.g., creative assets, guidelines) if needed
        // if (stepNumber === 4 && dataToSave.creativeAssets) { ... }

        // Map Step 5 specific fields (Review)
        // TODO: Add mapping logic for step 5 fields if needed
        // if (stepNumber === 5 && dataToSave.status) { mappedData.status = dataToSave.status.toUpperCase(); }

        // Handle status (often updated in the final step)
        if (dataToSave.status) {
            mappedData.status = dataToSave.status.toUpperCase(); // Ensure uppercase for DB
        }

        // Remove fields that shouldn't be directly updated if they weren't part of the specific step's payload
        // Example: Don't overwrite audience data when saving step 1
        // This logic might need refinement based on how partial updates are handled frontend
        // For now, we map everything received in the validated payload.

        // Transform enums before saving
        const transformedDataForDb = EnumTransformers.transformObjectToBackend(mappedData);
        console.log("Data ready for DB update:", JSON.stringify(transformedDataForDb, null, 2));

        // --- Update Database --- 
        const updatedCampaign = await prisma.campaignWizard.update({
            where: { id: campaignId },
            data: transformedDataForDb,
            include: {
                Influencer: true // Include influencers if needed
            }
        });
        console.log("DB Update successful for Campaign ID:", campaignId);

        // --- Handle Influencers (Added logic mirroring main route) ---
        if (dataToSave &&
            dataToSave.influencers != null && // Check not null/undefined
            Array.isArray(dataToSave.influencers) &&
            dataToSave.influencers.length > 0
        ) {
            console.log('Updating influencers for wizard campaign:', campaignId);

            // Assign to a new constant for clearer type narrowing
            const influencersToSave = dataToSave.influencers;

            // Use a transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
                // First delete existing influencers for this campaign
                await tx.influencer.deleteMany({
                    where: { campaignId }
                });
                console.log('Deleted existing influencers for campaign:', campaignId);

                // Then create new influencers for the campaign using the new constant
                const influencerCreateData = influencersToSave
                    .filter((inf: any) => inf.handle && inf.platform) // Ensure basic validity
                    .map((inf: any) => ({
                        // Generate an ID if needed, or use provided if exists (handle potential type issues)
                        id: typeof inf.id === 'string' ? inf.id : `inf-${Date.now()}-${Math.round(Math.random() * 1000)}`,
                        platform: EnumTransformers.platformToBackend(inf.platform), // Transform platform enum
                        handle: inf.handle,
                        platformId: inf.platformId || '', // Ensure platformId is a string
                        campaignId: campaignId, // Link to the current campaign wizard record
                        updatedAt: new Date()
                    }));

                if (influencerCreateData.length > 0) {
                    await tx.influencer.createMany({
                        data: influencerCreateData
                    });
                    console.log(`Created ${influencerCreateData.length} new influencers for campaign:`, campaignId);
                }
            });

            // Refetch the campaign with updated influencers to include in the response
            const campaignWithInfluencers = await prisma.campaignWizard.findUnique({
                where: { id: campaignId },
                include: {
                    Influencer: true
                }
            });
            // Use the refetched data for the response transformation
            const transformedCampaignForFrontend = EnumTransformers.transformObjectFromBackend(campaignWithInfluencers);
            return NextResponse.json({
                success: true,
                data: transformedCampaignForFrontend,
                message: `Step ${stepNumber} ${dataToSave.status === 'draft' ? 'saved as draft' : 'updated'} with influencers`
            });
        }
        // --- End Influencer Handling ---

        // --- Transform response for frontend (Original path if no influencers) --- 
        const transformedCampaignForFrontend = EnumTransformers.transformObjectFromBackend(updatedCampaign);

        return NextResponse.json({
            success: true,
            data: transformedCampaignForFrontend, // Return actual updated data
            message: `Step ${stepNumber} ${dataToSave.status === 'draft' ? 'saved as draft' : 'updated'}`
        });
    },
    {
        // Options for tryCatch
        entityName: "CampaignWizardStep",
        operation: DbOperation.UPDATE,
    }
);


/**
 * GET handler for retrieving campaign wizard step data
 * NOTE: This is likely redundant if the main /api/campaigns/[id] fetches all data.
 * Consider removing or simplifying if not strictly needed for step-specific logic.
 */
export const GET = tryCatch(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ id: string; step: string }> }
    ) => {
        const { id: campaignId, step } = await params;
        const stepNumber = parseInt(step, 10);

        if (!campaignId || isNaN(stepNumber)) {
            return NextResponse.json(
                { error: "Missing or invalid campaign ID or step" },
                { status: 400 }
            );
        }

        console.log(`GET /api/campaigns/${campaignId}/wizard/${stepNumber}`);

        // Connect to database
        await connectToDatabase();

        // Fetch the specific campaign step data (potentially redundant)
        // You might only need the main GET /api/campaigns/[id] endpoint
        const campaign = await prisma.campaignWizard.findUnique({
            where: { id: campaignId },
            include: {
                // Include relations needed for this specific step if any
                Influencer: true // Example
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        // Transform for frontend
        const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);

        // Return only data relevant to this step? Or the whole campaign?
        // Returning whole campaign for now, consistent with main GET
        return NextResponse.json({
            success: true,
            data: transformedCampaign
        });
    },
    {
        entityName: "CampaignWizardStep",
        operation: DbOperation.FETCH,
    }
); 