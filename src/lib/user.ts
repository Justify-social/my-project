import { prisma } from './prisma';
import { getSession } from './session';

/**
 * Get or create a user for the current session
 * This ensures we always have a user record for authenticated users
 */
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    return null;
  }
  
  try {
    // Find existing user
    let user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub }
    });
    
    // Create user if not found
    if (!user) {
      user = await prisma.user.create({
        data: {
          auth0Id: session.user.sub,
          email: session.user.email || 'unknown@example.com',
          firstName: session.user.name ? session.user.name.split(' ')[0] : undefined,
          surname: session.user.name ? session.user.name.split(' ').slice(1).join(' ') : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('Created new user record:', user.id);
    }
    
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    
    // In development, return a mock user
    if (process.env.NODE_ENV === 'development') {
      return {
        id: 'mock-user-id',
        auth0Id: session.user.sub,
        email: session.user.email || 'dev@example.com',
        firstName: 'Development',
        surname: 'User',
        role: 'USER'
      };
    }
    
    return null;
  }
} 