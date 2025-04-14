# Using Icons in This Application

This guide explains how icons are managed and used in our project, focusing on our simple, standardised approach.

## Overview: The Icon Registries

Our application uses a set of JSON files located in `/public/static/` to manage all icons. These files are the **Single Source of Truth (SSOT)** for icons:

- `app-icon-registry.json`
- `brands-icon-registry.json`
- `kpis-icon-registry.json`
- `light-icon-registry.json` (FontAwesome Light style)
- `solid-icon-registry.json` (FontAwesome Solid style)

Each file organises icons by category.

## Registry File Structure

Inside each `*-icon-registry.json` file, you'll find this structure:

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

**Key Fields Explained:**

- `id`: The **unique ID** for the icon (e.g., `appHome`, `faCheckLight`, `brandsFacebook`). **This ID is the only thing you need to use an icon in the code.**
- `path`: The location of the icon's SVG file (e.g., `/icons/light/faCheckLight.svg`). The system finds this using the `id`.
- `category`: The icon's category (e.g., "app", "light").
- `name`: A descriptive name (e.g., "Home", "Check").
- `faVersion`: The FontAwesome class name, if it exists (e.g., `fal fa-check`). This is just for reference; the system uses the `id` and `path`. It might be `null` for custom icons.

## How to Use Icons (The `<Icon>` Component)

To display an icon, you **must** use the `<Icon>` component and provide the unique `id` from the registry:

```tsx
import { Icon } from '@/components/ui/icon'; // Or potentially '@/components/ui' if re-exported

// Examples
<Icon iconId="appSettings" />
<Icon iconId="faArrowRightLight" />
<Icon iconId="brandsTiktok" />
```

There are also helper components for standard variants:

```tsx
import { LightIcon, SolidIcon } from '@/components/ui/icon'; // Or potentially '@/components/ui'

<LightIcon iconId="faCheck" />   // Renders faCheckLight
<SolidIcon iconId="faCheck" />   // Renders faCheckSolid
```

Using the `id` ensures you always get the correct, centrally-defined icon.

## Using Icons with Shadcn UI Components

We use Shadcn UI, but our custom icon system provides the standard icons for this project. When adding icons to Shadcn components (or any component), please use `<Icon iconId="..." />` to maintain visual consistency. Don't rely on other methods or potential Shadcn default icons.

## Adding or Updating Icons

Follow these steps to add or change an icon:

1.  **Add/Replace SVG:** Put the SVG file in the correct folder within `/public/icons/` (e.g., `/public/icons/app/`).
2.  **Edit Registry:** Open the relevant JSON file in `/public/static/` (e.g., `app-icon-registry.json`).
    - **New Icon:** Add a new entry to the `icons` list.
    - **Update Icon:** Change the existing entry.
3.  **Check Fields:** Make sure the `id`, `path`, `category`, and `name` are correct. The `id` must be unique.
4.  **Update Count:** Adjust the `iconCount` number at the bottom of the JSON file if you added or removed an icon.
5.  **Test:** Use the icon `id` in the `<Icon>` component somewhere (like the debug page `/debug-tools/ui-components`) to check it displays correctly.

This simple process keeps our icon system consistent and easy to manage.
