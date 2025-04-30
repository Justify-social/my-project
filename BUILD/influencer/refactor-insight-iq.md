Okay, this is a significant and critical piece of information. The shift from **Phyllo** to **InsightIQ** necessitates a major refactoring effort across several parts of the application involved in influencer data fetching, connection, and synchronization.

Based on the email and the **InsightIQ** documentation snippets:

1.  **Deprecation:** **Phyllo** is effectively deprecated for your use case; **InsightIQ** is the replacement.
2.  **New Endpoints:** **Sandbox: `https://api.sandbox.insightiq.ai`**, Staging: `https://api.staging.insightiq.ai`, Production: `https://api.insightiq.ai`.
3.  **New Authentication:** Basic Authentication using the provided Client ID (`9c75...`) and Secret (`6590...`). Header: `Authorization: Basic <BASE64(Client_ID:Secret)>`.
4.  **Webhooks:** The **InsightIQ** dashboard has a "Webhooks" section, strongly implying a similar mechanism exists, but we don't have details on events, payloads, or signature verification yet.
5.  **API/SDK Details:** We lack the specific **InsightIQ** API documentation for endpoints corresponding to **Phyllo's** user creation, SDK token generation, account fetching, profile analytics fetching, etc. We also don't know if an "**InsightIQ** Connect SDK" exists or how it works.

**Comprehensive Plan to Replace Phyllo with InsightIQ:**

This requires touching multiple layers of the application:

**Phase 1: Configuration & Setup (Immediate Actions Possible)**

1.  **Identify & Remove Old Config:**
    *   **Roadmap Task 1.1:** Remove **Phyllo** environment variables from all `.env*` files. **[✔ COMPLETED - User Action]**
    *   **Roadmap Task 1.2:** Update `server-config.ts` to remove **Phyllo** config object entries and associated logging checks. **[✔ COMPLETED]**
2.  **Add New InsightIQ Config:**
    *   **Roadmap Task 1.3:** Add **InsightIQ** environment variables (`INSIGHTIQ_CLIENT_ID`, `INSIGHTIQ_SECRET`, **`INSIGHTIQ_SANDBOX_URL`**, `INSIGHTIQ_STAGING_URL`, `INSIGHTIQ_PROD_URL`, `INSIGHTIQ_WEBHOOK_SECRET` (TBC)) to `.env.local` and `.env.template`. **[✔ COMPLETED - User Action & Template Update Pending]**
    *   **Roadmap Task 1.4:** Update `server-config.ts` to include an `insightiq` config object reading the new variables, including base URL logic (**defaulting to Sandbox URL `INSIGHTIQ_SANDBOX_URL` in non-production environments**), and add logging checks. **[✔ COMPLETED]**

**Phase 2: Service Layer Refactoring (Partially Blocked)**

3.  **Rename & Adapt Service File:**
    *   **Roadmap Task 2.1:** Rename `src/lib/phylloService.ts` to `src/lib/insightiqService.ts`. **[✔ COMPLETED - via Deletion & Creation]**
    *   **Roadmap Task 2.2:** Refactor the core request function (`makePhylloRequest` -> `makeInsightIQRequest`) inside `insightiqService.ts`. **[✔ COMPLETED]**
4.  **Placeholder API Functions (Blocked by Docs):**
    *   **Roadmap Task 2.3:** Implement core service functions (`getInsightIQProfileById`, `checkInsightIQConnection`) and update placeholders (`createInsightIQUser`, `getInsightIQSdkConfig`) within `insightiqService.ts`. **[✔ COMPLETED]**

**Phase 3: Backend API Route Refactoring (Blocked by Docs & Service Layer)**

5.  **Rename & Refactor Phyllo-Specific Routes:**
    *   **Roadmap Task 3.1:** Rename directories/files (e.g., `api/phyllo` -> `api/insightiq`). **[✔ COMPLETED - User Action]**
    *   **Roadmap Task 3.2:** Refactor the code within these renamed routes (e.g., `/api/insightiq/create-user`, `/api/insightiq/sdk-token`). **[⏳ PENDING - Requires Service/Type Implementation]**
6.  **Rename & Refactor Webhook Handler:**
    *   **Roadmap Task 3.3:** Rename the file/path (e.g., to `/api/webhooks/insightiq/route.ts`). **[✔ COMPLETED - User Action]**
    *   **Roadmap Task 3.4:** Refactor the handler logic. **[⏳ PENDING - BLOCKED by Webhook Docs]**
7.  **Update Data-Consuming API Routes:**
    *   **Roadmap Task 3.5:** Update data-consuming routes (`/api/influencers/*`) to use `insightiqService.ts` and implement data mapping. **[⏳ PENDING - Requires Service/Type Implementation]**

**Phase 4: Type Definition Refactoring (Blocked by Docs)**

