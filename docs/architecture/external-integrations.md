# External Service Integrations

**Last Reviewed:** 2025-05-09

This document provides an overview of critical external services and third-party integrations that the Justify platform relies on. For each service, we outline its primary role, key integration points, and any important considerations for developers.

## 1. Clerk (Authentication & User Management)

- **Primary Role**: Clerk is our primary provider for user authentication, session management, and user profile information.
- **Key Features Used**:
  - Sign-up and Sign-in (password-based, social logins, MFA).
  - Session management (JWTs, cookie-based sessions).
  - User profile storage (basic profile data, custom attributes).
  - Organization/team management (if applicable).
  - Frontend components (e.g., `<SignUp/>`, `<SignIn/>`, `<UserProfile/>`).
  - Backend SDK for verifying sessions and managing users.
- **Integration Points**:
  - **Frontend**: Utilizes Clerk's React components and hooks for UI related to authentication and user profiles. API calls from the client might pass Clerk-issued JWTs for backend authentication.
  - **Backend (`src/lib/auth/`, API Routes, Middleware)**: Uses Clerk's Node.js SDK to:
    - Protect API routes by verifying session tokens.
    - Retrieve authenticated user information.
    - Synchronize Clerk user data with our internal database (e.g., creating a local user profile linked to a Clerk user ID).
    - Handle webhooks from Clerk for events like user creation or updates.
- **Key Considerations & Patterns**:

  - Environment variables for Clerk API keys (Frontend API Key, Backend API Key, JWT Verification Key).
  - Synchronization strategy between Clerk user models and our internal database models.
  - Handling of authentication state across the frontend application.
  - Error handling for authentication failures.

  _(Action: Tech Lead/Auth Specialist to review and add more specific details, including webhook handling, data synchronization strategies, and links to relevant Clerk SDK documentation used.)_

## 2. Stripe (Payments & Billing)

- **Primary Role**: Stripe is used for all payment processing, subscription management, and billing-related functionalities.
- **Key Features Used**:
  - Processing one-time payments and recurring subscriptions.
  - Managing subscription plans and pricing models.
  - Handling payment methods (credit cards, etc.).
  - Generating invoices and receipts.
  - Stripe Checkout / Elements for secure payment forms.
  - Webhooks for events like successful payments, subscription updates, or payment failures.
- **Integration Points**:
  - **Frontend**: May use Stripe.js and Stripe Elements for securely collecting payment information. Client-side calls to our backend to create payment intents or manage subscriptions.
  - **Backend (`src/lib/stripe/`, `src/services/PaymentService.ts`, API Routes)**: Uses the Stripe Node.js SDK to:
    - Create and manage customers, subscriptions, payment intents, and other Stripe objects.
    - Handle webhooks from Stripe to update our internal database (e.g., update subscription status, record payments).
    - Securely interact with the Stripe API.
- **Key Considerations & Patterns**:

  - Environment variables for Stripe API keys (Publishable Key, Secret Key, Webhook Secret).
  - Data model for storing subscription status, customer IDs, and payment information in our local database, synchronized with Stripe.
  - Idempotency in webhook handling.
  - Security best practices for handling payment information (PCI compliance is largely handled by Stripe Elements/Checkout, but backend interactions still need care).

  _(Action: Tech Lead/Payments Specialist to review and add more specific details on webhook endpoints, data models for subscription state, and links to relevant Stripe API/SDK documentation.)_

## 3. Cint (Survey Panels & Audience Data)

- **Primary Role**: Cint is integrated to provide access to survey panels for conducting Brand Lift studies and gathering audience opinion data.
- **Key Features Used**: _(To be specified based on actual integration)_
  - API for defining target audiences.
  - API for launching surveys to specific demographics.
  - API for retrieving survey responses and respondent data.
  - Managing survey quotas and feasibility.
- **Integration Points**: _(To be specified based on actual integration)_
  - **Backend (`src/services/SurveyService.ts` or similar, API Routes)**: Likely interacts with the Cint API to:
    - Define survey parameters and target audiences based on Justify campaign settings.
    - Launch surveys through Cint.
    - Retrieve and process survey results.
    - Manage budget and respondent quotas for Cint surveys.
- **Key Considerations & Patterns**: _(To be specified based on actual integration)_

  - API key management for Cint.
  - Data mapping between Justify's campaign/audience definitions and Cint's requirements.
  - Handling asynchronous survey completion and data retrieval.
  - Cost management and monitoring of Cint API usage.
  - Privacy and data handling considerations for respondent data.

  _(Action: Product Manager/Tech Lead for Brand Lift feature to provide detailed information on the Cint integration, including specific API endpoints used, data flow, and key operational procedures.)_

## 4. InsightIQ (Analytics & Reporting - Placeholder)

- **Primary Role**: _(Hypothetical - To be confirmed and detailed)_ InsightIQ is assumed to be an external analytics platform for providing deeper data insights, potentially beyond what is built directly into Justify's reporting features.
- **Key Features Used**: _(To be specified)_
- **Integration Points**: _(To be specified)_
  - **Backend/Data Pipeline**: Data from Justify's database or event stream might be pushed to InsightIQ.
  - **Frontend**: Potentially embedding InsightIQ dashboards or visualizations within the Justify UI.
- **Key Considerations & Patterns**: _(To be specified)_

  - Data synchronization methods (API, ETL, event streaming).
  - Authentication and authorization for accessing InsightIQ data or embedded components.
  - Data privacy and security for data shared with InsightIQ.

  _(Action: Product Manager/Tech Lead for Analytics to confirm if InsightIQ (or a similar service) is used, and if so, to provide details on its role, integration points, and key features. If not used, this section should be removed or updated accordingly.)_

---

This document should be updated as new external services are integrated or existing integrations change significantly. Developers working with these integrations should familiarize themselves with the respective service's official documentation in addition to this overview.
