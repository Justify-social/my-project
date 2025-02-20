// src/app/api/auth/callback/route.ts
import { handleCallback } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      console.error('Auth callback: No userId found in request')
      return new NextResponse('Unauthorized: No user ID provided', { 
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          clerkId: userId
        }
      })

      if (!user) {
        console.log(`Creating new user record for Clerk ID: ${userId}`)
        await prisma.user.create({
          data: {
            clerkId: userId,
            onboardingComplete: false
          }
        })
        console.log(`Successfully created user record for Clerk ID: ${userId}`)
      } else {
        console.log(`Found existing user record for Clerk ID: ${userId}`)
      }

      return NextResponse.json({ 
        success: true,
        message: user ? 'Existing user found' : 'New user created',
        userId: userId
      })

    } catch (dbError) {
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', {
          code: dbError.code,
          message: dbError.message,
          meta: dbError.meta
        })
        return NextResponse.json({
          error: 'Database operation failed',
          code: dbError.code
        }, { status: 500 })
      }

      console.error('Unknown database error:', dbError)
      return NextResponse.json({
        error: 'Internal server error during database operation'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Critical error in auth callback:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
