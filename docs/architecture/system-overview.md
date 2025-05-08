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

## 2. High-Level System Diagram

_(Action: Tech Lead/Architect to add a high-level system architecture diagram here. A Mermaid diagram is recommended for maintainability within Markdown.)_

**Placeholder for Diagram:**

```mermaid
graph TD
    A[Client Browser] -->|HTTPS API Calls| B(Next.js Frontend Server / Vercel);
    B -->|Serves UI| A;
    B -->|API Requests / SSR| C(Next.js API Routes / Edge Functions);
    C -->|Database Queries| D{PostgreSQL Database (Prisma)};
    C -->|Authentication| E(Clerk - External Auth Service);
    C -->|Payment Processing| F(Stripe - External Payment Service);
    C -->|Survey Panels| G(Cint - External Survey Panel Service);
    C -->|Analytics Data| H(InsightIQ - External Analytics Service);
    C -->|Background Jobs / Queues| I[Queueing Service (e.g., Vercel Cron/Queues, BullMQ)];
    I --> D;
    J[Data Warehouse / Analytics DB] <--> C;
    K[Storage (e.g., Vercel Blob, S3)] <--> C;

    subgraph "User Interfaces"
        A
    end

    subgraph "Justify Platform (Hosted on Vercel)"
        B
        C
        I
        K
    end

    subgraph "Primary Data Store"
        D
    end

    subgraph "External Services"
        E
        F
        G
        H
    end

    subgraph "Supporting Infrastructure (Optional)"
        J
    end
```

*(The above Mermaid diagram is a *very* conceptual placeholder and needs to be reviewed, refined, and made accurate by the technical leadership.)*

## 3. Major System Components & Interactions

_(Action: Tech Lead/Architect to elaborate on the components and interactions shown in the diagram above.)_

Below is a brief textual description of the key components and how they generally interact. This should align with the diagram above.

### 3.1. Client Application (Browser)

- **Description**: The user-facing web application, built with Next.js and React, running in the user's browser.
- **Responsibilities**: Renders the UI, handles user interactions, makes API calls to the backend.
- **Key Interactions**: Communicates with the Next.js Frontend Server for UI assets and the API Routes/Edge Functions for data and operations.

### 3.2. Next.js Frontend Server (Vercel)

- **Description**: Serves the static assets, server-rendered pages, and client-side components of the Next.js application.
- **Responsibilities**: Delivers the web application to the user's browser.
- **Key Interactions**: Interacts with client browsers.

### 3.3. API Layer (Next.js API Routes / Edge Functions on Vercel)

- **Description**: The backend logic of the application, handling API requests, business logic, and data processing.
- **Responsibilities**: Authenticating users, validating requests, interacting with the database and external services, processing data, and returning responses to the client.
- **Key Interactions**: Receives requests from the client, queries the PostgreSQL Database, integrates with Clerk (Auth), Stripe (Payments), Cint (Surveys), InsightIQ (Analytics), and potentially a Queueing Service for background tasks and Vercel Blob/S3 for storage.

### 3.4. PostgreSQL Database (via Prisma ORM)

- **Description**: The primary relational database storing core application data (user information, campaigns, survey data, etc.).
- **Responsibilities**: Persists and provides access to structured application data.
- **Key Interactions**: Accessed by the API Layer via Prisma ORM for all CRUD (Create, Read, Update, Delete) operations.

### 3.5. External Services

- **Clerk**: Handles user authentication (sign-up, sign-in, session management).
- **Stripe**: Manages payment processing, subscriptions, and billing.
- **Cint**: Provides access to survey panels for brand lift studies.
- **InsightIQ**: External analytics platform for deeper data insights (details TBC).
- **Responsibilities**: Each service provides specialized functionality that is integrated into the Justify platform.
- **Key Interactions**: The API Layer communicates with these services via their respective APIs.

### 3.6. Storage (e.g., Vercel Blob, S3)

- **Description**: Object storage for large files like creative assets, generated reports, etc.
- **Responsibilities**: Storing and serving binary data and large files.
- **Key Interactions**: Accessed by the API Layer for uploading and retrieving files.

### 3.7. Queueing Service (Conceptual)

- **Description**: Manages background tasks and asynchronous operations (e.g., sending emails, processing large reports, data synchronization).
- **Responsibilities**: Decouples long-running tasks from the synchronous API request/response cycle, improving responsiveness and reliability.
- **Key Interactions**: The API Layer can enqueue tasks, and worker processes (potentially serverless functions) would consume tasks from the queue and interact with other components like the Database.

## 4. Data Flow Examples (High-Level)

_(Action: Tech Lead/Architect to add 1-2 examples of key data flows, e.g., User Registration, Creating a Campaign, Running a Brand Lift Study.)_

### Example 1: User Registration

1.  User submits registration form on the Client Application.
2.  Client sends data to an API endpoint.
3.  API Layer forwards registration details to Clerk.
4.  Clerk handles user creation and returns a session/token.
5.  API Layer may store a reference to the Clerk user ID in the PostgreSQL Database.
6.  API Layer returns success to the Client.

## 5. Further Details

For more detailed information on specific parts of the architecture, please refer to the other documents within this `/docs/architecture` section, including:

- [Directory Structure](./directory-structure.md)
- [Core Libraries & Services](./core-libraries.md)
- [Authentication (Clerk)](./authentication.md)
- [Database (Prisma)](./database.md)

This overview is intended to be a living document and will be updated as the Justify platform evolves.
