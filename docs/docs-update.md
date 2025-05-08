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

- [x] `/docs/standards/api-design.md` populated with specific API design guidelines. (Populated 2025-05-08)
- [x] `/docs/standards/commit-messages.md` populated with full details and examples. (Populated 2025-05-08)
- [x] `/docs/standards/accessibility.md` reviewed and enhanced with specific project guidelines. (Enhanced 2025-05-08)
- [x] `/docs/standards/security.md` populated with specific project standards, procedures, and tool usage. (Populated 2025-05-08)
      **Assignee:** Tech Lead / Architect / Security Lead / Accessibility Lead / AI Assistant
      **Status:** ✅ Done (Pending Review)

---

**Ticket ID:** DOCS-RECOV-014
**Title:** Populate Placeholder Developer Guides
**Description:** Fill in the detailed content for developer guides currently marked as placeholders.
**Effort Type:** Manual Content Creation & Review
**Acceptance Criteria (AC):**

- [x] `/docs/guides/developer/debugging-guide.md` populated with Justify-specific examples and techniques. (Populated 2025-05-08)
- [x] `/docs/guides/developer/local-testing-guide.md` populated with Justify-specific commands, examples, and mocking strategies. (Populated 2025-05-08)
- [x] `/docs/guides/developer/troubleshooting.md` reviewed and populated with specific Justify error examples and solutions. (Populated 2025-05-08)
- [x] `/docs/guides/developer/features/README.md` created as placeholder index. (Created 2025-05-08)
- [ ] `/docs/guides/developer/features/` populated with relevant feature-specific developer guides (as needed).
      **Assignee:** Tech Lead / Senior Developers / QA Lead / AI Assistant
      **Status:** ✅ Done (Pending Review & Feature Guide Creation)

---

**Ticket ID:** DOCS-RECOV-015
**Title:** Validate User Guides
**Description:** Review and validate the content of all user-facing guides (`/docs/guides/user/`) against the current application.
**Effort Type:** Manual Validation & Review
**Acceptance Criteria (AC):**

- [ ] `/docs/guides/user/getting-started.md` validated for accuracy, clarity, step-by-step correctness, and presence of up-to-date screenshots/GIFs.
- [ ] `/docs/guides/user/common-tasks.md` validated for accuracy, clarity of instructions for frequent user actions, and updated screenshots/GIFs.
- [ ] `/docs/guides/user/journey.md` validated against typical user workflows, ensuring it accurately reflects the application flow and key interaction points.
- [ ] All user guides reviewed for appropriate tone and language for the target audience (Marketers, Agencies).
      **Assignee:** Product Team / QA / UX Team
      **Status:** To Do (Blocked by DOCS-RECOV-009 initial population)

---

**Ticket ID:** DOCS-RECOV-016
**Title:** Technical Documentation Accuracy Review
**Description:** Perform a final technical review of all architecture, standards, and developer guide documents to ensure accuracy, completeness, and adherence to SSOT principles.
**Effort Type:** Manual Review
**Acceptance Criteria (AC):**

- [ ] All documents in `/docs/architecture/` reviewed for technical accuracy, including diagrams and explanations. Verify alignment with actual implemented architecture.
- [ ] Content in `/docs/architecture/adr/` (when populated) reviewed for clarity of decisions, context, and consequences.
- [ ] All documents in `/docs/standards/` reviewed for technical accuracy, enforceability, and reflection of current project practices (SSOT).
- [ ] All documents in `/docs/guides/developer/` reviewed for technical accuracy, correctness of code examples, and practical usability for developers.
- [ ] Review incorporation of visuals/diagrams (e.g., Mermaid) for clarity in architecture and complex guides.
- [ ] (Future) Verify accuracy and relevance of any links pointing directly to source code.
      **Assignee:** Architect / Tech Lead(s)
      **Status:** To Do (Blocked by content population tickets 012, 013, 014)

---

**Ticket ID:** DOCS-RECOV-017
**Title:** Comprehensive Link Validation
**Description:** Check all internal links within the `/docs` directory and potentially external/code links to ensure they are valid and point to the correct locations.
**Effort Type:** Automated Tool + Manual Check
**Acceptance Criteria (AC):**

