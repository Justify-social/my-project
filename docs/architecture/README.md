# Justify Platform Architecture

**Last Reviewed:** 2025-05-09

Welcome to the architecture section of the Justify platform documentation. This area provides a comprehensive overview of our system design, key components, architectural decisions, and the rationale behind them. Our goal is to offer a clear understanding of how Justify is built, enabling developers to contribute effectively and make informed technical decisions.

This section is crucial for understanding the "how" and "why" of our technical landscape.

## Key Architectural Documents

Navigate through the following documents to gain a complete picture of our architecture:

1.  **[System Overview](./system-overview.md)**: _(Placeholder - To be created)_

    - Provides a high-level visual and textual explanation of Justify's major components and their interactions. This is the best place to start for a big-picture understanding.

2.  **[Directory Structure](./directory-structure.md)**: _(To be reviewed/updated based on previous version)_

    - The Single Source of Truth (SSOT) for the organization of our codebase (`src/`) and root configuration (`/config`). Explains the rationale behind our chosen layout.

3.  **[Core Libraries & Services](./core-libraries.md)**: _(Placeholder - To be created)_

    - Details the purpose, location, and usage guidelines for key internal code modules, such as those found in `src/lib`, `src/services`, `src/utils`, and `src/hooks`, as well as any shared platform configurations (`src/config`).

4.  **[External Integrations](./external-integrations.md)**: _(Placeholder - To be created)_

    - An overview of critical external services and third-party integrations that Justify relies on (e.g., Clerk for authentication, Stripe for payments, Cint for survey panels, InsightIQ for analytics). Explains their roles and high-level integration patterns.

5.  **Specific Technology & Pattern Deep Dives**:

    - **[Authentication (Clerk)](./authentication.md)**: _(To be created)_ Detailed information on our Clerk integration and authentication patterns.
    - **[Database (Prisma)](./database.md)**: _(To be reviewed/updated)_ Schema overview, key data models, and rationale. Links to the Prisma schema file.
    - **[State Management (TanStack Query, Zustand)](./state-management.md)**: _(To be reviewed/updated)_ Our approach to client and server state management.
    - **[Middleware](./middleware.md)**: _(To be reviewed/updated)_ Explanation of Edge function middleware and API Route helpers.
    - **[Modules & Dependency Rules](./modules.md)**: _(To be reviewed/updated)_ Guidelines for module interaction and dependency management.
    - **[Performance Strategies](./performance.md)**: _(To be reviewed/updated)_ Key strategies and considerations for application performance.

6.  **[Feature-Specific Architectures](./features/README.md)**: _(To be reviewed/updated)_

    - Detailed architectural breakdowns for complex features within Justify (e.g., Brand Lift, Campaign Wizard).

7.  **[Architecture Decision Records (ADRs)](./adr/README.md)**: _(Placeholder - To be created)_

    - A log of significant architectural decisions, including the context, decision made, and consequences. This is the SSOT for _why_ certain architectural choices were made.

8.  **[Assets (Diagrams & Images)](./assets/README.md)**: _(Placeholder - To be created)_
    - A repository for shared architectural diagrams, images, and Mermaid files used across the documentation.

## Guiding Principles

Our architecture strives to adhere to principles such as:

- **Modularity & Reusability**: Designing components and services that can be reused.
- **Scalability & Performance**: Ensuring the system can handle growth and perform efficiently.
- **Maintainability & Testability**: Writing clean, well-documented, and testable code.
- **Security**: Prioritizing secure coding practices and data protection.
- **Single Source of Truth (SSOT)**: Centralizing key information and configurations.

We encourage all developers to familiarize themselves with these documents. For any questions or clarifications, please reach out to the architecture team or your tech lead.
