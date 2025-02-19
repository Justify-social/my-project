import { handleLogout } from '@auth0/nextjs-auth0';

export const GET = async (request: Request) => {
  try {
    return await handleLogout(request, { returnTo: 'https://app.justify.social/' });
  } catch (error) {
    console.error('Error in logout route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
