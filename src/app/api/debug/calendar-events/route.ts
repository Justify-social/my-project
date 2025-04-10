// src/app/api/debug/calendar-events/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status, CampaignWizard, Influencer } from '@prisma/client'; // Import types

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

export async function GET() {
    console.log("API Route: Fetching calendar events...");
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
                        platform: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc', // Order by start date
            },
            take: 100, // Limit results for performance
        });

        console.log(`API Route: Fetched ${campaigns.length} campaigns.`);

        // Transform data for the calendar component's expected structure
        const events: CalendarAPIEvent[] = campaigns.map((campaign: any) => { // Use any temporarily for easier access
            let budgetAmount: number | undefined = undefined;
            if (campaign.budget && typeof campaign.budget === 'object' && campaign.budget !== null && 'total' in campaign.budget) {
                const parsed = Number((campaign.budget as any).total);
                if (!isNaN(parsed)) {
                    budgetAmount = parsed;
                }
            }

            // Determine if allDay (simple example: check if time is midnight)
            const isAllDay = campaign.startDate.getHours() === 0 && campaign.startDate.getMinutes() === 0 && campaign.startDate.getSeconds() === 0;

            // Extract influencer handles
            const influencerHandles = campaign.Influencer?.map((inf: { handle: string }) => inf.handle) || [];

            // Extract unique platforms from associated influencers
            const platforms = campaign.Influencer
                ? [...new Set(campaign.Influencer
                    .map((inf: { platform?: string | null }) => inf.platform) // Get platform from each influencer
                    .filter((p: string | null | undefined): p is string => !!p))] // Filter out null/empty and ensure type is string
                : [];
            const platformString = platforms.join(', '); // Join unique platforms into a comma-separated string

            return {
                id: campaign.id,
                title: campaign.name,
                start: campaign.startDate, // Already Date objects from Prisma
                end: campaign.endDate,     // Already Date objects from Prisma
                status: campaign.status,   // Pass status directly (Prisma enum or string)
                // Pass the combined platform string through
                platform: platformString || undefined,
                budget: budgetAmount,
                allDay: isAllDay, // Set allDay flag
                influencerHandles: influencerHandles // Include handles
            };
        });

        return NextResponse.json({ events });

    } catch (error) {
        console.error("API Route Error fetching calendar events:", error);
        // Provide more details in development
        const details = process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : String(error))
            : 'Internal Server Error';
        return NextResponse.json({ error: 'Failed to fetch calendar events', details }, { status: 500 });
    }
}