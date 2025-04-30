# InsightIQ Integration Setup & Contracts (MVP)

**Purpose:** This document tracks the setup, API contracts, and key decisions for integrating **InsightIQ** into the Justify Influencer Marketplace feature.

---

## Step 1: API Credentials & Environment Setup

**Goal:** Ensure secure and correct configuration of **InsightIQ** Sandbox API credentials within the development environment.

**Checklist & Status:**

1.  **[✔] Obtain Sandbox API Credentials:**
    *   **Action:** Retrieve Sandbox `Client ID` and `Client Secret` from **InsightIQ** Dashboard.
    *   **Reference:** **InsightIQ Dashboard (URL TBD)**
    *   **Status:** **Done** (Credentials confirmed available in `.env` based on `refactor-insight-iq.md`).

2.  **[✔] Configure Environment Variables (Local Development):**
    *   **Action:** Ensure local `.env` files contain the correct Sandbox credentials.
    *   **Variables:**
        ```bash
        # INSIGHTIQ_BASE_URL=https://api.sandbox.insightiq.ai # Use staging URL for Sandbox
        INSIGHTIQ_STAGING_URL=https://api.staging.insightiq.ai
        INSIGHTIQ_PROD_URL=https://api.insightiq.ai
        INSIGHTIQ_CLIENT_ID=<your_sandbox_client_id_here>
        INSIGHTIQ_SECRET=<your_sandbox_client_secret_here>
        # INSIGHTIQ_WEBHOOK_SECRET=<your_sandbox_webhook_secret> # Add if/when webhooks are implemented
        ```
    *   **Status:** **Done** (Structure confirmed, values need local entry).

3.  **[✔] Update `.env.template` / `.env.example`:**
    *   **Action:** Add the `INSIGHTIQ_STAGING_URL`, `INSIGHTIQ_PROD_URL`, `INSIGHTIQ_CLIENT_ID`, `INSIGHTIQ_SECRET`, and placeholder `INSIGHTIQ_WEBHOOK_SECRET` variables to the template/example environment file (without committing actual secrets).
    *   **Status:** **Done**.

4.  **[✔] Configure Secret Storage (Staging/Production):**
    *   **Action:** Configure secure storage for **Sandbox/Staging & Production** credentials using the appropriate platform vault (Vercel Environment Variables confirmed updated for Staging).
    *   **Owner:** DevOps / Lead.
    *   **Status:** **Done (for Staging on Vercel)**. Production credentials setup still needed before production deployment.

## Step 2: Core Documentation Review

**Goal:** Ensure Backend and Frontend teams understand **InsightIQ's** core concepts, authentication, and relevant API/SDK usage. **(Partially Unblocked by OpenAPI Spec)**

**Checklist & Status:**

