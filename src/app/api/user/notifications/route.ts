import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

interface NotificationPreferences {
  campaignUpdates: boolean;
  brandHealthAlerts: boolean;
  aiInsightNotifications: boolean;
}

/**
 * GET /api/user/notifications
 * Retrieves the user's notification preferences
 */
export async function GET() {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // In development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        data: {
          campaignUpdates: false,
          brandHealthAlerts: true,
          aiInsightNotifications: false
        } 
      });
    }
    
    // Get notification preferences from database
    const prefs = await prisma.notificationPrefs.findUnique({
      where: { userId: session.user.sub }
    });
    
    // If no preferences exist yet, return defaults
    if (!prefs) {
      const defaultPrefs: NotificationPreferences = {
        campaignUpdates: false,
        brandHealthAlerts: false,
        aiInsightNotifications: false
      };
      
      return NextResponse.json({ 
        success: true, 
        data: defaultPrefs 
      });
    }
    
    // Map database model to response format
    const preferencesData: NotificationPreferences = {
      campaignUpdates: prefs.campaignUpdates,
      brandHealthAlerts: prefs.brandHealthAlerts,
      aiInsightNotifications: prefs.aiInsightNotifications
    };
    
    return NextResponse.json({
      success: true,
      data: preferencesData
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch notification preferences' }, { status: 500 });
  }
}

/**
 * PUT /api/user/notifications
 * Updates the user's notification preferences
 */
export async function PUT(request: Request) {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data: NotificationPreferences = await request.json();
    
    // Validate input
    const requiredFields = ['campaignUpdates', 'brandHealthAlerts', 'aiInsightNotifications'];
    for (const field of requiredFields) {
      if (typeof data[field as keyof NotificationPreferences] !== 'boolean') {
        return NextResponse.json({ 
          error: `${field} must be a boolean value` 
        }, { status: 400 });
      }
    }
    
    // In development mode, just return success
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        data 
      });
    }
    
    // Update or create notification preferences
    const updatedPrefs = await prisma.notificationPrefs.upsert({
      where: { userId: session.user.sub },
      update: {
        campaignUpdates: data.campaignUpdates,
        brandHealthAlerts: data.brandHealthAlerts,
        aiInsightNotifications: data.aiInsightNotifications
      },
      create: {
        userId: session.user.sub,
        campaignUpdates: data.campaignUpdates,
        brandHealthAlerts: data.brandHealthAlerts,
        aiInsightNotifications: data.aiInsightNotifications
      }
    });
    
    // Map database model to response format
    const preferencesData: NotificationPreferences = {
      campaignUpdates: updatedPrefs.campaignUpdates,
      brandHealthAlerts: updatedPrefs.brandHealthAlerts,
      aiInsightNotifications: updatedPrefs.aiInsightNotifications
    };
    
    return NextResponse.json({
      success: true,
      data: preferencesData
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 });
  }
} 