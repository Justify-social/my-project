# Documentation Reconstruction Plan (Jira Format)

**Project:** Justify Documentation Overhaul & Recovery
**Date Created:** 2025-05-08
**Overall Status:** Recovery In Progress (Updated 2025-05-09)

This plan outlines the definitive target structure and the tasks required to reconstruct the `/docs` directory according to the "110% Best Practice" standard after the data loss incident.

## Target `/docs` Directory Structure (110% Best Practice)

This structure prioritizes clarity, discoverability, logical sequencing for new developers, SSOT principles, and anticipates future needs.

```text
/docs
├── README.md                     # **ENTRY POINT:** Welcome, purpose of Justify, purpose of these docs, **links to 3-5 ESSENTIAL starting points** (Overview, Setup, Arch Overview, How to Contribute). Link to Documentation Guide. **Strictly Navigation.**
│
├── getting-started/              # **FIRST STOP:** Essential Onboarding.
│   ├── README.md                 # Index: Links to Overview, Setup, Goals, Key Workflows. Link to Roadmap tool.
│   ├── project-overview.md       # What Justify IS: Core purpose, value prop, key features, user types. (SSOT for high-level 'What').
│   ├── developer-setup.md        # SSOT: Environment setup (`.env.local` guidance), install (`npm install`), DB setup (`prisma migrate`), run dev server (`npm run dev`). **Actionable.**
│   ├── project-goals.md          # Why we're building this: Vision, Business Goals, Personas (Requires strategic input).
│   └── key-workflows.md          # [NEW] How we work: Debugging, local testing, using Storybook/UI Browser, environment management basics.
│
├── architecture/                 # **SECOND STOP:** System Design & Rationale.
│   ├── README.md                 # Overview of architecture section. Links to System Overview, ADR Index, Key Sections (Code Structure, Core Libs, Externals).
│   ├── system-overview.md        # [NEW] High-level components & interactions diagram/explanation. The big picture.
│   ├── directory-structure.md    # SSOT: Code (`src/`) & root (`/config`) layout rationale. **Definitive.**
│   ├── core-libraries.md         # [NEW] Purpose & location of key internal code (`src/lib`, `src/services`, `src/utils`, `src/hooks`, `src/config`).
│   ├── external-integrations.md  # [Promoted] SSOT: Overview of critical external services (Clerk, Stripe, Cint, InsightIQ etc.) & their roles.
│   ├── authentication.md         # [Renamed] SSOT: Clerk integration details & patterns.
│   ├── database.md               # SSOT: Schema overview, key models, rationale. Link to Prisma schema file.
│   ├── state-management.md       # SSOT: TanStack Query, Zustand usage & patterns.
│   ├── middleware.md             # SSOT: Edge & API Route Helpers explained.
│   ├── modules.md                # Module dependency rules & interaction patterns.
│   ├── performance.md            # [Renamed] Performance strategies & considerations.
│   ├── features/                 # Detailed architecture for complex features.
│   │   ├── README.md             # Index of feature architecture docs.
│   │   ├── brand-lift.md         # Brand Lift feature architecture.
│   │   ├── campaign-wizard.md    # Campaign Wizard architecture.
│   │   ├── influencer-discovery.md # Influencer Discovery architecture.
│   │   └── reporting.md          # Reporting system architecture.
│   ├── assets/                   # Shared diagrams, images, Mermaid files.
│   │   └── README.md             # Index/description of assets.
│   └── adr/                      # Architecture Decision Records (SSOT for key decisions).
│       └── README.md             # Index of ADRs.
│
├── concepts/                     # **REFERENCE:** Domain Knowledge & Terminology.
│   ├── README.md                 # Overview & index for core concepts.
│   ├── glossary.md               # SSOT: Definitions of technical & domain terms (e.g., Brand Lift, KPI, RSC, SSOT).
│   ├── insightiq-integration.md  # [NEW - Placeholder] Explanation of InsightIQ's role, data sync concepts (if complex).
│   └── cint-integration.md       # [NEW - Placeholder] Explanation of Cint's role for Brand Lift panels (if applicable).
│   # [Optional] Files explaining core marketing concepts (e.g., brand-lift-explained.md).
│
├── guides/                       # **REFERENCE (How-To):** Performing Specific Tasks.
│   ├── README.md                 # Index for all guides.
│   │
│   ├── developer/                # Guides for developing/working on the codebase.
│   │   ├── README.md             # Index for developer guides.
│   │   ├── contributing.md       # SSOT: Dev workflow, PR process, branching (links to relevant standards).
│   │   ├── debugging-guide.md    # [NEW - Placeholder] Practical steps for debugging frontend/backend.
│   │   ├── deployment.md         # Deployment process (Vercel, etc.).
│   │   ├── icon-system-guide.md  # Using the icon system.
│   │   ├── local-testing-guide.md # [NEW - Placeholder] How to run & write unit/integration tests locally.
│   │   ├── troubleshooting.md    # Common developer issues & solutions (Requires population).
│   │   ├── turbopack.md          # Using Turbopack (Confirm relevance/rename if deprecated).
│   │   └── features/             # How-to guides for *developing* specific features.
│   │       └── README.md         # Index for feature-specific dev guides.
│   │       # (Populate with guides like campaign-wizard-customization.md).
│   │
│   └── user/                     # Guides for end-users (Marketers, Agencies).
│       ├── README.md             # Index for user guides.
│       ├── getting-started.md    # First steps for users (Requires validation).
│       ├── common-tasks.md       # How-to for frequent user actions (Requires validation).
│       └── journey.md            # Overview of key user flows (Requires validation).
│
├── standards/                    # **REFERENCE (Rules):** Definitive Project Rules & Conventions.
│   ├── README.md                 # Index for standards documents.
│   ├── code-standards.md         # SSOT: Core coding standards (TS, React, CSS). **High-level principles.**
│   ├── naming-conventions.md     # SSOT: File, variable, component naming rules.
│   ├── linting-formatting.md     # SSOT: ESLint/Prettier rules, setup, usage. **Specific tool config.**
│   ├── testing-strategy.md       # SSOT: Unit, integration, E2E testing approach & tools.
│   ├── api-design.md             # SSOT: Guidelines for designing internal APIs (consistency, error handling).
│   ├── commit-messages.md        # SSOT: Conventional Commits standard explanation/link.
│   ├── accessibility.md          # SSOT: Specific a11y guidelines & targets.
│   └── security.md               # SSOT: Secure coding practices, dependency policies. **Link to root SECURITY.md**.
│
├── api-reference.md              # [Moved] Auto-generated or manually maintained API endpoint details. Kept separate for focus.
│
└── documentation-guide.md        # SSOT: How we write and manage documentation (Meta-doc).
```

