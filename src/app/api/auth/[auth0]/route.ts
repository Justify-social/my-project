import { handleAuth } from '@auth0/nextjs-auth0';

// The Auth0 library handleAuth function is designed to be exported directly.
// It internally handles the different routes like /login, /callback, /logout, etc.,
// based on the [auth0] dynamic segment in the route.
export const GET = handleAuth();

// POST is typically handled internally by handleAuth for callbacks, etc.
// If specific POST handling were needed separate from Auth0's flow, it would go here.
// export async function POST(req: NextRequest, { params }: { params: { auth0: string } }) {
//   ...
// }