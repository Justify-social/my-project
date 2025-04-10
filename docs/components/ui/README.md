# Guide to Using UI Components

Welcome to the project! This guide will help you understand and use our custom UI component library effectively. Our goal is to create a consistent, reusable, and visually appealing user interface.

## Core Ideas

Our UI library is built upon some key ideas:

1.  **Based on Shadcn UI:** Many of our components are built using the excellent [Shadcn UI](https://ui.shadcn.com/) methodology. This means they use [Radix UI](https://www.radix-ui.com/) primitives for accessibility and behaviour, and [Tailwind CSS](https://tailwindcss.com/) for styling.
2.  **Composition:** We prefer building complex interfaces by putting together smaller, focused components rather than having large components with lots of options.
3.  **Atomic Design (loosely):** Components are organised into categories like `atom`, `molecule`, and `organism` to help understand their complexity and how they fit together:
    *   **Atoms:** The smallest building blocks (e.g., `Button`, `Input`, `Label`, `Badge`). Find them typically in `src/components/ui/`.
    *   **Molecules:** Small groups of atoms forming a distinct unit (e.g., `Alert`, `Tooltip`, `HoverCard`). Also often in `src/components/ui/`.
    *   **Organisms:** More complex UI sections composed of atoms and molecules (e.g., `Card`, `DataTable`, `Form`, `MobileMenu`, chart components, layout components like `MetricsDashboard`). These might be in `src/components/ui/` or dedicated subdirectories (like `src/components/ui/navigation/` for menus).
4.  **Styling:**
    *   **Tailwind CSS:** Styling is primarily done using Tailwind utility classes passed via the `className` prop.
    *   **Global Styles:** Base styles, fonts (like `Inter` and `Sora`), and CSS variables for colours are defined in `src/app/globals.css`.
    *   **Brand Colours:** Please use the defined brand colours for consistency. Key colours include:
        *   Primary (Jet): `hsl(var(--primary))` / `#333333`
        *   Secondary (Payne's Grey): `hsl(var(--secondary))` / `#4A5568`
        *   Accent (Deep Sky Blue): `hsl(var(--accent))` / `#00BFFF`
        *   Background (White): `hsl(var(--background))` / `#FFFFFF`
        *   Dividers (French Grey): `hsl(var(--divider))` / `#D1D5DB`
        *   Interactive (Medium Blue): `hsl(var(--interactive))` / `#3182CE`
        *   Check `globals.css` for the full list (`--foreground`, `--muted`, `--popover`, `--card`, etc.).
5.  **Icons:**
    *   We use a custom `<Icon iconId="..." />` component found in `src/components/ui/icon/icon.tsx`.
    *   **Do not** use external icon libraries like `lucide-react` directly.
    *   Icon IDs are defined in JSON registry files located in `public/static/`:
        *   `light-icon-registry.json`: For FontAwesome Pro Light icons (`fal`). **This is the default style.**
        *   `solid-icon-registry.json`: For FontAwesome Pro Solid icons (`fas`). **Used for hover states.**
        *   `brands-icon-registry.json`: For brand logos (`fab`).
        *   `app-icon-registry.json`: For custom application-specific icons (used mainly in core navigation like `MobileMenu` and `Sidebar`).
    *   To find an icon ID, look in the relevant JSON file for the desired icon (e.g., search for "user" to find `faUserLight`).
    *   If an icon is missing, it may need to be added to the registry and downloaded using the scripts in `scripts/icons/`.

## How to Use Components

1.  **Find the Component:**
    *   **Best Place:** Check the **UI Browser** first! Navigate to `/debug-tools/ui-components` in your local development environment. This shows most components with examples.
    *   Look in `src/components/ui/`. Components are often named clearly (e.g., `button.tsx`, `card.tsx`). Check subdirectories like `navigation/` too.
2.  **Import:** Import components using the `@` alias:
    ```typescript
    import { Button } from "@/components/ui/button";
    import { KpiCard } from "@/components/ui/card-kpi";
    import { MobileMenu } from "@/components/ui/navigation/mobile-menu";
    ```
3.  **Props:** Components accept standard HTML attributes and specific props defined in their interfaces (usually near the top of the component file or in associated types).
    *   Check the component file (`.tsx`) for its `Props` interface (e.g., `KpiCardProps`).
    *   Look at the examples in the UI Browser preview pages (`src/app/(admin)/debug-tools/ui-components/preview/...`) to see how props are used.
4.  **Styling:** Use the `className` prop to add Tailwind utility classes for layout and minor style adjustments.
    ```jsx
    <Button className="mt-4 w-full">Submit</Button>
    <Card className="shadow-lg">...</Card>
    ```
5.  **State:** Simple components manage their own state. More complex ones requiring external control (like `Sheet`, `Dialog`, `MobileMenu`) expect state (`isOpen`) and handlers (`onOpenChange`) to be passed down as props from the parent component.

## Key Custom/Complex Components

While many components are standard Shadcn UI patterns, be aware of these more complex or custom ones:

*   **`AssetCard`:** Displays media assets with previews and details. Uses internal `AssetPreview`.
*   **`KpiCard`:** Displays key metrics with trend indicators. Requires `title` and `value`.
*   **Chart Components (`AreaChart`, `BarChart`, etc.):** Wrappers around the Recharts library. Check individual component files (`chart-*.tsx`) for specific props (`data`, `xKey`/`xField`, `yKey`/`lines`, etc.).
*   **`CalendarUpcoming`:** Displays events on a calendar grid. Expects an `events` array prop.
*   **`MetricsComparison`:** Uses Tabs and Line Charts to compare data sets. Expects a `metrics` array prop.
*   **`MetricsDashboard`:** A layout component using CSS Grid to display child components (like `KpiCard`).
*   **`MobileMenu`:** Sheet-based menu. Expects state props and `menuItems` array.
*   **`UpcomingCampaignsTable`:** Card containing a Table for specific campaign data structure.
*   **`Icon`:** The central component for displaying all icons based on registry IDs.

## Best Practices

*   **Check the UI Browser first:** See if a component already exists and how it's used.
*   **Reuse, Don't Rebuild:** Favour using existing components.
*   **Composition:** Build complex UI by combining smaller components.
*   **Styling:** Use Tailwind utilities via `className`. Stick to theme colours and variables.
*   **Icons:** Use the `<Icon iconId="..." />` component and registry IDs.
*   **Accessibility:** Keep accessibility in mind. Use semantic HTML where appropriate. Many underlying Radix components handle ARIA attributes automatically.

Happy coding! 