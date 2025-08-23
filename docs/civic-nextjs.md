# Next.JS

<Info>
  **Prefer AI-assisted setup?** Use our [AI prompts for Next.js](/ai-prompts/nextjs) to automatically integrate Civic Auth using Claude, ChatGPT, or other AI assistants. Includes a step-by-step video tutorial!
</Info>

## Quick Start

Integrate Civic Auth into your Next.js application using the following steps (a working example is available in our [github examples repo](https://github.com/civicteam/civic-auth-examples/tree/main/packages/civic-auth/nextjs)):

<Note>
  **Important**: Make sure your application is using Next.js version ^14.2.25 or ^15.2.3 (or higher). Earlier versions are affected by a security vulnerability ([CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927)) that may allow middleware to be bypassed.
</Note>

<Info>
  This guide assumes you are using Typescript. Please adjust the snippets as needed to remove the types if you are using plain JS.
</Info>

<Info>
  If you plan to use Web3 features, select "Auth + Web3" from the tabs below.
</Info>

### 1. Add the Civic Auth Plugin

This is where you give your app the Client ID provided when you sign up at [auth.civic.com](https://auth.civic.com).

The defaults should work out of the box for most customers, but if you want to configure your app, see [below](/integration/nextjs#advanced-configuration) for details.

<Tabs>
  <Tab title="Auth">
    ```ts next.config.ts
    import { createCivicAuthPlugin } from "@civic/auth/nextjs"
    import type { NextConfig } from "next";

    const nextConfig: NextConfig = {
      /* config options here */
    };

    const withCivicAuth = createCivicAuthPlugin({
      clientId: "YOUR CLIENT ID"
    });

    export default withCivicAuth(nextConfig)
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts next.config.ts
    import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"
    import type { NextConfig } from "next";

    const nextConfig: NextConfig = {
      /* config options here */
    };

    const withCivicAuth = createCivicAuthPlugin({
      clientId: "YOUR CLIENT ID"
    });

    export default withCivicAuth(nextConfig)
    ```
  </Tab>
</Tabs>

<Info>
  Typescript support in configuration files was introduced in [Next 15](https://nextjs.org/docs/pages/api-reference/config/typescript#version-changes).

  If your config file is a JS file (`next.config.mjs`), make sure to change the extension to `.ts`, or remove the type information.
</Info>

### 2. Create the Civic Auth API Route

This is where your app will handle login and logout requests.

Create this file at the following path:

`src/app/api/auth/[...civicauth]/route.ts`

<Tabs>
  <Tab title="Auth">
    ```ts route.ts
    import { handler } from "@civic/auth/nextjs"

    export const GET = handler()
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts route.ts
    import { handler } from "@civic/auth-web3/nextjs"

    export const GET = handler()
    ```
  </Tab>
</Tabs>

<Info>
  These steps apply to the [App Router](https://nextjs.org/docs/app). If you are using the Pages Router, please contact Civic in [our developer community](https://join.slack.com/t/civic-developers/shared_invite/zt-37tv9fyo7-aDT43mUjOFQwdQFmfZLTRw) for integration steps.
</Info>

### 3. Middleware

Middleware is used to protect your backend routes, server components and server actions from unauthenticated requests.

Using the Civic Auth middleware ensures that only logged-in users have access to secure parts of your service.

<Tabs>
  <Tab title="Auth">
    ```ts src/middleware.ts
    import { authMiddleware } from "@civic/auth/nextjs/middleware"

    export default authMiddleware();

    export const config = {
      // include the paths you wish to secure here
      matcher: [
        /*
        * Match all request paths except:
        * - _next directory (Next.js static files)
        * - favicon.ico, sitemap.xml, robots.txt
        * - image files
        */
        '/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)',
      ],
    }
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts src/middleware.ts
    import { authMiddleware } from "@civic/auth-web3/nextjs/middleware"

    export default authMiddleware();

    export const config = {
      // include the paths you wish to secure here
      matcher: [
        /*
        * Match all request paths except:
        * - _next directory (Next.js static files)
        * - favicon.ico, sitemap.xml, robots.txt
        * - image files
        */
        '/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)',
      ],
    }
    ```
  </Tab>
</Tabs>

#### Middleware Chaining

If you are already using middleware in your Next.js app, then you can chain them with Civic Auth as follows:

<Tabs>
  <Tab title="Auth">
    ```ts src/middleware.ts
    import { auth } from "@civic/auth/nextjs"
    import { NextRequest, NextResponse } from "next/server";

    const withCivicAuth = auth();

    const otherMiddleware = (request: NextRequest) => {
        console.log("my middleware");
        return NextResponse.next();
    }

    export default withCivicAuth(otherMiddleware);
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts src/middleware.ts
    import { auth } from "@civic/auth-web3/nextjs"
    import { NextRequest, NextResponse } from "next/server";

    const withCivicAuth = auth();

    const otherMiddleware = (request: NextRequest) => {
        console.log("my middleware");
        return NextResponse.next();
    }

    export default withCivicAuth(otherMiddleware);
    ```
  </Tab>
</Tabs>

### 4. Frontend Integration

Add the Civic Auth context to your app to give your frontend access to the logged-in user.

<CodeGroup>
  ```js Auth
  import { CivicAuthProvider } from "@civic/auth/nextjs";

  function Layout({ children }) {
    return (
    // ... the rest of your app layout
    <CivicAuthProvider>
      {children}
    </CivicAuthProvider>
    )
  }
  ```

  ```js Auth + Web3
  import { CivicAuthProvider } from "@civic/auth-web3/nextjs";

  function Layout({ children }) {
  return (
      // ... the rest of your app layout
      <CivicAuthProvider>
          {children}
      </CivicAuthProvider>
  )
  }
  ```
</CodeGroup>

<Info>
  Unlike the pure [React](/integration/react) integration, you do *not* have to add your client ID again here!

  Make sure to create the [Civic Auth API route](/integration/nextjs#2-create-the-civic-auth-api-route), as it serves the essential PKCE code challenge.
</Info>

## Usage

### Getting User Information on the Frontend

The Next.js integration can use all the components described in the [React integration page](/integration/react), such as the `UserButton` , for showing a Sign-In button and displaying the username:

<Tabs>
  <Tab title="Auth">
    ```ts TitleBar.ts
    import { UserButton } from "@civic/auth/react";

    export function TitleBar() {
      return (
        <div>
          <h1>My App</h1>
          <UserButton />
        </div>
      );
    };
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts TitleBar.ts
    import { UserButton } from "@civic/auth-web3/react";

    export function TitleBar() {
      return (
        <div>
          <h1>My App</h1>
          <UserButton />
        </div>
      );
    };
    ```
  </Tab>
</Tabs>

or if you need to rollout your own button:

```ts TitleBar.ts
export function TitleBar() {
    const doSignIn = useCallback(() => {
      console.log("Starting sign-in process");
      signIn()
        .then(() => {
          console.log("Sign-in completed successfully");
        })
        .catch((error) => {
          console.error("Sign-in failed:", error);
        });
    }, [signIn]);

    return (
      <div>
        <h1>My App</h1>
        <button onClick={doSignIn}>
          Sign in
        </button>
      </div>
    );
}
```

or the useUser hook, for retrieving information about the user in code:

<Tabs>
  <Tab title="Auth">
    ```ts MyComponent.ts
    import { useUser } from "@civic/auth/react";

    export function MyComponent() {
      const { user } = useUser();

      if (!user) return <div>User not logged in</div>

      return <div>Hello { user.name }!</div>
    }
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts MyComponent.ts
    import { useUser } from "@civic/auth-web3/react";

    export function MyComponent() {
      const { user } = useUser();

      if (!user) return <div>User not logged in</div>

      return <div>Hello { user.name }!</div>
    }
    ```
  </Tab>
</Tabs>

See the [React Usage page](/integration/react) for more details.

### Getting User Information on the Backend

Retrieve user information on backend code, such as in React Server Components, React Server Actions, or api routes using `getUser`:

<Tabs>
  <Tab title="Auth">
    ```ts
    import { getUser } from "@civic/auth/nextjs";

    const user = await getUser();
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts
    import { getUser } from "@civic/auth-web3/nextjs";

    const user = await getUser();
    ```
  </Tab>
</Tabs>

For example, in a Next.js Server Component:

<Tabs>
  <Tab title="Auth">
    ```ts
    import { getUser } from "@civic/auth/nextjs";

    export async function MyServerComponent() {
      const user = await getUser();

      if (!user) return <div>User not logged in</div>

      return <div>Hello { user.name }!</div>
    }
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts
    import { getUser } from "@civic/auth-web3/nextjs";

    export async function MyServerComponent() {
      const user = await getUser();

      if (!user) return <div>User not logged in</div>

      return <div>Hello { user.name }!</div>
    }
    ```
  </Tab>
</Tabs>

<Info>
  The `name` property is used as an example here, check out the [React Usage page](/integration/react) to see the entire basic user object structure.
</Info>

## Advanced Configuration

Civic Auth is a "low-code" solution, so most of the configuration takes place via the [dashboard](https://auth.civic.com). Changes you make there will be updated automatically in your integration without any code changes. The only required parameter you need to provide is the client ID.

The integration also offers the ability customize the library according to the needs of your Next.js app. For example, to restrict authentication checks to specific pages and routes in your app. You can do so inside `next.config.js` as follows:

<Tabs>
  <Tab title="Auth">
    ```ts next.config.ts
    import { createCivicAuthPlugin } from "@civic/auth/nextjs"

    const withCivicAuth = createCivicAuthPlugin({
      clientId: "YOUR CLIENT ID",
      ... // other config
    });

    export default withCivicAuth(nextConfig) // your next config here
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts next.config.ts
    import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"

    const withCivicAuth = createCivicAuthPlugin({
      clientId: "YOUR CLIENT ID",
      ... // other config
    });

    export default withCivicAuth(nextConfig) // your next config here
    ```
  </Tab>
</Tabs>

| Field             | Required | Default              | Example                                | Description                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | -------- | -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientId`        | Yes      | -                    | `2cc5633d-2c92-48da-86aa-449634f274b9` | The key obtained on signup to [auth.civic.com](https://auth.civic.com/)                                                                                                                                                                                                                                                                     |
| `loginSuccessUrl` | No       | -                    | `/myCustomSuccessEndpoint`             | In a NextJS app, we will redirect your user to this page once the login is finished. If not set, users will be sent back to the root of your app.                                                                                                                                                                                           |
| `callbackUrl`     | No       | `/api/auth/callback` | `/api/myroute/callback`                | If you cannot host Civic’s SDK handlers in the default location, you can specify a custom callback route here. This is where you must attach Civic’s GET handler as described [here](/integration/nextjs#2-create-the-civic-auth-api-route), so Civic can complete the OAuth token exchange. Use `loginSuccessUrl` to redirect after login. |
| `loginUrl`        | No       | `/`                  | `/admin`                               | The path your user will be sent to if they access a resource that needs them to be logged in. If you have a dedicated login page, you can set it here.                                                                                                                                                                                      |
| `logoutUrl`       | No       | `/`                  | `/goodbye`                             | The path your user will be sent to after a successful log-out.                                                                                                                                                                                                                                                                              |
| `include`         | No       | `["/*"]`             | `["/admin/*", "/api/admin/*"]`         | An array of path [globs](https://man7.org/linux/man-pages/man7/glob.7.html) that require a user to be logged-in to access. If not set, will include all paths matched by your Next.js [middleware](/integration/nextjs#3-middleware).                                                                                                       |
| `exclude`         | No       | -                    | `["public/home"]`                      | An array of path [globs](https://man7.org/linux/man-pages/man7/glob.7.html) that are excluded from Civic Auth [middleware](/integration/nextjs#3-middleware). In some cases, it might be easier and safer to specify exceptions rather than keep an inclusion list up to date.                                                              |
| `basePath`        | No       | `/`                  | `/my-app`                              | Allows applications to be served from custom subpaths instead of the root domain. This enables seamless authentication integration when deploying your Next.js application within subdirectories, ensuring all auth-related routes and assets maintain proper functionality regardless of the URL structure.                                |
| `baseUrl`         | No       | -                    | `https://myapp.com`                    | The public-facing base URL for your application. Required when deploying behind reverse proxies (Cloudfront + Vercel, AWS ALB, nginx, etc.) to ensure authentication redirects use the correct public domain instead of internal origins.                                                                                                   |

### Deploying Behind Reverse Proxies

When deploying your Next.js application behind reverse proxies (such as Cloudfront + Vercel, AWS Application Load Balancer, or nginx), you may encounter authentication issues where redirects fail because the middleware detects internal origins instead of your public domain.

**Common symptoms:**

* Authentication works locally but fails in production
* Users cannot log in after deployment
* Redirect loops during the authentication process
* Error messages about invalid redirect URLs

**Solution:**
Set the `baseUrl` parameter in your Next.js configuration to specify your public-facing domain:

<Tabs>
  <Tab title="Auth">
    ```ts next.config.ts
    import { createCivicAuthPlugin } from "@civic/auth/nextjs"

    const withCivicAuth = createCivicAuthPlugin({
      clientId: "YOUR CLIENT ID",
      baseUrl: "https://myapp.com" // Your public domain
    });

    export default withCivicAuth(nextConfig)
    ```
  </Tab>

  <Tab title="Auth + Web3">
    ```ts next.config.ts
    import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"

    const withCivicAuth = createCivicAuthPlugin({
      clientId: "YOUR CLIENT ID",
      baseUrl: "https://myapp.com" // Your public domain
    });

    export default withCivicAuth(nextConfig)
    ```
  </Tab>
</Tabs>

<Info>
  The `baseUrl` parameter is only needed for reverse proxy deployments. Standard deployments (like direct Vercel hosting) work without this configuration.
</Info>
