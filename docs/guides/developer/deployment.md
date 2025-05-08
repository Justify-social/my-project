# Deployment Guide

**Last Reviewed:** 2025-05-09
**Status:** Active (Needs Review for current process)

## 1. Overview

This guide covers the deployment process for the Justify platform, focusing on our hosting provider (Vercel), the different deployment environments, and common troubleshooting steps.

## 2. Deployment Environments

We utilize several environments hosted on Vercel:

| Environment          | URL                              | Source Branch  | Auto-Deploy | Purpose                                             |
| -------------------- | -------------------------------- | -------------- | ----------- | --------------------------------------------------- |
| **Production**       | `https://justify.social`         | `main`         | Yes         | Live application for end-users.                     |
| **Staging**          | `https://staging.justify.social` | `staging` ?    | Yes         | Pre-production testing, mirrors production.         |
| **Development**      | `https://dev.justify.social`     | `develop` ?    | Yes         | Shared development/integration testing.             |
| **Preview (Branch)** | `[unique-url].vercel.app`        | Feature Branch | Yes         | Isolated testing/review of specific features (PRs). |

_(Note: Verify the exact branch names used for Staging and Development environments with the team lead/CI configuration.)_

## 3. Deployment Process (Automated via Vercel & GitHub Actions)

Our deployment process is largely automated:

1.  **Code Merge**: Changes are merged into the relevant deployment branch (`main`, `staging`, `develop`) via Pull Requests.
2.  **GitHub Actions Trigger (Optional)**: Merges may trigger GitHub Actions workflows (`.github/workflows/deploy.yml`) that run tests, linting, and potentially other checks before initiating deployment.
3.  **Vercel Build & Deploy**: Vercel automatically detects pushes to the connected branches and triggers a new build and deployment.
    - It installs dependencies (`npm ci`).
    - It runs the build command (`npm run build`).
    - It deploys the build artifacts to its global Edge network.
4.  **Verification**: After deployment, automated checks might run (e.g., smoke tests via GitHub Actions), and manual verification should be performed on the relevant environment URL.

## 4. Vercel Configuration

Key configurations are managed through:

- **`next.config.js`**: Contains Next.js specific build configurations like `output: 'standalone'`. (May point to `config/platform/next/index.mjs`).
- **`vercel.json` (Root or `/config/vercel/`)**: Defines Vercel-specific settings (build commands, framework detection - though often inferred).
- **Vercel Project Settings (Dashboard)**: Environment variables, connected Git repository, build settings overrides.

## 5. Important Considerations for Deployment

- **Server vs. Client Components**: Correct usage of React Server Components and Client Components (`'use client'`) is critical for successful builds and optimal performance on Vercel.
- **Environment Variables**: Ensure all necessary environment variables (`DATABASE_URL`, Clerk Keys, Stripe Keys, etc.) are correctly configured in the Vercel project settings for each environment (Production, Staging, Development, Preview). **Never commit `.env.local` files.**
- **Build Errors**: Common build errors often relate to:
  - Type errors (run `npm run type-check` locally).
  - Incorrect Server/Client component usage.
  - Missing environment variables during build time.
  - Configuration issues in `next.config.js`.
- **Database Migrations**: Migrations (`prisma migrate deploy`) need to be applied to the corresponding database environment _before_ the application code relying on schema changes is deployed. This is often handled as a separate step in a CI/CD pipeline or manually before promoting a build.

## 6. Deployment Checklist (Manual Checks)

Before promoting changes (especially to Production):

- [ ] All automated tests (unit, integration, E2E) passed in CI.
- [ ] Changes successfully deployed and verified on Staging environment.
- [ ] Relevant database migrations have been applied to the target environment.
- [ ] Environment variables in Vercel dashboard for the target environment are correct.
- [ ] Perform manual smoke tests on critical user flows after deployment.

## 7. Troubleshooting Deployments

- **Build Failures**: Check the Vercel deployment logs for detailed error messages. Common issues include type errors, config errors, or memory limits.
- **Runtime Errors (Post-Deployment)**: Check Vercel Function logs. Verify environment variables are set correctly in Vercel. Check for issues related to Server/Client component boundaries or database connectivity.
- **API Errors**: Inspect function logs for API routes. Ensure error handling within API routes is robust.

Consult the **[Troubleshooting Guide](./troubleshooting.md)** for more general development issues.
