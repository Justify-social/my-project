# Cint API Integration Details for Brand Lift Feature

This document summarizes key findings and considerations for integrating with the Cint Lucid Exchange API, based on the review of `cint-exchange-guide.md` and `cint-exchange-openapi.yaml`. It directly addresses requirements from **Task Prep-2** and **Ticket BL-MVP-P4-02.1** of the Brand Lift feature plan.

## 1. Authentication

*   **Main API (OAuth JWT):**
    *   Uses OAuth 2.0 Client Credentials Grant Flow to obtain a JWT.
    *   Endpoint: `https://auth.lucidhq.com/oauth/token`.
    *   Required parameters: `client_id`, `client_secret`, `grant_type: "client_credentials"`, `lucid_scopes: "app:api"`, `audience: "https://api.luc.id"`.
    *   JWT is valid for 24 hours.
    *   Must be included in API requests via `Authorization: Bearer <Your JWT>` header.
    *   The `Cint-API-Version` header is **mandatory** for all API requests (e.g., `2025-02-17`).
*   **Server-to-Server (S2S) Respondent Flow (Basic Auth):**
    *   Used for validating respondent entry and updating respondent status securely.
    *   Requires a separate S2S API Key.
    *   Authentication is typically Basic Auth: `Authorization: Basic <base64_encoded_s2s_api_key>` (or as specified by Cint for S2S).

## 2. Core API Workflow for Survey Launch (MVP Focus)

The general flow to launch a survey on Cint involves these main entities and steps:

1.  **Create Project:**
    *   Endpoint: `POST /demand/accounts/{account_id}/projects`
    *   A Project is a container for Target Groups.
    *   Key payload fields: `name`, `project_manager_id`.
    *   Requires `idempotency-key` header.

2.  **Create Target Group:**
    *   Endpoint: `POST /demand/accounts/{account_id}/projects/{project_id}/target-groups`
    *   Defines the specific audience, survey parameters, and links for a country/language pair.
    *   Created in `draft` status.
    *   Key payload fields:
        *   `name`: Name of the Target Group.
        *   `business_unit_id`: Provided by Cint.
        *   `project_manager_id`: User ID of the project manager.
        *   `locale`: e.g., "eng_us".
        *   `collects_pii`: Boolean.
        *   `filling_goal`: Target number of completes.
        *   `expected_length_of_interview_minutes`: LOI.
        *   `expected_incidence_rate`: IR (0.0 to 1.0).
        *   `fielding_specification`: `{ start_at, end_at }` (ISO 8601 date-times).
        *   `live_url`: **Your survey URL** where Cint redirects respondents. Must include `[%RID%]` placeholder (e.g., `https://<your-app-domain>/survey/{studyId}?rid=[%RID%]`).
        *   `test_url`: Your test survey URL with `[%RID%]`.
        *   `cost_per_interview` (if using dynamic pricing).
        *   `pricing_model`: "dynamic" or "rate_card".
        *   `profile`: Complex object defining targeting criteria using Cint's question library and answer options. Includes `question_id`, `conditions`, and `quotas`.
        *   `fielding_assistant_assignment` (optional, for automated fielding).
    *   Requires `idempotency-key` header.

3.  **Launch Target Group (Fielding Run):**
    *   Endpoint: `POST /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/launch-from-draft`
    *   Transitions the Target Group from `draft` to `live` status, making it visible to suppliers.
    *   Key payload field: `end_fielding_at` (ISO 8601 date-time).
    *   Requires `idempotency-key` header.
    *   A successful call typically returns a `201 Created` or `202 Accepted` with a `job_id` (often in the `Location` header) to track the asynchronous launch process.

## 3. Respondent Flow & Response Collection (S2S Recommended)

Cint recommends a Server-to-Server (S2S) flow for managing respondent transitions for better security and reliability.

1.  **Respondent Entry:**
    *   Cint redirects a qualified respondent to the `live_url` you provided during Target Group setup.
    *   The `[%RID%]` placeholder in your `live_url` is replaced by Cint with a unique Respondent ID.

2.  **S2S - Validate Respondent (Your Platform -> Cint S2S API):**
    *   Your survey platform receives the respondent and extracts the `RID`.
    *   Call Cint S2S API: `GET https://s2s.cint.com/fulfillment/respondents/{RID}`
    *   Authentication: S2S API Key (Basic Auth).
    *   Expected Cint Response: JSON with respondent `id` and `status`. `status: 1` indicates "In Survey/Drop" (valid to proceed).
    *   If invalid or error, redirect respondent back to Cint's generic callback without an API call.

3.  **Respondent Takes Survey (On Your Platform).**