- [ ] Automated link checker (e.g., `markdown-link-check` or similar, integrated into CI if possible) run across the `/docs` directory.
- [ ] All reported broken internal Markdown links (`./`, `../`) fixed.
- [ ] Manual spot checks performed on key navigational links (TOC, cross-references between core sections like Getting Started -> Architecture).
- [ ] (Future) Verification strategy defined and executed for links pointing to external sites or specific lines of code (recognizing their potential fragility).
      **Assignee:** AI Assistant (Initial Check Possible) / Tech Lead / Documentation Lead
      **Status:** To Do (Blocked by content population & review tickets)

---

**Ticket ID:** DOCS-RECOV-018
**Title:** Refinement, Polish & Gitbook Preview
**Description:** Perform a final review of all documentation for consistency, style, formatting, and effective cross-linking. Ensure optimal rendering and usability in GitBook.
**Effort Type:** Manual Review & Refinement
**Acceptance Criteria (AC):**

- [ ] Consistent terminology used throughout, aligning with `/docs/concepts/glossary.md`. Perform a specific check for term consistency **and ensure key terms link back to the glossary where appropriate**.
- [ ] Consistent formatting applied (headings, code blocks, lists, admonitions/callouts if used).
- [ ] Tone reviewed and confirmed appropriate for the target audience of each section (e.g., onboarding vs. deep architecture).
- [ ] Documentation successfully builds and renders correctly in a Gitbook preview environment without errors.
- [ ] GitBook navigation structure (left sidebar) accurately reflects `SUMMARY.md`.
- [ ] Cross-linking between related documents reviewed for effectiveness and sufficiency (e.g., standards linked from guides, architecture linked from concepts, onboarding sections linked sequentially).
- [ ] Spot check rendering on different screen sizes (desktop, tablet) within GitBook preview.
      **Assignee:** Documentation Lead / Tech Lead / AI Assistant (for consistency checks)
      **Status:** To Do (Blocked by content population & review tickets)

---

**Ticket ID:** DOCS-RECOV-019
**Title:** Turbopack Guide Decision & Action
**Description:** Confirm Turbopack relevance, move/update the guide, and ensure links are correct.
**Effort Type:** Decision & Manual Content Creation/Deletion/Review
**Acceptance Criteria (AC):**

- [x] Decision made by Tech Lead regarding Turbopack relevance (Determined Relevant 2025-05-08).
- [x] Existing guide moved from `docs/guides/TURBOPACK.md` to `docs/guides/developer/turbopack.md` (Done 2025-05-08).
- [x] Links in `SUMMARY.md`, `glossary.md`, `guides/developer/README.md` verified/updated (Done 2025-05-08).
- [ ] Content of `docs/guides/developer/turbopack.md` reviewed and updated for technical accuracy, reflecting current project usage (e.g., env var activation), stability status (`dev` stable, `build` alpha), and alignment with official Next.js Turbopack documentation.
      **Assignee:** Tech Lead
      **Status:** In Progress (Content Review Pending)

---

**Ticket ID:** DOCS-RECOV-020
**Title:** Establish Documentation Maintenance Process
**Description:** Define and document the definitive ongoing process for keeping all project documentation accurate, up-to-date, and discoverable.
**Effort Type:** Process Definition & Documentation
**Acceptance Criteria (AC):**

- [ ] Clear ownership defined for each major section/document within `/docs`.
- [ ] Process defined for triggering documentation updates alongside relevant code changes (e.g., mandatory part of PR checklist for features affecting documented areas, automated reminders?).
- [ ] Regular review cadence established and documented (e.g., quarterly owner reviews, pre-release checks).
- [ ] Mechanism for team members to easily report documentation issues or suggest improvements defined **and documented** (e.g., specific GitHub label, Slack channel, GitBook feedback button if applicable).
- [ ] Process for adding new documentation (e.g., new ADRs, feature guides) defined.
- [ ] The complete maintenance process, including ownership, triggers, cadence, and feedback loop, is documented within `/docs/documentation-guide.md`.
      **Assignee:** Tech Lead / Documentation Lead
      **Status:** To Do

