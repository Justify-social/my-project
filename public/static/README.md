# Icon Registries

This directory contains JSON files that serve as the Single Source of Truth (SSOT) for icons used throughout the application.

Each JSON file represents a category of icons (e.g., `app`, `brands`, `light`, `solid`, `kpis`).

## File Structure

Each registry file (`*-icon-registry.json`) follows this general structure:

```json
{
  "icons": [
    {
      "category": "[category_name]",
      "id": "[unique_icon_id]",
      "name": "[human_readable_name]",
      "faVersion": "[font_awesome_class_or_null]",
      "path": "[path_to_svg_file]"
    },
    // ... more icons
  ],
  "category": "[category_name]",
  "iconCount": [number_of_icons]
}
```

**Field Descriptions:**

- `icons`: An array containing metadata for each icon in the category.
- `category` (within icon object): The category this icon belongs to (e.g., "app", "light", "brands"). Should match the category field at the root level.
- `id`: The **unique identifier** used to reference the icon in the codebase (e.g., `appHome`, `faCheckLight`, `brandsFacebook`). This is the **sole value** needed when using the `<Icon>` component.
- `name`: A human-readable name for the icon (e.g., "Home", "Check", "Facebook").
- `faVersion`: The corresponding Font Awesome class name (e.g., `fal fa-check`, `fab fa-facebook`). This is primarily for informational purposes or potential legacy mapping and is **not** directly used by the `<Icon>` component's path lookup logic. It may be `null` for custom icons.
- `path`: The relative path to the icon's SVG file within the `/public` directory (e.g., `/icons/light/faCheckLight.svg`). The `<Icon>` component uses the `id` to find this path.
- `category` (root level): The name of the icon category defined in this file.
- `iconCount` (root level): The total number of icons defined in this file.

## Usage

Components **must** reference icons using the `<Icon>` component (or its variants like `<LightIcon>`, `<SolidIcon>`) and the unique `id` field from these registries.

```tsx
import { Icon } from '@/components/ui/icon';

<Icon iconId="appHome" />
<Icon iconId="faCheckLight" />
```

This ensures consistency and leverages the SSOT defined here.

## Integration with Shadcn UI

This custom icon system provides a unified set of icons for the entire application. When using Shadcn UI components or building custom components, always prefer using `<Icon iconId="..." />` to ensure visual consistency and adherence to the application's defined icon set, rather than potentially relying on other icon methods or Shadcn defaults.

## Adding/Updating Icons

To add or update an icon, follow these manual steps:

1.  **Place the SVG:** Add the new or updated SVG file to the appropriate subdirectory within `/public/icons/` (e.g., `/public/icons/app/`, `/public/icons/light/`).
2.  **Update the Registry:** Edit the relevant JSON registry file in `/public/static/` (e.g., `app-icon-registry.json`, `light-icon-registry.json`).
    - **Adding:** Add a new JSON object to the `icons` array.
    - **Updating:** Modify the existing JSON object for the icon.
3.  **Ensure Correct Fields:** Verify all fields are correct, especially:
    - `id`: A unique, descriptive ID (e.g., `appNewFeature`, `faThumbsUpLight`). **This is the critical value used in the code.**
    - `path`: The correct relative path to the SVG file you added/updated (e.g., `/icons/app/appNewFeature.svg`).
    - `category`: Matches the registry file's category.
    - `name`: A clear, human-readable name.
    - `faVersion`: The corresponding Font Awesome class if applicable, otherwise `null`.
4.  **Update Count:** Increment/decrement the `iconCount` at the root of the JSON file if adding/removing icons.
5.  **Verify Usage:** Test the new/updated icon in the application using its `id` with the `<Icon>` component.
