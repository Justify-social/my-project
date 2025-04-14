# Deployment Guide

**Last Updated:** 2025-03-07  
**Status:** Active

## Overview

This guide covers deployment processes for Justify.social, focusing on Vercel deployment configuration and common troubleshooting steps.

## Deployment Environments

| Environment | URL                            | Branch  | Auto-Deploy |
| ----------- | ------------------------------ | ------- | ----------- |
| Production  | https://justify.social         | main    | Yes         |
| Staging     | https://staging.justify.social | staging | Yes         |
| Development | https://dev.justify.social     | develop | Yes         |

## Deployment Process

1. Merge code to the appropriate branch
2. Vercel automatically builds and deploys
3. Verify deployment in the Vercel dashboard
4. Run smoke tests on deployed environment

## Vercel Configuration

The application uses these key Vercel settings:

```js
// next.config.js
module.exports = {
  output: 'standalone',
  experimental: {
    appDir: true,
    excludeDefaultMomentLocales: true,
  },
};
```

## Server vs Client Components

When deploying to Vercel, proper separation of server and client components is critical:

- **Server Components**: Use the `.server.tsx` extension for server components
- **Client Components**: Use the `"use client"` directive at the top of the file
- **Layout Components**: Use for setting page-wide server directives like `dynamic` and `revalidate`

## Preventing Common Build Errors

### Invalid Revalidate Value Error

**Problem**: Build fails with error about invalid revalidate values on client components.

**Solution**:

1. Move `dynamic` and `revalidate` directives to layout components:

   ```tsx
   // campaigns/layout.tsx
   export const dynamic = 'force-dynamic';
   export const revalidate = 0;
   ```

2. Create proper component separation:

   ```
   /campaigns
     ├── layout.tsx        (server component with directives)
     ├── page.tsx          (client component)
     └── ServerCampaigns.tsx (server data fetching)
   ```

3. Ensure Next.js config has proper output settings:
   ```js
   output: 'standalone';
   ```

## Environment Variables

Ensure these environment variables are configured in Vercel:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

## Deployment Checklist

- [ ] All tests pass locally
- [ ] Environment variables are configured
- [ ] Build completes successfully
- [ ] Initial page load works
- [ ] Authentication flows work
- [ ] Critical user journeys function

## Troubleshooting

- **Build fails**: Check server/client component separation
- **Runtime errors**: Verify environment variables
- **API errors**: Confirm API routes use proper error handling