**Removed Directories (Must NOT be present post-cleanup):**

- `/docs/_archive/`
- `/docs/authentication/`
- `/docs/components/`

---

## Reconstruction Tasks (Jira Format)

_(Definition of Done: For AI-involved tasks, 'Done' means content/structure generated based on available info/history, freshness indicators added where possible, pending Manual Review/Action as noted. Manual tasks require completion by assigned team member.)_

**Ticket ID:** DOCS-RECOV-001
**Title:** Recreate Root Documentation Files
**Description:** Recreate the essential files located directly within the `/docs` root directory.
**Effort Type:** AI Generation, Manual Review
**Acceptance Criteria (AC):**

- [x] `/docs/README.md` recreated (2025-05-08).
- [x] `/docs/documentation-guide.md` recreated (2025-05-08).
- [x] `/docs/contributing.md` located/verified (Note: Target location is `guides/developer/contributing.md` - See DOCS-RECOV-008).
- [x] `/docs/api-reference.md` recreated with code-derived endpoint list (Needs review/elaboration).
- [x] Ensure all files have `Last Reviewed: YYYY-MM-DD` (Added 2025-05-08 where possible).
      **Assignee:** AI Assistant (Generation), Tech Lead (Review)
      **Status:** ✅ Done (Pending Review & Elaboration on API Ref)

---

