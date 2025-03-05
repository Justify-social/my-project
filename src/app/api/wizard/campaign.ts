// /src/app/api/wizard/campaign.ts
import { NextResponse } from "next/server";
import { z } from 'zod';
import { prisma } from "@/lib/prisma";
import { withValidation } from '@/middleware/api';
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
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: uuidv4(),
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
    return NextResponse.json({
      success: true,
      data: campaign
    }, { status: 201 });
  },
  { entityName: 'Campaign', logValidationErrors: true }
);
