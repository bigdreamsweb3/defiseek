# Authentication System

This application uses Civic Auth for secure authentication. The system automatically handles redirects and preserves user's intended destination.

## How It Works

### 1. Automatic Redirects
- **Unauthenticated users** trying to access protected routes are automatically redirected to `/login`
- **Authenticated users** trying to access auth pages are automatically redirected to `/chat`
- The system preserves the user's intended destination and redirects them back after successful authentication

### 2. Protected Routes
All routes except the following are protected by default:
- `/login` - Login page
- `/api/*` - API routes
- `/_next/*` - Next.js internal files
- Static assets (images, favicon, etc.)

### 3. Authentication Flow
1. User tries to access a protected route
2. If not authenticated, redirected to `/login` with current URL stored
3. After successful authentication, user is redirected back to their intended destination
4. If no specific destination, user goes to `/chat` (main app)

## Usage

### For Protected Components
Use the `RequireAuth` component to wrap protected content:

```tsx
import { RequireAuth } from '@/components/auth/require-auth';

export default function ProtectedPage() {
  return (
    <RequireAuth>
      <div>This content is only visible to authenticated users</div>
    </RequireAuth>
  );
}
```

### For Custom Authentication Logic
Use the `useAuthRedirect` hook:

```tsx
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

export default function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuthRedirect();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // Will redirect automatically
  
  return <div>Welcome, {user?.email}!</div>;
}
```

### For Server Components
Use the `getUser()` function:

```tsx
import { getUser } from '@civic/auth/nextjs';
import { redirect } from 'next/navigation';

export default async function ServerComponent() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Hello, {user.email}!</div>;
}
```

## Components

### RequireAuth
A wrapper component that automatically redirects unauthenticated users to login.

**Props:**
- `children`: The content to render for authenticated users
- `fallback`: Optional fallback content to show while redirecting

### useAuthRedirect Hook
A custom hook that handles authentication checks and redirects.

**Returns:**
- `user`: The authenticated user object
- `isLoading`: Whether authentication is being checked
- `isAuthenticated`: Boolean indicating if user is authenticated

## Middleware Configuration

The middleware automatically:
- Protects all routes except auth pages and static assets
- Redirects unauthenticated users to login
- Redirects authenticated users away from auth pages

## Cookie Management

The system uses cookies to store redirect destinations:
- `redirectTo`: Stores the intended destination URL
- Automatically cleared after successful redirect
- 5-minute expiration for security
