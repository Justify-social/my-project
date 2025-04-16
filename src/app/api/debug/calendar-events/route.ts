// src/app/api/debug/calendar-events/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client'; // Import only used types
import { Prisma } from '@prisma/client'; // Import Prisma client

export interface CalendarAPIEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  platform?: string | null; // Allow null from DB
  budget?: number;
  status?: Status | string | null; // Allow Status enum or string/null
  allDay?: boolean;
  influencerHandles?: string[]; // Add influencer handles
}

// Define interface for data selected from Prisma
interface PrismaCampaignSelect {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  status: Status;
  budget: Prisma.JsonValue; // Use Prisma.JsonValue for budget
  Influencer: {
    handle: string | null;
    platform: string | null;
  }[];
}

export async function GET() {
  console.log('API Route: Fetching calendar events...');
  try {
    const campaigns = await prisma.campaignWizard.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        status: true,
        budget: true,
        Influencer: {
          select: {
            handle: true,
            platform: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc', // Order by start date
      },
      take: 100, // Limit results for performance
    });

    console.log(`API Route: Fetched ${campaigns.length} campaigns.`);

    // Transform data for the calendar component's expected structure
    const events: CalendarAPIEvent[] = campaigns.map((campaign: PrismaCampaignSelect) => {
      // Use specific type
      // Use specific type instead of any
      let budgetAmount: number | undefined = undefined;
      if (campaign.budget && typeof campaign.budget === 'object' && 'total' in campaign.budget) {
        // Use type assertion after check
        budgetAmount = (campaign.budget as { total?: number }).total;
      }

      // Extract unique platforms from associated influencers
      const platforms = campaign.Influencer
        ? [
            ...new Set(
              campaign.Influencer.map((inf: { platform?: string | null }) => inf.platform) // Get platform from each influencer
                .filter((p: string | null | undefined): p is string => !!p)
            ),
          ] // Filter out null/empty and ensure type is string
        : [];
      const platformString = platforms.join(', '); // Join unique platforms into a comma-separated string

      return {
        id: campaign.id,
        title: campaign.name,
        start: campaign.startDate, // Already Date objects from Prisma
        end: campaign.endDate === null ? undefined : campaign.endDate, // Map null to undefined
        status: campaign.status, // Pass status directly (Prisma enum or string)
        // Pass the combined platform string through
        platform: platformString || undefined,
        budget: budgetAmount,
        allDay: false, // Assuming these are specific events, not all-day
        // Safely map influencers, filtering null handles, keeping as array
        influencerHandles: campaign.Influencer.map((inf: { handle: string | null }) => inf.handle) // Use correct property name // Extract handles (potentially null)
          .filter((handle): handle is string => handle !== null), // Filter out nulls (type guard), keep as string[]
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('API Route Error fetching calendar events:', error);
    // Provide more details in development
    const details =
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.message
          : String(error)
        : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to fetch calendar events', details },
      { status: 500 }
    );
  }
}
