// src/app/api/auth/callback/route.ts
import { handleCallback } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId
      }
    })

    if (!user) {
      await prisma.user.create({
        data: {
          clerkId: userId,
          onboardingComplete: false
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in auth callback:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