---

## Documentation Improvement Backlog (Post-Recovery)

These tickets capture enhancements identified during the recovery review to further elevate documentation quality beyond the initial reconstruction scope.

**Ticket ID:** DOCS-IMPROVE-001
**Title:** Deepen Technical Content & SSOT Links
**Description:** Enhance the documentation's role as a Single Source of Truth by directly linking to code artifacts and capturing architectural decisions.
**Effort Type:** Manual Content Enhancement & Tooling (Potentially)
**Acceptance Criteria (AC):**

- [ ] Key architectural documents (`architecture/*`) systematically reviewed to add links to relevant source code files/directories (e.g., using Git provider permalinks).
- [ ] Core standards documents (`standards/*`) reviewed to link principles/rules to specific code examples or configuration files.
- [ ] Core developer guides (`guides/developer/*`) reviewed to link steps or concepts to relevant source code.
- [ ] Process established for maintaining code links during refactoring (may require tooling or specific PR review focus).
- [ ] `/docs/architecture/adr/` directory populated with initial set of critical Architecture Decision Records (ADRs) covering past significant technical choices (e.g., technology selection, major patterns).
- [ ] Template and process for creating new ADRs defined (potentially in `documentation-guide.md`).
      **Assignee:** Architect / Tech Lead(s) / Senior Developers
      **Status:** To Do (Post-Recovery)

---

**Ticket ID:** DOCS-IMPROVE-002
**Title:** Enhance Comprehension (Diagrams & Practical Guides)
**Description:** Improve understanding and practical application of documentation through visualizations and enhanced guides.
**Effort Type:** Manual Content Creation & Enhancement
**Acceptance Criteria (AC):**

- [ ] Key architectural documents (`system-overview.md`, potentially others) enhanced with Mermaid.js diagrams illustrating component interactions, data flows, or request lifecycles.
- [ ] Core developer guides reviewed; code examples verified for correctness and enhanced for clarity/runnability where possible.
- [ ] New task-oriented developer guides created based on common developer needs (e.g., "How to Add a New API Endpoint", "How to Add a UI Component Following Atomic Design").
- [ ] `/docs/guides/developer/features/` populated with initial practical guides for at least 1-2 core complex features (e.g., Campaign Wizard, Brand Lift), focusing on common development/customization tasks for those features.
      **Assignee:** Architect / Tech Lead(s) / Feature Leads / Senior Developers
      **Status:** To Do (Post-Recovery)

---

**Ticket ID:** DOCS-IMPROVE-003
**Title:** Explore Auto-Generated Documentation (Future)
**Description:** Investigate the feasibility and value of auto-generating specific documentation sections to improve accuracy and reduce maintenance overhead.
**Effort Type:** Investigation & Potential Implementation
**Acceptance Criteria (AC):**

- [ ] Investigate tools/techniques for generating API Reference (`api-reference.md`) from code (e.g., OpenAPI/Swagger specs via JSDoc/TSDoc comments).
- [ ] Investigate tools/techniques for generating component prop documentation from TypeScript types/interfaces (if a dedicated component library section is built).
- [ ] Assess effort vs. reward for implementation.
- [ ] Decision documented (e.g., in an ADR or `documentation-guide.md`) on whether/how to proceed with auto-generation for specific sections.
      **Assignee:** Tech Lead / Architect
      **Status:** Future Consideration

---

**Ticket ID:** DOCS-IMPROVE-004
**Title:** Explore Advanced GitBook Features (Future)
**Description:** Investigate leveraging advanced GitBook features to enhance documentation usability and interactivity.
**Effort Type:** Investigation & Potential Implementation
**Acceptance Criteria (AC):**

- [ ] Investigate GitBook features like Tabs, Hints (callouts), Content Snippets/Includes, custom integrations (e.g., CodeSandbox embeds).
- [ ] Identify areas in the existing documentation where these features could significantly improve clarity or user experience.
- [ ] Assess implementation effort.
- [ ] Decision documented on which advanced features to adopt, with guidelines added to `documentation-guide.md` if applicable.
      **Assignee:** Documentation Lead / Tech Lead
      **Status:** Future Consideration

---
