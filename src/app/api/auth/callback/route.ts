// src/app/api/auth/callback/route.ts
import { handleCallback } from "@auth0/nextjs-auth0";
import prisma from "../../../../lib/prisma";
import { getSession } from "../../../../lib/session";

export const GET = async (request: Request) => {
  try {
    // Pass the request so getSession can correctly read cookies.
    const session = await getSession(request);
    console.log("Callback session:", session);

    // If a session exists and contains a user email, upsert that user in your DB.
    if (session && session.user && session.user.email) {
      await prisma.user.upsert({
        where: { email: session.user.email },
        update: {},
        create: {
          email: session.user.email,
          role: "marketer", // or default role as needed
        },
      });
    }
    // Let Auth0 handle the rest of the callback.
    return await handleCallback(request);
  } catch (error) {
    console.error("Error in callback route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
