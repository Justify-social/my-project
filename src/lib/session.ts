// src/lib/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  // Temporarily return null until auth is fully set up
  return null;
}
