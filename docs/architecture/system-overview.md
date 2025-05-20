# System Overview

**Last Reviewed:** 2025-05-09

This document provides a high-level overview of the Justify platform's architecture, illustrating its major components and their primary interactions. It aims to give a "big picture" understanding of how the system is structured and operates.

## 1. Core Architectural Principles

Before diving into the components, it's important to understand the guiding principles that have shaped our system design:

- **Modularity**: Components are designed to be independent and reusable where possible.
- **Scalability**: The architecture is intended to scale with increasing load and data.
- **Maintainability**: Clear separation of concerns and well-defined interfaces facilitate easier maintenance and updates.
- **User-Centricity**: The system is built to serve the needs of our [Key User Personas](../getting-started/project-goals.md#key-user-personas).
- **Data-Driven**: Emphasis on robust data collection, processing, and presentation to deliver actionable insights.
- **SSOT**: Adherence to the Single Source of Truth principle for data, configuration, and logic.

## 2. High-Level System Diagram

```mermaid
graph TD
    A[Client Browser] -->|HTTPS (React UI)| B(Next.js Frontend / Vercel Edge);
    B -->|SSR/API Calls| C(Next.js Backend / Vercel Serverless Functions);

    subgraph "User Interaction Layer"
        A
    end

    subgraph "Justify Platform (Hosted on Vercel)"
        B -- Serves --> A
        C -- Data --> B
        C -->|Prisma ORM| D{PostgreSQL Database};
        C -->|Clerk SDK| E(Clerk Auth);
        C -->|Stripe SDK| F(Stripe Payments);
        C -->|Cint API| G(Cint Survey Panels);
        C -->|InsightIQ API| H(InsightIQ Influencer Data);
        C -->|Resend API| L(Resend Email Service);
        C -.->|Async Tasks?| I[Queue / Cron Jobs?];
        I -.-> C
        I -.-> D
    end

    subgraph "Core Data Store"
        D
    end

    subgraph "External Services (SaaS)"
        E
        F
        G
        H
        L
    end

    subgraph "Potential Future / Supporting Infrastructure"
        I
    end

    style E fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#f9f,stroke:#333,stroke-width:2px
    style L fill:#f9f,stroke:#333,stroke-width:2px
```

_(**Note:** This diagram provides a conceptual overview based on available information. Specific interactions, particularly involving queueing or cron jobs, require further verification.)_

## 3. Major System Components & Interactions

### 3.1. Client Browser (User Interface)

- **Description**: The user-facing web application built with Next.js (App Router), React, TypeScript, and Tailwind CSS.
- **Responsibilities**: Renders the UI (HTML, CSS, client-side JS), handles user interactions, manages local UI state (using Zustand, component state), fetches data via TanStack Query which calls backend API routes, interacts with ClerkJS for frontend authentication aspects.
- **Key Interactions**: Served by Vercel Edge; makes HTTPS API calls to the Next.js Backend; interacts directly with ClerkJS and potentially Stripe.js for specific UI elements.

### 3.2. Next.js Frontend / Vercel Edge

- **Description**: The edge network layer provided by Vercel.
- **Responsibilities**: Serves static assets (`/public`), caches pages and assets globally, runs Next.js Middleware (`src/middleware.ts`) for tasks like authentication checks/redirects before requests hit the backend.
- **Key Interactions**: Delivers content to the Client Browser; executes Edge Middleware.

### 3.3. Next.js Backend / Vercel Serverless Functions

- **Description**: The core backend logic running as serverless functions on Vercel.
- **Responsibilities**: Executes API Route handlers (`src/app/api/...`), performs Server-Side Rendering (SSR) or generates static pages for Server Components, interacts with the database and external services, enforces business logic.
- **Key Interactions**: Responds to API calls from the Client Browser; uses Prisma ORM to interact with the PostgreSQL Database; uses SDKs/APIs to communicate with Clerk, Stripe, Cint, InsightIQ, Resend; potentially enqueues background tasks.

### 3.4. PostgreSQL Database (Primary Data Store)

- **Description**: Relational database storing core application data defined by the Prisma schema (`config/prisma/schema.prisma`).
- **Responsibilities**: Data persistence for users, campaigns, brand lift studies, influencer cache (`MarketplaceInfluencer`), etc.
- **Key Interactions**: Accessed exclusively by the Next.js Backend via the Prisma Client (`src/lib/db.ts`).

### 3.5. Clerk (Authentication Service)

- **Description**: External SaaS provider acting as the SSOT for user identity.
- **Responsibilities**: Handles user sign-up, sign-in, session management, profile storage, MFA, potentially organization management.
- **Key Interactions**: Frontend uses ClerkJS for UI components (`<SignIn/>`, `<UserButton/>`) and hooks (`useUser`, `useAuth`). Backend uses Clerk Node SDK via `src/middleware.ts` (for protection) and API routes/services (`auth()` helper) to verify sessions and manage users. Webhooks (`/api/webhooks/clerk`) sync user data to the PostgreSQL DB.

### 3.6. Stripe (Payment Service)

- **Description**: External SaaS provider for payment processing.
- **Responsibilities**: Handles subscription billing, payment method management, invoicing.
- **Key Interactions**: Frontend may use Stripe.js/Elements for secure card input. Backend uses Stripe Node SDK (`src/lib/stripe`) to create customers, manage subscriptions, process payments, and handle webhooks (`/api/webhooks/stripe`) for payment events, syncing necessary data (e.g., `stripeCustomerId`) to the PostgreSQL DB.

### 3.7. Cint (Survey Panel Service)

- **Description**: External SaaS provider for accessing survey respondents.
- **Responsibilities**: Provides targeted audience panels for Brand Lift studies.
- **Key Interactions**: Backend interacts with Cint API (`src/services/BrandLiftService.ts`?) to define audiences, launch surveys, and retrieve anonymized responses. May use webhooks or polling to get results.

### 3.8. InsightIQ (Influencer Data Service)

- **Description**: External SaaS provider (likely) for influencer profiles and analytics.
- **Responsibilities**: Provides search capabilities and detailed data on influencers across various platforms.
- **Key Interactions**: Backend interacts with InsightIQ API (`src/lib/insightiqService.ts`) to search for influencers and fetch detailed profile/audience data. This data populates the Influencer Marketplace and may be cached/summarized in the `MarketplaceInfluencer` table.

### 3.9. Resend (Email Service)

- **Description**: External SaaS provider for transactional email delivery.
- **Responsibilities**: Sends emails for events like user invites, notifications, password resets.
- **Key Interactions**: Backend interacts with Resend API (`src/lib/email/`) to trigger email sends.

### 3.10. Queue / Cron Jobs (Supporting Infrastructure - _Conceptual_)

- **Description**: Mechanism for handling background tasks or scheduled operations (e.g., Vercel Cron Jobs, external queue service).
- **Responsibilities**: Processing long-running tasks asynchronously (report generation, data sync), running scheduled cleanups or notifications.
- **Key Interactions**: Enqueued by the Next.js Backend; workers/jobs interact with the Database or external APIs.

## 4. Data Flow Example: Brand Lift Study Launch

_(Illustrative - Requires validation)_

1.  **User Action:** User clicks "Launch Study" in the Brand Lift UI (Client Browser).
2.  **API Call:** Frontend (using `useMutation`?) sends request to `PUT /api/brand-lift/surveys/{studyId}/launch`.
3.  **Authentication:** `src/middleware.ts` verifies user authentication via Clerk.
4.  **Backend Handler:** API route handler validates request and calls `BrandLiftService`.
5.  **Service Logic:** `BrandLiftService` fetches study details from DB (Prisma), validates status.
6.  **External Call (Cint):** Service maps Justify audience criteria to Cint API format and calls Cint API to create/launch the survey project.
7.  **DB Update:** Service stores Cint project ID in `BrandLiftStudy` record (Prisma) and updates study status to `COLLECTING`.
8.  **Response:** API route returns success response to the client.
9.  **UI Update:** Frontend reflects the new study status.
10. **(Later) Webhook/Polling:** Cint sends response data or Justify backend polls Cint API.
11. **Data Ingestion:** Backend webhook handler/poller processes responses, maps data, and saves `SurveyResponse` records to DB (Prisma).

## 5. Further Details

For more detailed information on specific parts of the architecture, please refer to the other documents within this `/docs/architecture` section.

This overview is intended to be a living document and will be updated as the Justify platform evolves.
