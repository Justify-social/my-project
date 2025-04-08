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
  async (data, request) => {
    // Import the EnumTransformers utility
    const { EnumTransformers } = await import('@/utils/enum-transformers');
    
    // Transform any enum values from frontend to backend format
    const transformedData = EnumTransformers.transformObjectToBackend(data);
    console.log('Transformed wizard data for API:', transformedData);
    
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: uuidv4(),
        name: transformedData.name,
        businessGoal: transformedData.businessGoal || '',
        startDate: transformedData.startDate || new Date(),
        endDate: transformedData.endDate || new Date(),
        timeZone: transformedData.timeZone,
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
