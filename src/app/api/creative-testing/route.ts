export async function GET() {
  return new Response(JSON.stringify({ message: "Creative Testing API" }), {
    headers: { 'Content-Type': 'application/json' },
  })
} 