1.  **[🚧 IN PROGRESS] Review API Introduction & Getting Started:**
    *   **Action:** Key developers review introductory guides & OpenAPI spec.
    *   **Reference:** [Intro](https://docs.insightiq.ai/docs/api-reference/introduction/introduction), `BUILD/influencer/openapi.v1.yml`
    *   **Status:** **Partially Addressed by OpenAPI Spec.**

2.  **[🚧 IN PROGRESS] Review Authentication & Error Handling:**
    *   **Action:** Backend team reviews Basic Auth requirements (confirmed) and standard error responses (details pending).
    *   **Reference:** `BUILD/influencer/openapi.v1.yml`, **Requires Detailed InsightIQ Error Handling Docs**
    *   **Status:** **Partially Addressed by OpenAPI Spec.**

3.  **[🚧 IN PROGRESS] Review Rate Limits:**
    *   **Action:** Backend team notes confirmed rate limits (2 req/sec) and plans implementation (429 / Retry-After handling).
    *   **Reference:** InsightIQ Getting Started Docs, `src/lib/insightiqService.ts`
    *   **Status:** **Addressed by Getting Started Docs.**

4.  **[ ] Review Webhooks & Data Refresh (Backend Focus):**
    *   **Action:** Backend team reviews webhook handling guide and data refresh best practices.
    *   **Reference:** **Requires Detailed InsightIQ Webhook Docs** (OpenAPI mentions events but not implementation details)
    *   **Status:** **Pending**

5.  **[ ] Review Connection SDK/Flow Docs (Frontend Focus):**
    *   **Action:** Frontend team reviews the **InsightIQ** connection mechanism documentation.
    *   **Reference:** **Requires Detailed InsightIQ SDK/Flow Docs** (OpenAPI defines `/v1/sdk-tokens` but not frontend usage)
    *   **Status:** **Pending**

## Step 3: Explore Sandbox/Staging Data

**Goal:** Understand the nature and limitations of the data available in the **InsightIQ** sandbox/staging environment. **(Partially Unblocked by OpenAPI Spec)**

**Checklist & Status:**

1.  **[ ] Identify Available Test Accounts/Profiles:**
    *   **Action:** Check **InsightIQ** documentation or dashboard for information on pre-configured test creator accounts or profiles representing different platforms (Instagram, TikTok, YouTube).
    *   **Status:** **Pending**

2.  **[ ] Connect Test Accounts (If Possible/Needed):**
    *   **Action:** If required for generating realistic data, investigate if developers can connect their own (test) social accounts via the **InsightIQ** connection Sandbox/Staging flow.
    *   **Status:** **Pending**

3.  **[ ] Analyze Sample Sandbox/Staging API Responses:**
    *   **Action:** Make sample calls to key Sandbox endpoints (using schemas from OpenAPI spec) to observe the structure, content, and potential limitations of the data.
    *   **Reference:** `BUILD/influencer/openapi.v1.yml`
    *   **Status:** **Pending**

## Step 4: Frontend Connection Flow Setup (Web)

**Goal:** Prepare the Next.js frontend application to integrate and launch the **InsightIQ** connection flow. **(Blocked by lack of Docs)**

**Checklist & Status:**

1.  **[ ] Install/Include Connection SDK/Script (If Applicable):**
    *   **Action:** If **InsightIQ** provides a JS SDK, add it to the application layout. Otherwise, plan for the necessary UI/API calls for the connection flow.
    *   **Reference:** **Requires Detailed InsightIQ Docs**.
    *   **Status:** **Pending**

2.  **[ ] Implement Connection Initialization Wrapper (Ref: Task 6.2/6.3 in `refactor-insight-iq.md`):**
    *   **Action:** Create necessary hooks or services to encapsulate the **InsightIQ** connection initiation logic and event handling.
    *   **Status:** **Pending**

3.  **[ ] Verify Next.js Compatibility:**
    *   **Action:** Perform basic tests to ensure the connection mechanism works correctly within the Next.js environment.
    *   **Status:** **Pending**

## Step 5: Finalize API Contracts (Ref: Task 3.5 / Phase 4 in `refactor-insight-iq.md`)

**Goal:** Formally define and agree upon the exact request and response schemas for the Justify backend APIs interacting with the frontend for the MVP, based on **InsightIQ's actual capabilities**. **(Partially Unblocked by OpenAPI Spec)**

**Status:** **Pending - OpenAPI Spec Available, Review/Sign-off Needed**

**Action Items:**
*   **[✔] Obtain Detailed InsightIQ API Documentation.** (`BUILD/influencer/openapi.v1.yml`)
*   **[ ] Schedule & Hold FE/BE API Contract Review Meeting.** (Using OpenAPI spec as basis)
*   **[ ] Document Finalized Schemas (e.g., OpenAPI Spec / Linked Document):** (Reference the provided OpenAPI spec)
    *   `GET /api/influencers` (Request Params, Response Body w/ Pagination)
    *   `GET /api/influencers/:id` (Request Params, Response Body)
    *   `GET /api/influencers/summaries` (Request Params, Response Body)
*   **[ ] Gain Sign-off from FE Lead and BE Lead.**

**Next Steps:**
1.  **Obtain Detailed InsightIQ Documentation - Highest Priority.**
2.  Proceed with **Step 2 (Doc Review)** & **Step 3 (Sandbox/Staging Data Exploration)** once docs are available.
3.  Backend team proceeds with **Task 2.2 (Basic Request Wrapper)** and placeholder logic.
4.  Frontend team prepares structure for **Step 4 (Connection Flow Setup)**.
5.  **Step 5 (API Contract Finalization)** must be completed before significant dependent backend/frontend implementation.