**Ticket ID:** DOCS-RECOV-002
**Title:** Recreate `getting-started/` Section
**Description:** Recreate the core onboarding documents for new developers.
**Acceptance Criteria (AC):**

- [x] `/docs/getting-started/README.md` recreated with correct index and sequence (2025-05-09).
- [x] `/docs/getting-started/project-overview.md` recreated (content based on previous version, refined 2025-05-09).
- [x] `/docs/getting-started/developer-setup.md` created (SSOT for setup steps, content added 2025-05-09).
- [x] `/docs/getting-started/project-goals.md` recreated (populated with vision/personas from existing docs, noted need for strategic input for Goals/UVP, 2025-05-09).
- [x] `/docs/getting-started/key-workflows.md` created (content added for debugging, testing, Storybook/UI Browser, env management, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files updated/created 2025-05-09).
      **Assignee:** AI Assistant (content generation), Product Lead (Goals/UVP input), Tech Lead (Setup/Workflow content & review)
      **Status:** ✅ Done (Pending Review of generated content and strategic input for Project Goals)

---

**Ticket ID:** DOCS-RECOV-003
**Title:** Recreate `architecture/` Core Structure & Overviews
**Description:** Recreate the main README, system overview, and foundational architecture documents.
**Acceptance Criteria (AC):**

- [x] `/docs/architecture/` directory exists (2025-05-08).
- [x] `/docs/architecture/README.md` recreated (linking to key sections, 2025-05-09).
- [x] `/docs/architecture/system-overview.md` created (placeholder structure with diagram prompt, needs content, 2025-05-09).
- [x] `/docs/architecture/directory-structure.md` recreated (based on previous version, reviewed and updated 2025-05-09).
- [x] `/docs/architecture/core-libraries.md` created (placeholder structure, needs content for `src/lib`, `services`, `utils`, `hooks`, 2025-05-09).
- [x] `/docs/architecture/external-integrations.md` created (placeholder structure for Clerk, Stripe, Cint, InsightIQ roles, needs content, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files updated/created 2025-05-09).
      **Assignee:** AI Assistant (content generation), Architect/Tech Lead (review & content for placeholders)
      **Status:** ✅ Done (Pending Review & Content for placeholders)

---

**Ticket ID:** DOCS-RECOV-004
**Title:** Recreate `architecture/` Specific Technology Docs
**Description:** Recreate detailed documents for specific architectural areas (Auth, DB, State, Middleware, etc.).
**Acceptance Criteria (AC):**

- [x] `/docs/architecture/authentication.md` created (based on previous Clerk content, 2025-05-09).
- [x] `/docs/architecture/database.md` recreated (based on Prisma schema analysis, 2025-05-09).
- [x] `/docs/architecture/state-management.md` recreated (based on previous version, 2025-05-09).
- [x] `/docs/architecture/middleware.md` recreated (based on previous version, reviewed and updated 2025-05-09).
- [x] `/docs/architecture/modules.md` recreated (based on previous version, reviewed and updated 2025-05-09).
- [x] `/docs/architecture/performance.md` recreated (based on previous version, expanded 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files created/updated 2025-05-09).
      **Assignee:** AI Assistant (content generation), Architect/Tech Lead (review)
      **Status:** ✅ Done (Pending Review)

---

**Ticket ID:** DOCS-RECOV-005
**Title:** Recreate `architecture/features/` Section
**Description:** Recreate the structure and populated architecture documents for key features.
**Acceptance Criteria (AC):**

- [x] `/docs/architecture/features/` directory exists (2025-05-08).
- [x] `/docs/architecture/features/README.md` recreated (index created, 2025-05-09).
- [x] `/docs/architecture/features/brand-lift.md` created (based on previous populated version analysis, needs dev review, 2025-05-09).
- [x] `/docs/architecture/features/campaign-wizard.md` recreated (based on previous version analysis, 2025-05-09).
- [x] `/docs/architecture/features/influencer-discovery.md` recreated (based on previous populated version analysis, needs dev review, 2025-05-09).
- [x] `/docs/architecture/features/reporting.md` recreated (based on previous populated version analysis, needs dev review, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files created/updated 2025-05-09).
      **Assignee:** AI Assistant (content generation), Feature Leads (review)
      **Status:** ✅ Done (Pending Review)

