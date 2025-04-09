# UI Components

This section provides information about the reusable UI components built for this project.

## Core Philosophy

Our UI components aim to be:

*   **Consistent:** Providing a unified look and feel across the application.
*   **Reusable:** Built with modularity in mind for use in various features.
*   **Accessible:** Adhering to accessibility best practices (WCAG).
*   **Performant:** Optimised for efficient rendering.

## Technology

*   **React & TypeScript:** For building components.
*   **Radix UI Primitives:** As the foundation for accessible, unstyled components (like Accordion, Select, Tooltip, etc.).
*   **Tailwind CSS:** For utility-first styling.
*   **class-variance-authority (CVA) & `cn` utility:** For managing component variants and merging classes.
*   **Storybook:** For development, visual testing, and documentation.

## Location

All general-purpose UI components reside in `src/components/ui/`.

*For the specific structure within `/ui`, see the [Directory Structure documentation](../architecture/directory-structure.md).*

## Icons

We use a centralised icon system built upon **FontAwesome Pro**.

*   **Do NOT use `lucide-react` or other icon libraries.**
*   Use the `<Icon>`, `<LightIcon>`, or `<SolidIcon>` components located in `src/components/ui/icon/`.
*   Provide the unique `iconId` (e.g., `faCheckLight`, `appSettings`) defined in the JSON registries located in `/public/static/`.
*   See the **[Icon System Guide](./icons/README.md)** for detailed usage and how to add new icons.

## Usage & Examples

Refer to the README file within each specific component directory in `src/components/ui/` for detailed props information and usage examples (if available). Storybook also serves as interactive documentation.

## Contributing

When adding or modifying UI components:

*   Follow the established patterns (Radix, Tailwind, CVA).
*   Ensure accessibility requirements are met.
*   Add or update tests (Unit, Storybook).
*   Document props using JSDoc comments.
*   Update the relevant README if necessary. 