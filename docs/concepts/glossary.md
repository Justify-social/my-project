# Project Glossary

**Last Reviewed**: 2025-05-09

This document defines key terms, acronyms, and concepts specific to the Justify Marketing Intelligence Platform.

---

- **ADR (Architecture Decision Record):** A document capturing a significant architectural decision, its context, and consequences. Stored in `/docs/architecture/adr/`.

- **Brand Health Monitoring:** A feature set focused on tracking metrics like audience sentiment, competitive share of voice, and brand loyalty indicators over time.

- **Brand Lift:** A measurement of the direct impact a marketing campaign has on key brand metrics such as awareness, consideration, favourability, and purchase intent. Typically measured via pre/post campaign surveys.

- **Brand Lift Measurement:** The process of quantifying the impact of a marketing campaign on key brand perception metrics (like awareness, consideration, intent). Typically involves surveying exposed vs. control groups before and after campaign exposure. See `BrandLiftStudy` model in `schema.prisma` and [Brand Lift Feature Architecture](../architecture/features/brand-lift.md).

- **Bundle Analysis:** The process of inspecting the contents of JavaScript bundles generated during the build process to identify large dependencies or opportunities for optimization. Often done using tools like `@next/bundle-analyzer`.

- **Campaign Wizard:** The multi-step user interface within the platform used to create and configure marketing campaigns. See [Campaign Wizard Architecture](../architecture/features/campaign-wizard.md).

- **Cint:** A third-party service integrated to provide access to survey panels for Brand Lift studies. See [External Integrations](../architecture/external-integrations.md).

- **Clerk:** The third-party service used as the Single Source of Truth (SSOT) for user authentication and identity management. See [Authentication Architecture](../architecture/authentication.md).

- **Code Splitting:** The process of splitting application code into smaller chunks that can be loaded on demand, improving initial page load times. Next.js does this automatically by page, and it can be further controlled with dynamic imports.

- **Creative Asset Testing:** A feature allowing users to A/B test different versions of campaign creative assets (images, videos) to compare performance and audience reactions.

- **Dynamic Import (`next/dynamic`):** A Next.js feature allowing components or libraries to be loaded asynchronously, only when they are needed, improving initial bundle size.

- **E2E (End-to-End) Tests:** Automated tests that simulate real user journeys through the entire application stack (frontend UI -> API -> Database). May use tools like Cypress. See [Testing Strategy](../standards/testing-strategy.md).

- **Edge Functions:** Serverless functions that run geographically close to the user (at the "edge" of the network), often used for Next.js Middleware to reduce latency for tasks like authentication checks or redirects.

- **GitBook:** A documentation platform. The structure and format of this `/docs` directory should aim for compatibility with GitBook generation.

- **Influencer Discovery:** The process and feature set focused on identifying suitable social media influencers based on metrics like authentic engagement, audience alignment, and brand safety. See [Influencer Discovery Architecture](../architecture/features/influencer-discovery.md).

- **InsightIQ:** An external service integrated as a primary source for influencer profiles and analytics data. See [External Integrations](../architecture/external-integrations.md).

- **Integration Tests:** Automated tests that verify the interaction between multiple units or components within a specific feature or bounded context. See [Testing Strategy](../standards/testing-strategy.md).

- **KPI (Key Performance Indicator):** A measurable value that demonstrates how effectively a campaign is achieving key objectives. Specific KPIs used in the platform are defined in the `KPI` enum in `schema.prisma` (e.g., `BRAND_AWARENESS`, `PURCHASE_INTENT`).

- **Lazy Loading:** A performance optimization technique where resources (like images or components) are only loaded when they are about to become visible in the viewport or are needed by the application.

- **Middleware:** Code that runs before a request is processed by the main application logic. In Next.js, refers to Edge Middleware (`src/middleware.ts`) and potentially helper functions used within API routes. See [Middleware Architecture](../architecture/middleware.md).

- **Mixed Media Modelling (MMM):** An analytical approach used to estimate the impact of different marketing channels (social, search, TV, etc.) on sales or other outcomes, enabling budget optimisation.

- **ORM (Object-Relational Mapper):** A tool that maps database tables to objects in application code, simplifying database interactions. We use Prisma.

- **Prisma:** The Object-Relational Mapper (ORM) used to interact with the PostgreSQL database. Schema defined in `config/prisma/schema.prisma`. See [Database Architecture](../architecture/database.md).

- **RSC (React Server Components):** Components that run exclusively on the server, allowing direct data access and reducing client-side bundle size. The default component type in the Next.js App Router unless marked with `'use client'`.

- **Shadcn UI:** A collection of reusable UI components built using Radix UI and Tailwind CSS, heavily used as the foundation for this project's UI library (`src/components/ui/`).

- **SSOT (Single Source of Truth):** A core principle ensuring that every piece of data, configuration, or documentation has exactly one authoritative source to prevent inconsistency and duplication.

- **Storybook:** A tool used for developing, testing, and documenting UI components in isolation.

- **Stripe:** The third-party service used for payment processing and subscription management. See [External Integrations](../architecture/external-integrations.md).

- **TanStack Query (React Query):** The library used for managing server state, including data fetching, caching, and synchronization. See [State Management Strategy](../architecture/state-management.md).

- **Tree Shaking:** A build optimization process that removes unused code (dead code elimination) from the final JavaScript bundles.

- **Turbopack:** An experimental, high-performance bundler for JavaScript and TypeScript, usable as an alternative to Webpack during Next.js development. See [Turbopack Configuration Guide](../guides/developer/turbopack.md) (if present).

- **Unit Tests:** Automated tests that verify the smallest testable parts of the application (e.g., individual functions, simple components) in isolation. See [Testing Strategy](../standards/testing-strategy.md).

- **Zod:** A TypeScript-first schema declaration and validation library. Used extensively for validating API request data and form inputs.

- **Zustand:** The library used for managing complex or shared client-side state. See [State Management Strategy](../architecture/state-management.md).
