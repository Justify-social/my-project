# Phyllo Integration Setup & Contracts (MVP)

**Purpose:** This document tracks the setup, API contracts, and key decisions for integrating Phyllo into the Justify Influencer Marketplace feature.

---

## Step 1: API Credentials & Environment Setup

**Goal:** Ensure secure and correct configuration of Phyllo Sandbox API credentials within the development environment.

**Checklist & Status:**

1.  **[✔] Obtain Sandbox API Credentials:**
    *   **Action:** Retrieve Sandbox `Client ID` and `Client Secret` from Phyllo Dashboard.
    *   **Reference:** [https://dashboard.getphyllo.com/developers/api-credentials](https://dashboard.getphyllo.com/developers/api-credentials)
    *   **Status:** **Done** (Credentials confirmed available in `.env`).

2.  **[✔] Configure Environment Variables (Local Development):**
    *   **Action:** Ensure local `.env` files contain the correct Sandbox credentials.
    *   **Variables:**
        ```bash
        PHYLLO_BASE_URL=https://api.sandbox.getphyllo.com
        PHYLLO_CLIENT_ID=<your_sandbox_client_id_here>
        PHYLLO_CLIENT_SECRET=<your_sandbox_client_secret_here>
        # PHYLLO_WEBHOOK_SECRET=<your_sandbox_webhook_secret> # Add if/when webhooks are implemented
        ```
    *   **Status:** **Done**.

3.  **[✔] Update `.env.template` / `.env.example`:**
    *   **Action:** Add the `PHYLLO_BASE_URL`, `PHYLLO_CLIENT_ID`, `PHYLLO_CLIENT_SECRET`, and placeholder `PHYLLO_WEBHOOK_SECRET` variables to the template/example environment file (without committing actual secrets).
    *   **Status:** **Done**.

4.  **[✔] Configure Secret Storage (Staging/Production):**
    *   **Action:** Configure secure storage for **Sandbox & Production** credentials using the appropriate platform vault (Vercel Environment Variables confirmed updated for Sandbox).
    *   **Owner:** DevOps / Lead.
    *   **Status:** **Done (for Sandbox on Vercel)**. Production credentials setup still needed before production deployment.

## Step 2: Core Documentation Review

**Goal:** Ensure Backend and Frontend teams understand Phyllo's core concepts, authentication, and relevant API/SDK usage.

**Checklist & Status:**

1.  **[ ] Review API Introduction & Getting Started:**
    *   **Action:** Key developers (FE/BE Leads) read through the introductory guides.
    *   **Reference:** [Intro](https://docs.getphyllo.com/docs/api-reference/introduction/introduction), [Getting Started](https://docs.getphyllo.com/docs/api-reference/introduction/getting-started-with-phyllo-APIs)
    *   **Status:** **Pending**

2.  **[ ] Review Authentication & Error Handling:**
    *   **Action:** Backend team reviews Basic Auth requirements and standard error responses.
    *   **Reference:** [Getting Started (Auth)](https://docs.getphyllo.com/docs/api-reference/API/getting-started-with-APIs), [Error Handling](https://docs.getphyllo.com/docs/api-reference/API/handling-errors)
    *   **Status:** **Pending**

3.  **[ ] Review Rate Limits:**
    *   **Action:** Backend team notes the rate limits and plans implementation accordingly (caching, backoff).
    *   **Reference:** [Rate Limits](https://docs.getphyllo.com/docs/api-reference/guides/respecting-rate-limits)
    *   **Status:** **Pending**

4.  **[ ] Review Webhooks & Data Refresh (Backend Focus):**
    *   **Action:** Backend team reviews webhook handling guide and data refresh best practices to inform their strategy (defined in `plan.md`).
    *   **Reference:** [Webhooks](https://docs.getphyllo.com/docs/api-reference/guides/handling-phyllo-webhooks), [Data Refresh](https://docs.getphyllo.com/docs/api-reference/API/data-refresh-guide)
    *   **Status:** **Pending**

5.  **[ ] Review Connect Web SDK Docs (Frontend Focus):**
    *   **Action:** Frontend team reviews the Web SDK documentation and React examples.
    *   **Reference:** [Web SDK Repo](https://github.com/getphyllo/phyllo-connect-web), [React Sample](https://github.com/getphyllo/phyllo-react-sample)
    *   **Status:** **Pending**

## Step 3: Explore Sandbox Data

**Goal:** Understand the nature and limitations of the data available in the Phyllo sandbox environment.

**Checklist & Status:**

1.  **[ ] Identify Available Test Accounts/Profiles:**
    *   **Action:** Check Phyllo documentation or sandbox dashboard for information on pre-configured test creator accounts or profiles representing different platforms (Instagram, TikTok, YouTube).
    *   **Status:** **Pending**

2.  **[ ] Connect Test Accounts (If Possible/Needed):**
    *   **Action:** If required for generating realistic data, investigate if developers can connect their own (test) social accounts via the Phyllo Connect Sandbox flow.
    *   **Status:** **Pending**

3.  **[ ] Analyze Sample Sandbox API Responses:**
    *   **Action:** Once basic connection (Ticket 0.12) is established, make sample calls to key Sandbox endpoints (e.g., `GET /v1/identity/profiles`, `GET /v1/profiles/social/{id}`) using known test account IDs (if available) to observe the structure, content, and potential limitations of the sandbox data.
    *   **Status:** **Pending**

## Step 4: Frontend SDK Setup (Web)

**Goal:** Prepare the Next.js frontend application to integrate and launch the Phyllo Connect Web SDK.

**Checklist & Status:**

1.  **[ ] Install/Include Web SDK Script:**
    *   **Action:** Add the Phyllo Connect JS script (`<script src="https://cdn.getphyllo.com/connect/v2/phyllo-connect.js"></script>`) to the application layout (e.g., `app/layout.tsx` or equivalent).
    *   **Reference:** As shown in Phyllo docs / Grok plan.
    *   **Status:** **Pending**

2.  **[ ] Implement SDK Initialization Wrapper (Ticket FE-P.1 in `plan.md`):**
    *   **Action:** Create the `usePhylloConnect` hook or `phylloConnectWebService.ts` service to encapsulate `PhylloConnect.initialize(config)` and event listeners.
    *   **Status:** **Pending**

3.  **[ ] Verify Next.js Compatibility:**
    *   **Action:** Perform basic tests to ensure the SDK script and initialization logic work correctly within the Next.js environment (both `next dev` and potentially a test `next build`). Check for hydration errors or conflicts.
    *   **Status:** **Pending**

## Step 5: Finalize API Contracts (Ref: Ticket 0.5.1 in `plan.md`)

**Goal:** Formally define and agree upon the exact request and response schemas for the Justify backend APIs interacting with the frontend for the MVP.

**Status:** **Pending - CRITICAL BLOCKER**

**Action Items:**
*   **[ ] Schedule & Hold FE/BE API Contract Review Meeting.**
*   **[ ] Document Finalized Schemas (e.g., OpenAPI Spec / Linked Document):**
    *   `GET /api/influencers` (Request Params, Response Body w/ Pagination)
    *   `GET /api/influencers/:id` (Request Params, Response Body)
    *   `GET /api/influencers/summaries` (Request Params, Response Body)
*   **[ ] Gain Sign-off from FE Lead and BE Lead.**

**Next Steps:**
1. Complete **Step 5 (API Contract Finalization) - Highest Priority.**
2. Proceed with **Steps 2 & 3 (Doc Review, Sandbox Data Exploration).**
3. Backend team begins **Ticket 0.12 (Initial Connection)** & **Ticket 0.14 (Verify Existing Endpoints).**
4. Frontend team begins **Step 4 (SDK Setup)** & **Ticket UI Dependency Checks.**
5. Prepare for Sprint 1 Planning based on outputs.
