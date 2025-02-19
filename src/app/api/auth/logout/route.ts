// src/app/api/auth/logout/route.ts
export const GET = async (request: Request) => {
  try {
    // Define the logout URL for Auth0 with the federated logout flag and the return URL
    const logoutUrl = `https://dev-8r7jiixso74f3ef1.us.auth0.com/v2/logout?client_id=jDVtIPLaQlz4YGPYVEUqdAJFhKpLiIU4&returnTo=https://app.justify.social&federated=true`;
    
    // Redirect the user to Auth0's logout endpoint
    return Response.redirect(logoutUrl);
  } catch (error) {
    console.error('Error in logout route:', error);
    // Return an internal server error if there's an issue during the logout process
    return new Response('Internal Server Error', { status: 500 });
  }
};
