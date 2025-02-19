import { getSession } from '@auth0/nextjs-auth0';

export const GET = async (request: Request) => {
  try {
    const session = await getSession(request);
    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
