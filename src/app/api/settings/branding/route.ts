import { NextResponse } from 'next/server';
import { prisma, getBrandingSettings, saveBrandingSettings } from '@/lib/db';
import { getSession } from '@/lib/session';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

// Define the branding settings type
interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  headerFont: string;
  headerFontSize: string;
  bodyFont: string;
  bodyFontSize: string;
  logoUrl?: string | null;
}

export async function GET() {
  const session = await getSession();
  console.log('Session in branding API:', session);
  
  if (!session?.user?.sub) {
    console.warn('No authenticated user found in session');
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        data: {
          primaryColor: "#00BFFF",
          secondaryColor: "#40404F",
          headerFont: "Work Sans",
          headerFontSize: "18px",
          bodyFont: "Work Sans",
          bodyFontSize: "14px",
          logoUrl: null
        }
      });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const companyId = await getCompanyIdForUser(session.user.sub);
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    const brandingSettings = await getBrandingSettings(companyId);

    return NextResponse.json({
      success: true,
      data: brandingSettings,
    });
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    return NextResponse.json({ error: 'Failed to fetch branding settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    
    // Log received form data for debugging
    console.log('Received form data fields:', Array.from(formData.keys()));
    
    const primaryColor = formData.get('primaryColor') as string;
    const secondaryColor = formData.get('secondaryColor') as string;
    const headerFont = formData.get('headerFont') as string;
    const headerFontSize = formData.get('headerFontSize') as string;
    const bodyFont = formData.get('bodyFont') as string;
    const bodyFontSize = formData.get('bodyFontSize') as string;
    const logoFile = formData.get('logoFile') as File | null;
    const removeExistingLogo = formData.get('removeExistingLogo') === 'true';
    
    console.log('Parsed form data values:', {
      primaryColor,
      secondaryColor,
      headerFont,
      headerFontSize,
      bodyFont,
      bodyFontSize,
      logoFile: logoFile ? 'File present' : 'No file',
      removeExistingLogo
    });
    
    const companyId = await getCompanyIdForUser(session.user.sub);
    console.log('Company ID for user:', companyId);
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    let logoUrl = null;
    let skipLogoUpdate = false;
    let logoRemoved = false;
    
    // First check if we need to get existing settings
    const oldSettings = await getBrandingSettings(companyId);
    
    // If logo removal is requested
    if (removeExistingLogo && oldSettings?.logoUrl) {
      console.log('Logo removal requested. Current logo:', oldSettings.logoUrl);
      
      try {
        // If using UploadThing, attempt to delete the old file
        if (process.env.NODE_ENV !== 'development') {
          const oldFileKey = oldSettings.logoUrl.split('/').pop();
          if (oldFileKey) {
            console.log('Attempting to delete old logo file:', oldFileKey);
            await utapi.deleteFiles(oldFileKey);
          }
        }
        
        // Set logoUrl to null explicitly to indicate removal
        logoUrl = null;
        logoRemoved = true;
        console.log('Logo marked for removal');
      } catch (deleteError) {
        console.error('Error deleting old logo:', deleteError);
        // Continue with the update even if deletion fails
      }
    }
    // Only try to upload if there's a logoFile and we're not removing the logo
    else if (logoFile && !removeExistingLogo) {
      try {
        // Upload the logo file to uploadthing
        console.log('Attempting to upload logo file...');
        
        // Try using the specific logoUploader endpoint
        try {
          // Create a FormData with the specific 'files' key that UploadThing expects
          const logoFormData = new FormData();
          logoFormData.append('files', logoFile);
          
          // Call the uploadthing endpoint directly for logoUploader
          const uploadResponse = await fetch('/api/uploadthing/logoUploader', {
            method: 'POST',
            body: logoFormData,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            if (uploadResult.data?.[0]?.url) {
              logoUrl = uploadResult.data[0].url;
              console.log('Logo uploaded successfully via dedicated endpoint:', logoUrl);
            }
          } else {
            console.warn('Logo upload failed via dedicated endpoint, falling back to direct method');
          }
        } catch (specificUploadError) {
          console.warn('Error using specific logo endpoint:', specificUploadError);
          // Continue to fallback method
        }
        
        // Fallback to direct upload method if the specific endpoint didn't work
        if (!logoUrl) {
          console.log('Falling back to direct UTApi upload');
          const upload = await utapi.uploadFiles(logoFile);
          if (upload.data) {
            logoUrl = upload.data.url;
            console.log('Logo uploaded successfully via UTApi:', logoUrl);
            // Delete old logo if it exists
            if (oldSettings?.logoUrl) {
              const oldFileKey = oldSettings.logoUrl.split('/').pop();
              if (oldFileKey) {
                console.log('Deleting old logo file:', oldFileKey);
                await utapi.deleteFiles(oldFileKey);
              }
            }
          } else {
            console.error('Upload failed, no data returned:', upload);
            skipLogoUpdate = true;
            console.log('Skipping logo update due to upload failure');
          }
        }
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        skipLogoUpdate = true;
        console.log('Skipping logo update due to upload error');
        // Do not return an error here, continue without the logo
      }
    }
    // If no logo file and no removal, preserve existing logo
    else if (oldSettings?.logoUrl && !removeExistingLogo) {
      console.log('Preserving existing logo URL:', oldSettings.logoUrl);
      logoUrl = oldSettings.logoUrl;
    }

    // Update or create branding settings
    const settingsToSave = {
      primaryColor,
      secondaryColor,
      headerFont,
      headerFontSize,
      bodyFont,
      bodyFontSize,
      // If logo was explicitly removed, set to null
      // If we have a new logo URL, use it
      // Otherwise don't include logoUrl to keep existing value
      ...(logoRemoved ? { logoUrl: null } : logoUrl ? { logoUrl } : {})
    };

    console.log('Saving branding settings:', settingsToSave);
    
    try {
      const updatedSettings = await saveBrandingSettings(companyId, settingsToSave);
      console.log('Settings saved successfully:', updatedSettings);
      
      return NextResponse.json({ 
        success: true, 
        data: updatedSettings,
        logoUpdated: !skipLogoUpdate && !!logoFile,
        logoRemoved
      });
    } catch (saveError) {
      console.error('Error in saveBrandingSettings:', saveError);
      return NextResponse.json({ 
        error: 'Failed to save branding settings',
        details: saveError instanceof Error ? saveError.message : 'Unknown database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in branding settings POST handler:', error);
    return NextResponse.json({ 
      error: 'Failed to update branding settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get companyId for a user
async function getCompanyIdForUser(auth0Id: string): Promise<string | null> {
  if (process.env.NODE_ENV === 'development') {
    // For development, return a mock company ID
    return 'mock-company-id';
  }

  try {
    // In production, we would look up the user's company ID
    // For now, return a mock ID until the proper schema is in place
    console.log('Looking up company ID for user:', auth0Id);
    return 'actual-company-id';
  } catch (error) {
    console.error('Error fetching company ID:', error);
    return null;
  }
} 