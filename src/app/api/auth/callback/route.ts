// src/app/api/auth/callback/route.ts
import { handleCallback } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Handle the callback first
    const res = await handleCallback(req);
    
    // Then try to get the session
    try {
      const session = await getSession();
      
      if (session?.user) {
        await prisma.user.upsert({
          where: { email: session.user.email },
          update: {
            name: session.user.name,
            email: session.user.email,
            image: session.user.picture,
          },
          create: {
            name: session.user.name,
            email: session.user.email,
            image: session.user.picture,
          },
        });
      }
    } catch (sessionError) {
      console.error("Session error:", sessionError);
      // Continue even if session handling fails
    }
    
    return res;
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(`Callback error: ${error.message}`, { status: 500 });
  }
}