---

**Ticket ID:** DOCS-RECOV-006
**Title:** Recreate `architecture/` Support Directories (Assets, ADRs)
**Description:** Create the structure and index files for architectural assets and decision records.
**Acceptance Criteria (AC):**

- [x] `/docs/architecture/assets/` directory exists (Verified path).
- [x] `/docs/architecture/adr/` directory exists (Verified path).
- [x] `/docs/architecture/assets/README.md` created (placeholder index, 2025-05-09).
- [x] `/docs/architecture/adr/README.md` created (placeholder index, explaining ADR purpose, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (Files created 2025-05-09).
      **Assignee:** AI Assistant
      **Status:** ✅ Done

---

**Ticket ID:** DOCS-RECOV-007
**Title:** Recreate `concepts/` Section
**Description:** Recreate the glossary and placeholders for core concept explanations.
**Acceptance Criteria (AC):**

- [x] `/docs/concepts/` directory exists (Verified path).
- [x] `/docs/concepts/README.md` recreated (index created, 2025-05-09).
- [x] `/docs/concepts/glossary.md` recreated (based on previous version, updated 2025-05-09).
- [x] `/docs/concepts/insightiq-integration.md` created (placeholder needs content, 2025-05-09).
- [x] `/docs/concepts/cint-integration.md` created (placeholder needs content, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files created/updated 2025-05-09).
      **Assignee:** AI Assistant (content generation), Tech Lead (review placeholders & content)
      **Status:** ✅ Done (Pending Review & Content for placeholders)

---

**Ticket ID:** DOCS-RECOV-008
**Title:** Recreate `guides/` Structure & Developer Guides
**Description:** Recreate the guides index, developer guides structure, and core developer guide content.
**Acceptance Criteria (AC):**

- [x] `/docs/guides/developer/features/` directory exists (Verified path).
- [x] `/docs/guides/README.md` recreated (index, 2025-05-09).
- [x] `/docs/guides/developer/README.md` recreated (index, 2025-05-09).
- [x] `/docs/guides/developer/contributing.md` created (content moved/recreated from root `docs/contributing.md`, updated 2025-05-09).
- [x] `/docs/guides/developer/debugging-guide.md` created (placeholder needs content, 2025-05-09).
- [x] `/docs/guides/developer/deployment.md` recreated (based on previous version, 2025-05-09).
- [x] `/docs/guides/developer/icon-system-guide.md` recreated (based on previous version, 2025-05-09).
- [x] `/docs/guides/developer/local-testing-guide.md` created (placeholder needs content, 2025-05-09).
- [x] `/docs/guides/developer/troubleshooting.md` recreated (based on previous structure, needs content completion, 2025-05-09).
- [x] `/docs/guides/developer/turbopack.md` skipped (Previous guide found, but relevance needs confirmation; potentially deprecated).
- [x] `/docs/guides/developer/features/README.md` recreated (placeholder index, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files created/updated 2025-05-09).
      **Assignee:** AI Assistant (content generation), Tech Lead (review, confirm Turbopack, add guide content)
      **Status:** ✅ Done (Pending Review & Content for placeholders; Turbopack guide skipped)

---

**Ticket ID:** DOCS-RECOV-009
**Title:** Recreate `guides/user/` Section
**Description:** Recreate the user guide structure and content.
**Acceptance Criteria (AC):**

- [x] `/docs/guides/user/` directory exists (Verified path).
- [x] `/docs/guides/user/README.md` recreated (index, 2025-05-09).
- [x] `/docs/guides/user/getting-started.md` recreated (based on previous version, needs validation, 2025-05-09).
- [x] `/docs/guides/user/common-tasks.md` recreated (based on previous version, needs validation, 2025-05-09).
- [x] `/docs/guides/user/journey.md` recreated (based on previous version, needs validation, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files created/updated 2025-05-09).
      **Assignee:** AI Assistant (content generation), Product/QA/UX (validation)
      **Status:** ✅ Done (Pending Validation)

---

**Ticket ID:** DOCS-RECOV-010
**Title:** Recreate `standards/` Section
**Description:** Recreate the standards documents according to the enhanced structure.
**Acceptance Criteria (AC):**

- [x] `/docs/standards/` directory exists (Verified path).
- [x] `/docs/standards/README.md` recreated (index, 2025-05-09).
- [x] `/docs/standards/code-standards.md` recreated (based on previous version, excluding linting/formatting, 2025-05-09).
- [x] `/docs/standards/naming-conventions.md` recreated (based on previous version, 2025-05-09).
- [x] `/docs/standards/linting-formatting.md` created (extracting relevant info from old code-standards, 2025-05-09).
- [x] `/docs/standards/testing-strategy.md` recreated (based on previous version, 2025-05-09).
- [x] `/docs/standards/api-design.md` created (placeholder needs content, 2025-05-09).
- [x] `/docs/standards/commit-messages.md` created (placeholder needs content, 2025-05-09).
- [x] `/docs/standards/accessibility.md` created (placeholder needs content, 2025-05-09).
- [x] `/docs/standards/security.md` created (placeholder needs content, 2025-05-09).
- [x] Ensure all files have correct freshness indicators (All files created/updated 2025-05-09).
      **Assignee:** AI Assistant (content generation), Tech Lead/Architect (review & content)
      **Status:** ✅ Done (Pending Review & Content for placeholders)

---

**Ticket ID:** DOCS-RECOV-012
**Title:** Populate Placeholder Architecture Documents
**Description:** Fill in the detailed content for core architecture documents currently marked as placeholders.
**Effort Type:** Manual Content Creation & Review
**Acceptance Criteria (AC):**

- [x] `/docs/architecture/system-overview.md` populated with accurate diagram and component explanations (2025-05-09).
- [x] `/docs/architecture/core-libraries.md` populated with details on `src/lib`, `services`, `utils`, `hooks`, `config` (2025-05-09).
- [x] `/docs/architecture/external-integrations.md` populated with confirmed details for Clerk, Stripe, Cint, InsightIQ, UploadThing, Resend (2025-05-09).
      **Assignee:** Architect / Tech Lead / AI Assistant
      **Status:** ✅ Done (Pending Review)

---

**Ticket ID:** DOCS-RECOV-013
**Title:** Populate Placeholder Standards Documents
**Description:** Fill in the detailed content for standards documents currently marked as placeholders.
**Effort Type:** Manual Content Creation & Review
**Acceptance Criteria (AC):**

- [ ] `/docs/standards/api-design.md` populated with specific API design guidelines.
- [ ] `/docs/standards/commit-messages.md` populated with full details and examples (if Conventional Commits link isn't sufficient).
- [ ] `/docs/standards/accessibility.md` populated with specific project guidelines, testing procedures, and tool usage.
- [ ] `/docs/standards/security.md` populated with specific project standards, procedures, and tool usage.
      **Assignee:** Tech Lead / Architect / Security Lead / Accessibility Lead
      **Status:** To Do (Blocked by DOCS-RECOV-010 Review)

---

**Ticket ID:** DOCS-RECOV-014
**Title:** Populate Placeholder Developer Guides
**Description:** Fill in the detailed content for developer guides currently marked as placeholders.
**Effort Type:** Manual Content Creation & Review
**Acceptance Criteria (AC):**

- [ ] `/docs/guides/developer/debugging-guide.md` populated with Justify-specific examples and techniques.
- [ ] `/docs/guides/developer/local-testing-guide.md` populated with Justify-specific commands, examples, and mocking strategies.
- [ ] `/docs/guides/developer/troubleshooting.md` reviewed and populated with specific Justify error examples and solutions.
- [ ] `/docs/guides/developer/features/` populated with relevant feature-specific developer guides (as needed).
      **Assignee:** Tech Lead / Senior Developers / QA Lead
      **Status:** To Do (Blocked by DOCS-RECOV-008 Review)

---

**Ticket ID:** DOCS-RECOV-015
**Title:** Validate User Guides
**Description:** Review and validate the content of all user-facing guides against the current application.
**Effort Type:** Manual Validation & Review
**Acceptance Criteria (AC):**

- [ ] `/docs/guides/user/getting-started.md` validated for accuracy, clarity, and up-to-date screenshots.
- [ ] `/docs/guides/user/common-tasks.md` validated for accuracy and clarity of steps.
- [ ] `/docs/guides/user/journey.md` validated against typical user workflows.
      **Assignee:** Product Team / QA / UX Team
      **Status:** To Do (Blocked by DOCS-RECOV-009 Review)

---

**Ticket ID:** DOCS-RECOV-016
**Title:** Technical Documentation Accuracy Review
**Description:** Perform a final technical review of all architecture, standards, and developer guide documents.
**Effort Type:** Manual Review
**Acceptance Criteria (AC):**

- [ ] All documents in `/docs/architecture/` reviewed for technical accuracy.
- [ ] All documents in `/docs/standards/` reviewed for technical accuracy and enforceability.
- [ ] All documents in `/docs/guides/developer/` reviewed for technical accuracy.
      **Assignee:** Architect / Tech Lead(s)
      **Status:** To Do (Blocked by content population tickets 012, 013, 014)

---

**Ticket ID:** DOCS-RECOV-017
**Title:** Comprehensive Link Validation
**Description:** Check all internal links within the `/docs` directory to ensure they are valid and point to the correct locations.
**Effort Type:** Manual Check / Automated Tool
**Acceptance Criteria (AC):**

- [ ] Automated link checker run across `/docs`.
- [ ] All reported broken internal links fixed.
- [ ] Manual spot checks performed on key navigational links.
      **Assignee:** AI Assistant (Initial Check Possible) / Tech Lead / Documentation Lead
      **Status:** To Do (Blocked by content population tickets)

---

**Ticket ID:** DOCS-RECOV-018
**Title:** Refinement, Polish & Gitbook Preview
**Description:** Review all documentation for consistency in tone, style, formatting. Refine content based on Gitbook previews.
**Effort Type:** Manual Review & Refinement
**Acceptance Criteria (AC):**

- [ ] Consistent terminology used throughout (referencing `glossary.md`).
- [ ] Consistent formatting applied (headings, code blocks, lists).
- [ ] Tone is appropriate for the target audience of each section.
- [ ] Documentation builds and renders correctly in a Gitbook preview environment.
- [ ] Cross-linking between related documents is effective and sufficient.
      **Assignee:** Documentation Lead / Tech Lead / AI Assistant (for consistency checks)
      **Status:** To Do (Blocked by content population & review tickets)

---

**Ticket ID:** DOCS-RECOV-019
**Title:** Turbopack Guide Decision & Action
**Description:** Confirm if Turbopack is actively used/supported. Create/update the guide if relevant, or remove references if deprecated.
**Effort Type:** Decision & Manual Content Creation/Deletion
**Acceptance Criteria (AC):**

- [ ] Decision made by Tech Lead regarding Turbopack relevance.
- [ ] If relevant: `/docs/guides/developer/turbopack.md` created/updated with accurate information.
- [ ] If deprecated: `/docs/guides/developer/turbopack.md` file deleted and all links/references to it removed from other documents.
      **Assignee:** Tech Lead
      **Status:** To Do

---

**Ticket ID:** DOCS-RECOV-020
**Title:** Establish Documentation Maintenance Process
**Description:** Define and document the ongoing process for keeping documentation accurate and up-to-date.
**Effort Type:** Process Definition
**Acceptance Criteria (AC):**

- [ ] Process defined for assigning ownership of documents/sections.
- [ ] Process defined for updating documentation alongside code changes (e.g., part of PR checklist).
- [ ] Regular review cadence established (e.g., quarterly).
- [ ] Maintenance process documented (e.g., within `documentation-guide.md`).
      **Assignee:** Tech Lead / Documentation Lead
      **Status:** To Do

---
