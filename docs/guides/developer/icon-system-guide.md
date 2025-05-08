# Icon System Guide

**Last Reviewed:** 2025-05-09

## 1. Overview

This guide explains how icons are managed and used within the Justify application, focusing on our standardized approach using a central `<Icon>` component and icon registries.

**Core Principle:** Use the `<Icon>` component with a valid `iconId` for all icon usage to ensure consistency and maintainability.

## 2. Icon Source & Styles

- **Primary Library:** FontAwesome Pro 6
- **Styles Used:**
  - **Light (`fal`):** The default style for most icons.
  - **Solid (`fas`):** Typically used for hover states or selected states.
  - **Brands (`fab`):** For social media and company logos.
- **Custom Icons:** Application-specific icons (`app` category) and potentially KPI-specific icons (`kpis` category) are also used. These are custom SVG files.

## 3. Icon Registries (SSOT)

The **Single Source of Truth (SSOT)** for all available icons are the JSON registry files located in `/public/static/`:

- [`light-icon-registry.json`](../../../public/static/light-icon-registry.json): FontAwesome Pro Light icons.
- [`solid-icon-registry.json`](../../../public/static/solid-icon-registry.json): FontAwesome Pro Solid icons.
- [`brands-icon-registry.json`](../../../public/static/brands-icon-registry.json): FontAwesome Pro Brands icons.
- [`app-icon-registry.json`](../../../public/static/app-icon-registry.json): Custom application icons.
- [`kpis-icon-registry.json`](../../../public/static/kpis-icon-registry.json): Custom KPI-related icons.

**Registry Structure:**
Each registry file contains an array of icon objects with the following key fields:

```json
{
  "icons": [
    {
      "category": "[category_name]", // e.g., "light", "solid", "brands", "app", "kpis"
      "id": "[unique_icon_id]", // e.g., "faCheckLight", "faCheckSolid", "brandsFacebook", "appSettings"
      "name": "[human_readable_name]", // e.g., "Check", "Facebook", "Settings"
      "faVersion": "[font_awesome_class_or_null]", // e.g., "fal fa-check", "fab fa-facebook", null
      "path": "[path_to_svg_file]" // e.g., "/icons/light/check.svg"
    }
    // ... more icons
  ]
}
```

- **`id`**: The unique identifier required when using the `<Icon>` component.
- **`path`**: The location of the SVG file within `/public`. The component uses the `id` to find this.
- **`faVersion`**: For reference, showing the corresponding FontAwesome class.

## 4. How to Use Icons: The `<Icon>` Component

**Always** use the central `<Icon>` component to display icons. Do **not** use other methods like direct SVG imports or other icon libraries (e.g., `lucide-react`).

- **Component Location:** `src/components/ui/icon/icon.tsx`
- **Basic Usage:**

  ```tsx
  import { Icon } from '@/components/ui/icon'; // Adjust import path if needed

  // Use the 'id' from the registry
  <Icon iconId="faUserLight" />
  <Icon iconId="appSettings" className="text-blue-500" />
  <Icon iconId="faArrowRightSolid" size="lg" />
  <Icon iconId="brandsTiktok" />
  ```

- **Key Props:**
  - `iconId` (required): The unique ID from the JSON registries (e.g., `faCheckLight`, `appHome`).
  - `className`: Optional Tailwind classes for styling (color, size - although `size` prop is preferred).
  - `size`: Predefined sizes (e.g., `sm`, `md`, `lg` - check component for specifics) or Tailwind size class.
  - `title`: Optional title attribute for accessibility.
  - Standard HTML attributes (`onClick`, etc.).
- **Finding Icon IDs:** Browse the JSON registry files in `/public/static/` to find the `id` for the icon you need.

## 5. Adding or Updating Icons

Adding icons currently requires manual steps involving the registry files and potentially running scripts:

1.  **Add/Update SVG File:** Place the optimized SVG file in the correct subfolder within `/public/icons/` (e.g., `/public/icons/app/`, `/public/icons/light/`). Ensure the filename matches the intended ID pattern (e.g., `check.svg` for `faCheckLight`).
2.  **Update Registry:** Manually add or update the corresponding entry in the relevant `*-icon-registry.json` file in `/public/static/`, ensuring all fields (`id`, `name`, `path`, `category`, `faVersion` if applicable) are correct.
3.  **(Potentially) Run Scripts:** Depending on the setup, scripts might exist in `scripts/icons/` or `config/ui/scripts/` to validate registries or download FontAwesome icons. Consult with the tech lead if specific scripts need to be run after manual updates.

_(Action: Tech Lead to clarify the exact process and any necessary scripts for adding/updating icons.)_

## 6. Hover States (Light/Solid)

The common pattern for hover states is to switch between the Light (`...Light`) and Solid (`...Solid`) versions of a FontAwesome icon using CSS or component state.

- **Default:** Use the Light version (`iconId="faSomethingLight"`).
- **Hover:** Use the Solid version (`iconId="faSomethingSolid"`).

_(Refer to existing components like buttons or navigation items for examples of implementing hover state changes.)_
