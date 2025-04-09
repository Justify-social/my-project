// /src/app/api/wizard/campaign.ts
import { NextResponse } from "next/server";
import { z } from 'zod';
import { prisma } from "@/lib/prisma";
import { withValidation } from '@/config/middleware/api';
import { DbOperation } from '@/lib/data-mapping/db-logger';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

// Define schema for campaign creation
const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  businessGoal: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  timeZone: z.string().optional().default('UTC'),
  // Add other fields as needed
});

// POST handler - Create campaign with validation
export const POST = withValidation(
  campaignSchema,
  // Explicitly type the validated data
  async (data: z.infer<typeof campaignSchema>, request) => {
    // Import the EnumTransformers utility
    const { EnumTransformers } = await import('@/utils/enum-transformers');

    // Transform any enum values from frontend to backend format
    // Now TypeScript knows the shape of data, so transformedData should be typed correctly
    const transformedData = EnumTransformers.transformObjectToBackend(data);
    console.log('Transformed wizard data for API:', transformedData);

    const campaign = await prisma.campaignWizard.create({
      data: {
        id: uuidv4(),
        // Access properties directly on correctly typed data
        name: data.name,
        businessGoal: data.businessGoal || '',
        startDate: data.startDate || new Date(),
        endDate: data.endDate || new Date(),
        timeZone: data.timeZone,
        primaryContact: {},
        secondaryContact: Prisma.JsonNull,
        budget: {},
        updatedAt: new Date(),
        step1Complete: true,
        step2Complete: false,
        step3Complete: false,
        step4Complete: false,
        secondaryKPIs: [],
        features: [],
        locations: [],
        competitors: [],
        assets: [],
        requirements: []
      },
    });

    // Transform campaign data back to frontend format before returning
    const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaign);

    return NextResponse.json({
      success: true,
      data: transformedCampaign
    }, { status: 201 });
  },
  { entityName: 'Campaign', logValidationErrors: true }
);
