# Documentation Organisation Guidelines

## Core Principles

### Single Source of Truth (SSOT)

Every concept, component, or feature should have **exactly one** authoritative document. This means:

- One canonical location for each topic
- Clear cross-references between related documents
- Deliberate organisation to prevent duplication
- Regular auditing to consolidate overlapping documents

### Naming Conventions

All documentation files must follow these naming conventions:

1. Use **kebab-case** for all filenames (e.g., `icon-system.md`, not `iconSystem.md` or `icon_system.md`)
2. Use clear, descriptive names that indicate the content (e.g., `authentication-flow.md`, not `auth.md`)
3. Avoid ambiguous terms or abbreviations in filenames
4. Prefix temporary or draft documents with `_` (e.g., `_draft-feature-plan.md`)
5. Prefix deprecated/archived documents with `archived-` (e.g., `archived-v1-architecture.md`)

### File Organisation

Documentation is organised according to these principles:

1. **Topic-Based Structure**: Files grouped by subject matter, not by document type
2. **Hierarchical Organisation**: From general to specific (overview → details)
3. **Consistent Depth**: Maximum 3 levels of directory nesting
4. **README.md Files**: Each directory should have a README.md that explains its purpose

## Improved Directory Structure

```
docs/
├── README.md                 # Introduction and navigation guide for new developers
├── CONTRIBUTING.md           # Contribution guidelines for documentation
│
├── getting-started/          # Essential information for new developers
│   ├── README.md             # Where to start for new team members
│   ├── project-overview.md   # High-level explanation of Justify
│   ├── setup-guide.md        # Development environment setup
│   ├── first-contribution.md # How to make your first code contribution
│   └── glossary.md           # Project-specific terminology
│
├── architecture/             # System architecture docs
│   ├── README.md             # Architecture overview
│   ├── directory-structure.md
│   ├── data-flow.md
│   └── ...
│
├── guides/                   # Task-focused instructions
│   ├── README.md             # Guides overview
│   ├── developer/            # Developer-focused guides
│   └── user/                 # User-focused guides
│
├── reference/                # Technical reference material
│   ├── README.md             # Reference documentation overview
│   ├── api/                  # API documentation
│   ├── configs/              # Configuration reference
│   ├── scripts/              # Scripts reference 
│   ├── ui/                   # UI reference (design tokens, style guides)
│   ├── routes/               # Application routes documentation
│   └── ...
│
├── standards/                # Coding standards and conventions
│   ├── README.md             # Standards overview
│   ├── linting/              # Linting rules and configuration
│   ├── verification/         # Code verification processes
│   ├── testing/              # Testing standards
│   └── ...
│
└── project-history/          # Historical context
    ├── README.md             # Project history overview
    └── ...
```

## Documentation Types

### 1. Overviews (`README.md`)
- Purpose: Provide high-level introduction to a topic or section
- Structure: Introduction, key concepts, navigation links
- Example: `getting-started/README.md`

### 2. Guides (How-To)
- Purpose: Provide step-by-step instructions in plain British English
- Structure: Prerequisites, steps, expected outcomes, troubleshooting
- Example: `guides/developer/setup.md`

### 3. Reference
- Purpose: Detailed technical information
- Structure: Complete, exhaustive descriptions of APIs, configurations, etc.
- Example: `reference/api/endpoints.md`

### 4. Concepts
- Purpose: Explain fundamental ideas and patterns in simple language
- Structure: Definition, context, examples, best practices
- Example: `architecture/state-management.md`

### 5. Standards
- Purpose: Define project-wide conventions and rules
- Structure: Rules, rationale, examples, enforcement
- Example: `standards/linting/eslint-config.md`

## Duplication Elimination Plan (9/10 Standard)

To achieve a 9/10 documentation standard, we must eliminate all duplicates and improve organisation:

### 1. Content Audit and Consolidation

| Issue | Action Required | Target Location | Files to Remove |
|-------|----------------|-----------------|-----------------|
| UI Component Documentation | Merge atomic design and shadcn information | `reference/ui/components/component-system.md` | `reference/ui/components/atomic-design.md` |
| Linting Guides | Move all linting content to standards directory | `standards/linting/` | `reference/configs/linting-guide.md` |
| Verification Docs | Complete migration of all verification files | `standards/verification/` | All files in `verification/` after migration |
| Routes Documentation | Consolidate all route information | `reference/routes/` | Any duplicate route docs in other locations |

### 2. Navigation Improvements for New Developers

Every directory README must include:

- **Purpose**: Clear statement of what the directory contains
- **For New Developers**: A specific section highlighting essential files for newcomers
- **Directory Contents**: A concise list of key files/subdirectories with explanations
- **Related Documentation**: Links to related content in other directories

### 3. Language Standardisation

- Use British English spelling consistently (organisation, colour, etc.)
- Replace technical jargon with plain language explanations
- Include a glossary of technical terms in `getting-started/glossary.md`
- Add "Simple explanation" sections to complex technical documents

### 4. Quality Assurance Process

To maintain 9+/10 documentation quality:

1. **Documentation Review Checklist**:
   - Confirms no duplication exists
   - Verifies consistent British English usage
   - Ensures newcomer-friendly language
   - Checks proper cross-references

2. **Quarterly Documentation Audit**:
   - Review for emerging duplicates
   - Test navigation paths with new developers
   - Update based on developer feedback
   - Remove any deprecated content

3. **Documentation PRs**:
   - Require documentation updates with code changes
   - Include "Impact on existing docs" section
   - Confirm SSOT principle is maintained

## Implementation Timeline

1. **Week 1**: Complete migration of verification and linting documentation
2. **Week 2**: Create `getting-started` directory with essential newcomer content
3. **Week 3**: Update all README files with standardised sections
4. **Week 4**: Review all content for British English and plain language
5. **Week 5**: Final cleanup of any deprecated or duplicate files

## Success Metrics (9+/10 Standard)

A 9+/10 documentation organisation must meet these criteria:

- **Zero duplication**: Each topic has exactly one authoritative source
- **Clear navigation**: New developers can find information in under 30 seconds
- **Consistent style**: All documents follow British English conventions
- **Simple language**: Complex concepts explained in plain terms
- **Maintained structure**: All new documentation follows the established patterns

## Enforcement

1. Pull request reviews must check for documentation organisation compliance
2. Quarterly documentation audits to identify and consolidate overlaps
3. Documentation linting tools to enforce naming conventions and British English
4. New developer onboarding includes documentation feedback collection