4.  **S2S - Update Respondent Status (Your Platform -> Cint S2S API):**
    *   When the respondent finishes (Complete, Terminate, Overquota, Quality Terminate).
    *   Call Cint S2S API: `POST https://s2s.cint.com/fulfillment/respondents/transition`
    *   Authentication: S2S API Key (Basic Auth).
    *   Payload: `{ "id": "<respondent_RID>", "status": <S2S_Status_Code> }`
        *   S2S Status Codes (from guide):
            *   `5`: Complete
            *   `2`: Terminate (Screenout)
            *   `3`: Overquota (Quota Full)
            *   `4`: Security Terminate (Quality Terminate)

5.  **Redirect Respondent (Your Platform -> Cint Generic Callback):**
    *   After receiving a success response from the S2S Update Status API call.
    *   Redirect respondent to: `https://samplicio.us/s/ClientCallBack.aspx?RID=<respondent_RID>` (Note: no status in this URL).

**Alternative (Less Secure):** SHA-1 HMAC hashing for redirect URLs if S2S is not feasible.

**Webhook Notifications:** Cint offers webhooks for events like `session-updated`. This could be explored for supplementary data but S2S is preferred for direct outcome reporting.

## 4. Survey Presentation (In Relation to Ticket BL-MVP-P4-02.1)

*   **Self-Hosting:** The Cint workflow (providing `live_url` and `test_url`) implies that the survey instrument itself is hosted on the Justify platform.
*   **Rich Media Support:** This self-hosting approach allows Justify to control the survey page's HTML, CSS, and JavaScript. This is crucial for Post-MVP features like embedding Mux videos, as Justify can integrate the Mux Player directly.
*   **Cint Interaction:** Cint's role is to drive qualified respondents to this Justify-hosted survey URL.

## 5. Key API Constraints & Best Practices (Identified So Far)

*   **`Cint-API-Version` Header:** Mandatory for all main API calls.
*   **`idempotency-key` Header:** Mandatory for mutable operations to prevent accidental duplication.
*   **Error Handling:** The general guide mentions idempotency for retries. Detailed error codes and specific retry policies for various scenarios (e.g., rate limits, transient errors) need further clarification from Cint or deep exploration of the OpenAPI specification per endpoint.
*   **Rate Limits:** The guide states they exist but does not provide specific numbers. This is a critical point to clarify with Cint for production readiness.
*   **Targeting (`profile` object):** This is a complex JSON object requiring careful mapping of Justify campaign criteria to Cint's `question_id` and `condition` (answer) structure. Cint provides API endpoints to fetch available questions and their options for specific locales.
*   **Asynchronous Operations:** Some operations, like launching a Target Group, are asynchronous and return a `job_id`. Polling the job status might be necessary.

## 6. Mock API Responses & Service Stub

*   Initial mock request/response structures for key Cint operations (Auth, Project Create, TG Create, TG Launch, TG Overview, S2S Validate, S2S Update) have been defined as placeholder types and within the mock `apiClient` in `src/lib/cint.ts`.
*   The `src/lib/cint.ts` file contains the `CintApiService` stub, which will be fleshed out with actual API calls and error handling.

## 7. Pending Clarifications from Cint (External Actions for Team)

*   Specific API rate limits for various endpoints.
*   Recommended retry policies for transient vs. terminal errors.
*   Detailed error code catalog and their meanings/implications.
*   Best practices for defining complex `profile` objects for audience targeting, especially for typical brand lift study demographics.
*   Clarification on any nuances of the S2S authentication/implementation if `Basic Auth` interpretation is too simplistic.
*   **Testing Environment:** Cint does not have a separate sandbox environment. Developer/test accounts operate on the production infrastructure. Most workflows (feasibility, creating draft Projects/Target Groups, S2S flow) can be tested directly.
*   **Testing Live Target Groups:** To test launching a Target Group (`POST .../launch-from-draft`) without attracting real respondents and incurring costs, you **must** include the following `supply_allocations` block in the Target Group creation payload. This routes traffic exclusively to Cint's test supplier (ID 980):
    ```json
    "supply_allocations": [
      {
        "percentage_max": 100,
        "percentage_min": 0,
        "name": "Test Supplier Only", // Name can be adjusted
        "type": "group",
        "suppliers": [ { "id": 980 } ]
      },
      {
        "percentage_max": 0,
        "percentage_min": 0,
        "name": "Block Exchange", // Name can be adjusted
        "type": "exchange",
        "suppliers": []
      }
    ]
    ```
*   Process and lead time for obtaining Production API credentials (confirming if current credentials are the final ones or if a separate production set is needed).

This document will be updated as more information is gathered through the Cint API deep dive and direct communication with Cint support. 