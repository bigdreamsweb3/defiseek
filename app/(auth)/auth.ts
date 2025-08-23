// Civic Auth integration
import { getUser } from '@civic/auth/nextjs';
import { getUser as getDbUser, createUserWithCivicAuthId } from '@/db/queries';

// Export the getUser function for use in server components and actions
export { getUser };

// For compatibility with existing API routes, we'll create a mock auth function
// that returns user information in the expected format and syncs with database
export const auth = async () => {
  try {
    const user = await getUser();
    if (user) {
      // Check if user exists in our database by email
      const [existingUser] = await getDbUser(user.email || '');
      
      let dbUser = existingUser;
      
      if (!existingUser) {
        // User doesn't exist in database, create them with Civic Auth ID
        try {
          const newUsers = await createUserWithCivicAuthId(user.id, user.email || '');
          // Handle both array and single user return types
          if (Array.isArray(newUsers)) {
            dbUser = newUsers[0];
          } else {
            dbUser = newUsers;
          }
          console.log('Created new user in database for Civic Auth user:', user.email);
        } catch (error) {
          console.error('Failed to create user in database:', error);
          // Continue with the Civic Auth user even if database creation fails
        }
      }

      return {
        user: {
          id: dbUser?.id || user.id, // Use database ID if available, fallback to Civic Auth ID
          email: user.email,
          name: user.name,
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

// Legacy compatibility exports (can be removed if no longer needed)
export const handlers = { GET: undefined, POST: undefined } as any;
export const signIn = async () => {};
export const signOut = async () => {};
