# Architectural Assets

**Last Reviewed:** 2025-05-09

This directory contains shared visual assets related to the Justify platform architecture. These assets, such as diagrams and images, are used across various architecture documents to illustrate concepts and component interactions.

## Purpose

- Provide a central location for reusable architectural diagrams.
- Ensure consistency in visual representations used in documentation.
- Facilitate easier updates to diagrams by having a single source.

## Contents

_(This section should list and briefly describe the assets stored here as they are added.)_

- **Example:** `system-context-diagram.png` - High-level diagram showing Justify within its ecosystem.
- **Example:** `data-flow-brand-lift.mermaid` - Mermaid source file for the Brand Lift data flow.

## Usage

Link to assets in this directory from other Markdown documents using relative paths, for example:

```markdown
![System Context Diagram](./assets/system-context-diagram.png)
```

For Mermaid diagrams (`.mermaid` or `.mmd` files), consider rendering them directly in the document where they are referenced if the Markdown renderer supports it, or linking to the source file.

## Contribution

- Place new reusable architectural diagrams or images here.
- Use clear, descriptive filenames.
- Prefer text-based diagram formats like Mermaid (`.mmd`, `.mermaid`) where possible for version control and maintainability.
- Update this README when adding new assets.
