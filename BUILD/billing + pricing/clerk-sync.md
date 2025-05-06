# Clerk User Synchronization Plan\n\n## Goal\nEnsure users authenticated via Clerk have corresponding records in the application's Prisma database (`User` table), kept in sync via Clerk Webhooks.\n\n## Prerequisites\n*   Clerk account and application setup.\n*   Prisma schema with a `User` model containing at least `id` (matching Clerk User ID) and `email`.\n*   `@clerk/nextjs` package installed and configured.\n\n## Epics\n*   **EPIC-CLERK-SYNC-1: Backend Webhook Handler**\n*   **EPIC-CLERK-SYNC-2: Configuration & Testing**\n\n## Stories / Tasks\n\n---\n\n**ID:** CLERK-BE-1\n**Type:** Task\n**Epic:** EPIC-CLERK-SYNC-1\n**Title:** Install `svix` Package\n**Description:** Install the `svix` library, which Clerk uses for webhook signature verification.\n**Status:** Implemented\n**Acceptance Criteria:**\n    *   `svix` package added to dependencies in `package.json`.\n    *   `npm install` completes successfully.\n\n---\n\n**ID:** CLERK-BE-2\n**Type:** Task\n**Epic:** EPIC-CLERK-SYNC-1\n**Title:** Create Clerk Webhook API Route Structure\n**Description:** Create the directory structure and basic route handler file for receiving Clerk webhooks (`/app/api/webhooks/clerk/route.ts`). Include initial logging and TODO comments for next steps.
**Status:** Implemented
**Acceptance Criteria:**
    *   File `src/app/api/webhooks/clerk/route.ts` exists.
    *   Basic `POST` handler function is defined.
    *   Returns a basic 200 OK response.
\n\n---\n\n**ID:** CLERK-BE-3\n**Type:** Task\n**Epic:** EPIC-CLERK-SYNC-1\n**Title:** Implement Clerk Webhook Signature Verification\n**Description:** In the Clerk webhook handler (`/api/webhooks/clerk/route.ts`), implement signature verification using the `svix` library, reading headers directly from `request.headers`, reading the raw body using `request.text()`, and using the `CLERK_WEBHOOK_SECRET` env var. Reject unverified requests.
**Dependencies:** CLERK-BE-1, CLERK-BE-2, CLERK-INFRA-1 (for secret)
**Status:** Implemented
**Acceptance Criteria:**
    *   Handler reads required `svix` headers from `request.headers`.
    *   Handler reads raw request body using `request.text()`.
    *   Uses `Webhook` from `svix` and `CLERK_WEBHOOK_SECRET` to verify the payload.
    *   Returns `400` if verification fails or headers/secret are missing.
    *   Only verified events proceed.
\n\n---\n\n**ID:** CLERK-BE-4\n**Type:** Task\n**Epic:** EPIC-CLERK-SYNC-1\n**Title:** Implement `user.created` Event Handler (using Upsert)\n**Description:** Within the verified webhook handler, add logic for the `user.created` event type. Extract necessary user data. Use `prisma.user.upsert` (where clause on `clerkId`) to create the user record if it doesn't exist or update it if it already does (handles retries/duplicates).
**Dependencies:** CLERK-BE-3, Prisma Client Setup
**Status:** Implemented
**Acceptance Criteria:**
    *   Handler correctly identifies `user.created` events.
    *   Extracts required user fields from `event.data`.
    *   Calls `prisma.user.upsert` with mapped data, using `clerkId` in the `where` clause.
    *   Handles potential database errors gracefully.
\n\n---\n\n**ID:** CLERK-BE-5\n**Type:** Task\n**Epic:** EPIC-CLERK-SYNC-1\n**Title:** Implement `user.updated` Event Handler\n**Description:** Within the verified webhook handler, add logic for the `user.updated` event type. Extract user data. Use `prisma.user.update` (finding the user by Clerk User ID) to update the corresponding record in the application database.\n**Dependencies:** CLERK-BE-3, Prisma Client Setup
**Status:** Implemented
**Acceptance Criteria:**
    *   Handler correctly identifies `user.updated` events.
    *   Extracts required user fields from `event.data`.
    *   Calls `prisma.user.update` targeting the correct user via Clerk ID.
    *   Handles potential database errors.
\n\n**ID:** CLERK-BE-6\n**Type:** Task\n**Epic:** EPIC-CLERK-SYNC-1\n**Title:** Implement `user.deleted` Event Handler\n**Description:** Within the verified webhook handler, add logic for the `user.deleted` event type. Extract the Clerk User ID. Use `prisma.user.deleteMany` (which gracefully handles non-existent records) to remove the corresponding user record based on `clerkId`.
**Dependencies:** CLERK-BE-3, Prisma Client Setup
**Status:** Implemented
**Acceptance Criteria:**
    *   Handler correctly identifies `user.deleted` events.
    *   Extracts the user ID from `event.data`.
    *   Calls `prisma.user.deleteMany` targeting the correct user via Clerk ID.
    *   Handles potential database errors and logs if user was not found.
\n\n**ID:** CLERK-INFRA-1\n**Type:** Task (Manual Configuration)\n**Epic:** EPIC-CLERK-SYNC-2\n**Title:** Configure Clerk Webhook Endpoint & Secret\n**Description:** Manually configure a new webhook endpoint in the Clerk Dashboard (Settings -> Webhooks -> Add Endpoint). Set the URL to the deployed Clerk webhook handler (e.g., `/api/webhooks/clerk`). Subscribe to `user.created`, `user.updated`, `user.deleted` events. Obtain the **Webhook Signing Secret** and add it to the backend environment variables as `CLERK_WEBHOOK_SECRET`.
\n\n**ID:** CLERK-INFRA-2\n**Type:** Task (Configuration)\n**Epic:** EPIC-CLERK-SYNC-2\n**Title:** Ensure Clerk Webhook Route is Public\n**Description:** Verify that the Clerk webhook API route (`/api/webhooks/clerk` and potentially others) is configured as a public route in `middleware.ts` using the correct pattern (e.g., `/api/webhooks/(.*)`), bypassing Clerk authentication checks.
**Status:** Implemented
**Acceptance Criteria:**
    *   `middleware.ts` correctly excludes `/api/webhooks/(.*)` from protected routes.
\n\n**ID:** CLERK-TEST-1
**Type:** Task
**Epic:** EPIC-CLERK-SYNC-2
**Title:** Test Clerk Webhook Synchronization
**Description:** Test the synchronization flow. **For local testing**, use a forwarding tool (`ngrok` or Clerk CLI) to point the Clerk webhook endpoint URL temporarily to `localhost:3000/api/webhooks/clerk` and use the appropriate local `CLERK_WEBHOOK_SECRET`. Use the Clerk Dashboard "Send test event" feature and/or sign up/update/delete a test user locally.
**Dependencies:** All CLERK-BE-* tasks, CLERK-INFRA-1 (configured for local forwarding), CLERK-INFRA-2
**Status:** Ready for Local Testing
**Acceptance Criteria:**
    *   **(Local):** `user.created` events successfully create corresponding DB records when forwarded locally.
    *   **(Local):** `user.updated` events successfully update corresponding DB records when forwarded locally.
    *   **(Local):** `user.deleted` events successfully delete/deactivate corresponding DB records when forwarded locally.

---