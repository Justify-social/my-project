// src/lib/session.ts
import { cookies } from "next/headers";

export async function getSession(request?: Request): Promise<any | null> {
  // Await cookies() so that we can use get()
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appSession.0");
  console.log("Session cookie in getSession:", sessionCookie);

  // For testing, if the session cookie exists, return a dummy session object.
  if (sessionCookie) {
    return {
      user: {
        email: "admin@example.com",
        name: "Test User",
        role: "admin",
      },
    };
  }

  // Otherwise return null.
  return null;
}
