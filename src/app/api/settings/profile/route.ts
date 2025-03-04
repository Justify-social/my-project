import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { utapi } from 'uploadthing/server';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      select: {
        firstName: true,
        surname: true,
        companyName: true,
        email: true,
        profilePictureUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

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

    let profilePictureUrl = null;
    if (profilePicture) {
      const upload = await utapi.uploadFiles(profilePicture);
      if (upload.data) {
        profilePictureUrl = upload.data.url;
        // Delete old picture if it exists
        const oldUser = await prisma.user.findUnique({
          where: { auth0Id: session.user.sub },
          select: { profilePictureUrl: true },
        });
        if (oldUser?.profilePictureUrl) {
          const oldFileKey = oldUser.profilePictureUrl.split('/').pop();
          if (oldFileKey) await utapi.deleteFiles(oldFileKey);
        }
      } else {
        return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 });
      }
    }

    const updatedUser = await prisma.user.upsert({
      where: { auth0Id: session.user.sub },
      update: {
        firstName,
        surname,
        companyName,
        ...(profilePictureUrl && { profilePictureUrl }),
      },
      create: {
        auth0Id: session.user.sub,
        email: session.user.email,
        firstName,
        surname,
        companyName,
        ...(profilePictureUrl && { profilePictureUrl }),
      },
      select: {
        firstName: true,
        surname: true,
        companyName: true,
        email: true,
        profilePictureUrl: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}