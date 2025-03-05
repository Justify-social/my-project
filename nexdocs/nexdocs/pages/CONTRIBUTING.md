# Contributing to Documentation

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Documentation Team

## Overview

This document outlines the guidelines for contributing to the Campaign Wizard documentation. Following these guidelines ensures consistency and quality across all documentation.

## Documentation Structure

Our documentation follows a specific structure:

```
/docs
├── README.md                                # Main documentation hub with navigation guide
├── CONTRIBUTING.md                          # Documentation guidelines (this file)
│
├── features-frontend/                       # User-facing features
│   ├── README.md                            # Overview of frontend features
│   │
│   ├── [feature-name]/                      # Feature-specific folder
│       ├── overview.md                      # Feature description and purpose
│       ├── usage.md                         # How to use this feature
│       └── [other relevant files]           # Additional documentation as needed
│
├── features-backend/                        # Technical backend features
│   ├── README.md                            # Overview of backend features
│   │
│   ├── [component-name]/                    # Component-specific folder
│       ├── overview.md                      # Component description and purpose
│       └── [other relevant files]           # Additional documentation as needed
│
├── guides/                                  # User & developer guides
│   ├── README.md                            # Guide overview
│   │
│   ├── user/                                # End-user guides
│   └── developer/                           # Developer guides
│
└── templates/                               # Document templates
    ├── feature.md                           # Template for feature docs
    └── guide.md                             # Template for guides
```

## Document Templates

When creating new documentation, please use the appropriate template:

- [Feature Documentation Template](./templates/feature.md) - For documenting application features
- [Guide Template](./templates/guide.md) - For creating how-to guides

## Documentation Standards

### File Naming

- Use lowercase letters
- Use hyphens instead of spaces
- Be descriptive but concise
- Examples: `overview.md`, `api-authentication.md`, `database-schema.md`

### Document Headers

All documents should include a header with metadata:

```
# Document Title

**Last Updated:** YYYY-MM-DD  
**Status:** Active/Draft/Deprecated  
**Owner:** Team or Individual
```

### Writing Style

- Use clear, concise language
- Write in second person (you/your) for guides
- Use present tense
- Break up text with headings, lists, and code blocks
- Include examples and screenshots where helpful

### Markdown Guidelines

- Use ATX-style headers (`#` for main heading, `##` for subheadings)
- Use code blocks with language specification for code samples
- Use relative links for internal documentation references
- Use tables for structured data
- Use blockquotes for notes and warnings

## Adding New Documentation

1. Identify where the document belongs in the structure
2. Use the appropriate template
3. Follow the documentation standards
4. Update any relevant index files
5. Update the last updated date in the document header

## Updating Existing Documentation

1. Always update the "Last Updated" date when making substantive changes
2. Maintain the existing structure and style of the document
3. If making major changes, consider whether the document's status should change
4. If you're not the owner, consider consulting with the owner before making major changes

## Review Process

1. Self-review your documentation using the standards in this guide
2. Request review from relevant stakeholders
3. Update based on feedback
4. Finalize and publish

## Getting Help

If you have questions about these guidelines or need help with documentation, please contact the Documentation Team.

---

Thank you for contributing to the Campaign Wizard documentation! 