import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  console.log('Session in notifications API:', session);
  
  if (!session?.user?.sub) {
    console.warn('No authenticated user found in session');
    // For development, return mock notification preferences
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        data: {
          campaignUpdates: false,
          brandHealthAlerts: false,
          aiInsightNotifications: false
        }
      });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const prefs = await prisma.notificationPrefs.findUnique({
      where: { userId: session.user.sub },
    });

    // Return defaults if no preferences exist yet
    const defaultPrefs = {
      campaignUpdates: false,
      brandHealthAlerts: false,
      aiInsightNotifications: false,
    };

    return NextResponse.json({
      success: true,
      data: prefs || defaultPrefs,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch notification preferences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { campaignUpdates, brandHealthAlerts, aiInsightNotifications } = await request.json();

    // Validate input
    if (
      typeof campaignUpdates !== 'boolean' ||
      typeof brandHealthAlerts !== 'boolean' ||
      typeof aiInsightNotifications !== 'boolean'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const prefs = await prisma.notificationPrefs.upsert({
      where: { userId: session.user.sub },
      update: {
        campaignUpdates,
        brandHealthAlerts,
        aiInsightNotifications,
      },
      create: {
        userId: session.user.sub,
        campaignUpdates,
        brandHealthAlerts,
        aiInsightNotifications,
      },
    });

    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 });
  }
}