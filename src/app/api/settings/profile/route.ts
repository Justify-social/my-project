import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * GET /api/settings/profile
 * Retrieves the user profile from the database
 */
export async function GET() {
  const session = await getSession();
  console.log('Session in profile API:', session);
  
  if (!session?.user?.sub) {
    console.warn('No authenticated user found in session');
    // For development, return mock profile data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        data: {
          firstName: 'Development',
          surname: 'User',
          email: 'dev@example.com',
          companyName: 'Example Company',
          profilePictureUrl: null
        }
      });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Find user by Auth0 ID
    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      select: {
        firstName: true,
        surname: true,
        email: true,
        companyName: true,
        profilePictureUrl: true
      }
    });

    // If user not found in database, return minimal data
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          firstName: '',
          surname: '',
          email: session.user.email || '',
          companyName: '',
          profilePictureUrl: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
}

/**
 * POST /api/settings/profile
 * Updates the user profile in the database
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const firstName = formData.get('firstName') as string;
    const surname = formData.get('surname') as string;
    const companyName = formData.get('companyName') as string;
    const profilePicture = formData.get('profilePicture') as File | null;

    // Validate input
    if (!firstName || !surname) {
      return NextResponse.json({ error: 'First name and surname are required' }, { status: 400 });
    }

    let profilePictureUrl = undefined;
    
    // Handle profile picture upload (using a hypothetical file upload service)
    if (profilePicture) {
      try {
        // This is a placeholder - in a real implementation, you would:
        // 1. Upload the file to a storage service (S3, Azure Blob, etc.)
        // 2. Get back a URL for the uploaded file
        // 3. Store that URL in the database
        
        // For development, we'll skip the actual upload
        if (process.env.NODE_ENV === 'development') {
          profilePictureUrl = 'https://example.com/placeholder-profile-image.jpg';
          console.log('Development mode: Mock file upload for profile picture');
        } else {
          // In production, implement real file upload logic
          // For example, using AWS S3:
          /*
          const upload = await s3Client.upload({
            Bucket: 'your-bucket-name',
            Key: `profile-pictures/${session.user.sub}/${Date.now()}-${profilePicture.name}`,
            Body: Buffer.from(await profilePicture.arrayBuffer()),
            ContentType: profilePicture.type
          }).promise();
          
          profilePictureUrl = upload.Location;
          */
        }
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 });
      }
    }

    // Update or create user in database
    const user = await prisma.user.upsert({
      where: { auth0Id: session.user.sub },
      update: {
        firstName,
        surname,
        companyName,
        ...(profilePictureUrl && { profilePictureUrl })
      },
      create: {
        auth0Id: session.user.sub,
        email: session.user.email || '',
        firstName,
        surname,
        companyName,
        ...(profilePictureUrl && { profilePictureUrl })
      },
      select: {
        firstName: true,
        surname: true,
        email: true,
        companyName: true,
        profilePictureUrl: true
      }
    });

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}