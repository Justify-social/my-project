// src/app/api/auth/logout/route.ts
import { handleLogout } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return await handleLogout(req);
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(`Logout error: ${error.message}`, { status: 500 });
  }
}
