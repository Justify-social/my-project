// /src/app/api/user/setOnboardingTrue/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { getSession } from "../../../../lib/session"; // Adjusted relative path

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the user's onboarding flag in the database.
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { hasSeenOnboarding: true },
    });

    // Return a JSON response without modifying the session cookie.
    return NextResponse.json({ updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating onboarding status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
