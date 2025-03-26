import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { auth0 } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

/**
 * POST /api/user/profile-picture
 * Uploads or updates a user's profile picture
 */
export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const formData = await request.formData();
    const imageFile = formData.get('imageFile') as File | null;
    const removeExisting = formData.get('removeExisting') === 'true';
    
    // Get the user to check for existing profile picture
    const user = await prisma.user.findUnique({
      where: { id: session.user.sub },
      select: { profilePictureUrl: true }
    });
    
    // Handle profile picture removal
    if (removeExisting) {
      // For development mode, just update the database
      if (process.env.NODE_ENV === 'development') {
        await prisma.user.update({
          where: { id: session.user.sub },
          data: { profilePictureUrl: null }
        });
        
        return NextResponse.json({ 
          success: true, 
          data: { profilePictureUrl: null }
        });
      }
      
      // In production, try to delete the existing file
      if (user?.profilePictureUrl) {
        try {
          const fileKey = user.profilePictureUrl.split('/').pop();
          if (fileKey) {
            await utapi.deleteFiles(fileKey);
          }
        } catch (deleteError) {
          console.error('Error deleting profile picture:', deleteError);
          // Continue even if deletion fails
        }
      }
      
      // Update Auth0 user
      try {
        const { token } = await auth0.getAccessToken();
        
        await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session.user.sub}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            picture: null
          })
        });
      } catch (authError) {
        console.error('Error updating Auth0 profile picture:', authError);
        // Continue even if Auth0 update fails
      }
      
      // Update database user
      await prisma.user.update({
        where: { id: session.user.sub },
        data: { profilePictureUrl: null }
      });
      
      return NextResponse.json({ 
        success: true, 
        data: { profilePictureUrl: null }
      });
    }
    
    // Handle new profile picture upload
    if (!imageFile) {
      return NextResponse.json({ 
        error: 'No image file provided' 
      }, { status: 400 });
    }
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(imageFile.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and GIF are supported.' 
      }, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size exceeds 5MB limit' 
      }, { status: 400 });
    }
    
    // For development mode, just return a mock URL
    if (process.env.NODE_ENV === 'development') {
      const mockUrl = 'https://example.com/profile-pictures/mock-image.jpg';
      
      await prisma.user.update({
        where: { id: session.user.sub },
        data: { profilePictureUrl: mockUrl }
      });
      
      return NextResponse.json({ 
        success: true, 
        data: { profilePictureUrl: mockUrl }
      });
    }
    
    // Upload the image using UploadThing
    let uploadedUrl;
    try {
      const uploadResult = await utapi.uploadFiles(imageFile);
      
      if (!uploadResult.data?.url) {
        throw new Error('File upload failed');
      }
      
      uploadedUrl = uploadResult.data.url;
      
      // Delete existing profile picture if it exists
      if (user?.profilePictureUrl) {
        try {
          const fileKey = user.profilePictureUrl.split('/').pop();
          if (fileKey) {
            await utapi.deleteFiles(fileKey);
          }
        } catch (deleteError) {
          console.error('Error deleting existing profile picture:', deleteError);
          // Continue even if deletion fails
        }
      }
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload image file' 
      }, { status: 500 });
    }
    
    // Update Auth0 user picture
    try {
      const { token } = await auth0.getAccessToken();
      
      await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session.user.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          picture: uploadedUrl
        })
      });
    } catch (authError) {
      console.error('Error updating Auth0 profile picture:', authError);
      // Continue even if Auth0 update fails
    }
    
    // Update database user
    await prisma.user.update({
      where: { id: session.user.sub },
      data: { profilePictureUrl: uploadedUrl }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: { profilePictureUrl: uploadedUrl }
    });
  } catch (error) {
    console.error('Error handling profile picture:', error);
    return NextResponse.json({ 
      error: 'Failed to process profile picture' 
    }, { status: 500 });
  }
} 