8.  **Identify & Replace Phyllo-Specific Types:**
    *   **Roadmap Task 4.1:** Define new TypeScript interfaces/types based on OpenAPI spec. **[🚧 IN PROGRESS - Core types added]**
    *   **Roadmap Task 4.2:** Update internal application types based on OpenAPI spec. **[🚧 IN PROGRESS - Core types added]**
    *   **Roadmap Task 4.3:** Update function signatures and logic to use new InsightIQ types. **[⏳ PENDING]**

**Phase 5: Database Schema Review (Depends on InsightIQ Data Structure)**

9.  **Review Schema for Compatibility:**
    *   **Roadmap Task 5.1:** Rename DB fields/models related to Phyllo. **[✔ COMPLETED - Migration Applied]**
    *   **Roadmap Task 5.2:** Review schema fields based on InsightIQ data structure. **[⏳ PENDING - Requires Data Mapping Analysis]**

**Phase 6: Frontend SDK Replacement (Blocked by Docs)**

10. **Remove Phyllo SDK Script:**
    *   **Roadmap Task 6.1:** Remove the Phyllo `<script>` tag. **[⏳ PENDING]**
11. **Refactor Frontend Connection Flow:**
    *   **Roadmap Task 6.2:** Implement InsightIQ SDK/Flow integration. **[⏳ PENDING - BLOCKED by SDK Docs]**
    *   **Roadmap Task 6.3:** Update frontend code to call InsightIQ backend endpoints. **[⏳ PENDING - BLOCKED by SDK Docs]**

**Phase 7: API Verification Tool Update**

12. **Update Verification Checks:**
    *   **Roadmap Task 7.1:** Remove the `verifyPhylloApi` function. **[✔ COMPLETED]**
    *   **Roadmap Task 7.2:** Implement `verifyInsightIQApi` function. **[✔ COMPLETED - Implemented with Available Endpoint]**
    *   **Roadmap Task 7.3:** Add the new InsightIQ verifier to the `ALL_API_VERIFIERS` list. **[✔ COMPLETED]**

**Phase 8: Documentation Update**

13. **Update Planning Documents:**
    *   **Roadmap Task 8.1:** Update `plan.md`, `plan-sprints.md`, etc. **[⏳ PENDING - Partially Blocked]**

**Execution Order Summary:**

1.  **~~Immediate: Phase 1 (Config).~~ [✔ COMPLETED]**
2.  **~~Immediate: Task 2.1, 2.2 (Service Rename/Wrapper), Task 7.1 (Verification Cleanup).~~ [✔ COMPLETED]**
3.  **~~Immediate: Task 3.1, 3.3 (Route/Webhook Rename), Task 3.2, 3.4 (Stubbing).~~ [✔ COMPLETED - Renamed & Stubbed]**
4.  **~~Post-Docs: Task 2.3 (Implement Core Service Fns), Phase 4 (Define Core Types), Task 7.2, 7.3 (Implement Verification).~~ [✔ COMPLETED / IN PROGRESS]**
5.  **~~Post-Docs: Task 5.1 (DB Rename).~~ [✔ COMPLETED - Migration Applied]**
6.  **Obtain InsightIQ Documentation (BLOCKER for Webhooks, SDK Flow, Full Types, Full Data Mapping)**
7.  **Post-Docs:** Implement logic within API routes & Webhook handler using new service/types (Tasks 3.2, 3.4, 3.5). **[⏳ PENDING - Webhook Blocked]**
8.  **Post-Docs:** Review/Update Database Schema if needed (Task 5.2). **[⏳ PENDING]**
9.  **Post-Docs:** Implement Frontend SDK changes (Phase 6). **[⏳ PENDING - BLOCKED by SDK Docs]**
10. **Post-Docs:** Update Documentation thoroughly (Task 8.1). **[⏳ PENDING - Partially Blocked]**

This provides a detailed, actionable roadmap based on the codebase structure and the required transition. The critical dependency remains the InsightIQ documentation.

**--- Scrum Master Notes for Execution ---**
*   **Tracking:** Convert each Roadmap Task (1.1 - 8.1) into trackable items (e.g., Jira tickets, GitHub issues) assigned to the relevant team (FE/BE/DevOps).
*   **Testing:** Ensure unit and integration tests are written or updated concurrently with code changes, particularly for the service layer (Phase 2), API routes (Phase 3), and webhook handler (Task 3.4) once documentation is available. End-to-end tests should be updated or created once the refactoring is integrated.
*   **Communication:** Maintain close communication between Frontend and Backend teams, especially when the InsightIQ documentation arrives, to quickly finalize API contracts (Phase 5) and resolve integration challenges.
*   **Code Review:** Emphasize thorough code reviews for all refactoring changes to catch potential issues early.
*   **Incremental Commits:** Encourage small, focused commits related to specific tasks for easier tracking and potential rollbacks.
**--------------------------------------**
