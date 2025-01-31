// src/app/api/env-check/route.js
export async function GET(request) {
    return new Response(JSON.stringify({
      AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || "Not found"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }