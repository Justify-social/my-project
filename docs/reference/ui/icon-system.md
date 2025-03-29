# Icon System Guide

## Overview

Our icon system uses local SVG files instead of loading them dynamically from Font Awesome. This gives us:

1. **Reliability**: No dependency on external services
2. **Performance**: Faster loading times 
3. **Smaller bundle**: Only includes icons we actually use
4. **Consistency**: Icons look the same every time

## Quick Start

```jsx
// Import the Icon component
import { Icon } from '@/components/ui/atoms/icons';

// Basic usage (interactive with hover effect)
<Icon name="faUser" />

// Static icon (no hover effect)
<Icon name="faInfo" type="static" />

// With custom size
<Icon name="faStar" size="lg" />

// With action color on hover
<Icon name="faTrash" action="danger" />
```

## Icon Types

Our system has two main icon types:

### 1. Button Icons (Default)

These are interactive elements with visual feedback on hover:

- **Default Style**: Light variant
- **Hover Effect**: Changes to solid variant 
- **Hover Color**: Changes based on the `action` prop
- **Use For**: Buttons, links, anything clickable

```jsx
// Default button icon (changes to solid on hover)
<Icon name="faEdit" />

// Delete button icon (red on hover)
<Icon name="faTrash" action="danger" />

// Warning button icon (yellow on hover)
<Icon name="faWarning" action="warning" />
```

### 2. Static Icons

These are non-interactive, decorative elements:

- **Style**: Can be light or solid (with `solid` prop)
- **Hover Effect**: None
- **Use For**: Decoration, status indicators, labels

```jsx
// Static light icon (no hover effect)
<Icon name="faInfo" type="static" />

// Static solid icon
<Icon name="faInfo" type="static" solid />
```

## Specialized Components

For common patterns, use these pre-configured components:

```jsx
import { 
  StaticIcon, 
  ButtonIcon, 
  DeleteIcon, 
  WarningIcon, 
  SuccessIcon 
} from '@/components/ui/atoms/icons';

// Decorative icon (no hover effects)
<StaticIcon name="faUser" />

// Interactive button icon (light to solid hover)
<ButtonIcon name="faEdit" />

// Delete icon (red on hover)
<DeleteIcon name="faTrash" />

// Warning icon (yellow on hover)
<WarningIcon name="faWarning" />

// Success icon (green on hover)
<SuccessIcon name="faCheck" />
```

## Icon Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Icon name (with "fa" prefix) |
| `solid` | `boolean` | Use solid style (default: false) |
| `size` | `'xs'｜'sm'｜'md'｜'lg'｜'xl'｜'2xl'｜'3xl'｜'4xl'` | Icon size (default: 'md') |
| `type` | `'button'｜'static'` | Icon type (default: 'button') |
| `action` | `'primary'｜'success'｜'warning'｜'danger'` | Action color (default: 'primary') |
| `className` | `string` | Additional CSS classes |

## Common Icon Names

Here are frequently used icons:

| Icon Name | Description |
|-----------|-------------|
| `faUser` | User profile |
| `faEdit` | Edit/pencil |
| `faTrash` | Delete/trash |
| `faCheck` | Checkmark |
| `faTimes` | X/close |
| `faSearch` | Search |
| `faPlus` | Plus sign |
| `faMinus` | Minus sign |
| `faArrowRight` | Right arrow |
| `faChevronDown` | Down chevron |

## Do NOT Use FontAwesome Directly

❌ **Incorrect**:

```jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';

<FontAwesomeIcon icon={faUser} />
```

✅ **Correct**:

```jsx
import { Icon } from '@/components/ui/atoms/icons';

<Icon name="faUser" />
```

## Accessibility

For interactive icons, always provide an accessible label:

```jsx
<button aria-label="Delete item">
  <Icon name="faTrash" />
</button>

// Or for standalone interactive icons:
<Icon 
  name="faTrash" 
  aria-label="Delete item" 
  onClick={handleDelete} 
  tabIndex={0}
  role="button"
/>
```

## Icon with Text

When combining icons with text:

```jsx
<button className="flex items-center gap-2">
  <Icon name="faPlus" size="sm" />
  <span>Add Item</span>
</button>
```

## Adding New Icons

Follow these steps to add new icons:

1. Add the icon to your component using the `Icon` component
2. Run the update script to download and process the icon:
   ```bash
   npm run update-icons
   ```
3. Test your component to make sure the icon displays correctly

## Hover Effects

For button icons to work properly, wrap them in a parent with the `group` class:

```jsx
<button className="group flex items-center">
  <Icon name="faEdit" />
  <span className="ml-2">Edit</span>
</button>
```

## Action Colors

Icons can have different hover colors based on action type:

| Action | Color | Usage |
|--------|-------|-------|
| `primary` | Blue | Standard interactive icons |
| `danger` | Red | Delete or dangerous actions |
| `warning` | Yellow | Warning or caution |
| `success` | Green | Success or confirmation |

## Troubleshooting

If icons aren't displaying correctly:

1. Check that you've run the update script after adding new icons
2. Verify the icon name is correct (should include the "fa" prefix)
3. For interactive icons, make sure the parent has the `group` class
4. Run the verification script to check your icons:
   ```bash
   npm run verify-icons
   ```
5. If you see a question mark instead of an icon, regenerate icon data:
   ```bash
   npm run generate-icons
   ```

## ESLint Support

We have an ESLint rule to prevent direct FontAwesome imports:

```
error: Direct imports from FontAwesome packages are not allowed. 
Use the Icon component from @/components/ui/atoms/icons instead. 
(icon-standards/no-fontawesome-direct-import)
```

## Best Practices

1. **Always use our Icon component** - Never import directly from FontAwesome
2. **Use specialized components** when appropriate (ButtonIcon, DeleteIcon, etc.)
3. **Include the `group` class** on parent elements for hover effects
4. **Use semantic actions** - Choose appropriate action colors to convey meaning
5. **Be consistent with sizes** - Use the predefined size props
6. **Make icons accessible** - Always provide aria-labels for interactive icons 