import { PrismaClient } from '@prisma/client';

// Add a declaration for the global mockBrandingSettings
declare global {
  // Using var to be compatible with global object
  // eslint-disable-next-line no-var
  var mockBrandingSettings: Record<string, any>;
}

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    return prisma;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

// Mock implementation of branding settings for development
// This allows the front-end to work without actual database migrations
export async function getBrandingSettings(companyId: string) {
  if (process.env.NODE_ENV === 'development') {
    // Check if we have saved mock data in the global store
    try {
      // For server-side, we use a global object
      if (typeof window === 'undefined') {
        if (!global.mockBrandingSettings) {
          global.mockBrandingSettings = {};
        }

        if (global.mockBrandingSettings[companyId]) {
          console.log('SERVER: Returning cached branding settings for', companyId);
          return global.mockBrandingSettings[companyId];
        }
      }
      // For client-side, we try to get from localStorage
      else if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem(`mockBrandingSettings_${companyId}`);
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            console.log('CLIENT: Found saved mock branding settings:', parsed);
            // Ensure dates are restored as Date objects
            if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
            if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
            return parsed;
          } catch (e) {
            console.error('Error parsing saved mock branding settings:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error accessing mock branding storage:', e);
    }

    // Default mock data if no saved data exists
    const defaultSettings = {
      id: 'mock-branding-id',
      companyId,
      primaryColor: 'var(--accent-color)',
      secondaryColor: 'var(--secondary-color)',
      headerFont: 'var(--font-heading)',
      headerFontSize: '18px',
      bodyFont: 'var(--font-body)',
      bodyFontSize: '14px',
      logoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store default settings in mock storage
    try {
      if (typeof window === 'undefined') {
        if (!global.mockBrandingSettings) {
          global.mockBrandingSettings = {};
        }
        global.mockBrandingSettings[companyId] = defaultSettings;
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(`mockBrandingSettings_${companyId}`, JSON.stringify(defaultSettings));
      }
    } catch (e) {
      console.error('Error storing default settings:', e);
    }

    return defaultSettings;
  }

  try {
    // Try to get from actual database if not in development
    // Will use this once migrations are applied
    // Note: Using any here because the schema might not be generated yet
    return await (prisma as any).brandingSettings.findUnique({
      where: { companyId },
    });
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    // Fall back to default settings
    return {
      id: 'default-branding-id',
      companyId,
      primaryColor: 'var(--accent-color)',
      secondaryColor: 'var(--secondary-color)',
      headerFont: 'var(--font-heading)',
      headerFontSize: '18px',
      bodyFont: 'var(--font-body)',
      bodyFontSize: '14px',
      logoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Mock implementation of saving branding settings
export async function saveBrandingSettings(companyId: string, settings: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Saving branding settings (mock):', settings);

    // First, try to get existing data to preserve logo if not explicitly changed
    let existingData: any = null;

    try {
      if (typeof window === 'undefined') {
        if (global.mockBrandingSettings && global.mockBrandingSettings[companyId]) {
          existingData = global.mockBrandingSettings[companyId];
        }
      } else if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem(`mockBrandingSettings_${companyId}`);
        if (savedSettings) {
          existingData = JSON.parse(savedSettings);
        }
      }
    } catch (e) {
      console.error('Error getting existing mock data:', e);
    }

    // If we have existing data with a logo and the new settings don't specify a logo change
    if (existingData && existingData.logoUrl && !settings.logoUrl) {
      console.log('Preserving existing logo URL:', existingData.logoUrl);
      settings.logoUrl = existingData.logoUrl;
    }

    // Special case: handle explicit logo removal
    if (settings.logoUrl === null && existingData && existingData.logoUrl) {
      console.log('Logo explicitly removed');
    }

    // Create the mock data with timestamps
    const mockData = {
      id: 'mock-branding-id',
      companyId,
      ...settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Final data to save with logo handling:', mockData);

    // Save to global store for server-side
    try {
      if (typeof window === 'undefined') {
        if (!global.mockBrandingSettings) {
          global.mockBrandingSettings = {};
        }
        global.mockBrandingSettings[companyId] = mockData;
        console.log('SERVER: Saved mock branding settings to global store');
      }
      // Save to localStorage for client-side persistence
      else if (typeof window !== 'undefined') {
        localStorage.setItem(`mockBrandingSettings_${companyId}`, JSON.stringify(mockData));
        console.log('CLIENT: Saved mock branding settings to localStorage');
      }
    } catch (e) {
      console.error('Error saving to mock branding storage:', e);
    }

    return mockData;
  }

  try {
    // Try to save to actual database if not in development
    return await (prisma as any).brandingSettings.upsert({
      where: { companyId },
      update: settings,
      create: {
        companyId,
        ...settings,
      },
    });
  } catch (error) {
    console.error('Error saving branding settings:', error);
    throw error;
  }
}

export default prisma;
