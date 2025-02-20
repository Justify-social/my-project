// src/app/api/auth/callback/route.ts
import { handleCallback } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { createErrorResponse, APIError } from '@/lib/error-logging'

export async function GET() {
  try {
    const { userId } = getAuth()
    
    if (!userId) {
      throw new APIError('Unauthorized: No user ID provided', 401)
    }

    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId }
      })

      if (!user) {
        console.log(`Creating new user record for Clerk ID: ${userId}`)
        await prisma.user.create({
          data: {
            clerkId: userId,
            onboardingComplete: false
          }
        })
      }

      return Response.json({ 
        success: true,
        message: user ? 'Existing user found' : 'New user created',
        userId 
      })

    } catch (error) {
      return createErrorResponse(error, {
        userId,
        route: '/api/auth/callback',
        additionalData: { operation: 'user_creation' }
      })
    }

  } catch (error) {
    return createErrorResponse(error, {
      route: '/api/auth/callback'
    })
  }
}
