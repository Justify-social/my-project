# Semantic Icon Usage Guide

## Overview

The semantic icon mapping system provides a centralized way to reference icons by their meaning rather than specific technical identifiers. This approach improves maintainability, makes code more readable, and ensures visual consistency across the application.

The `icon-semantic-map.ts` file serves as the **Single Source of Truth (SSOT)** for mapping semantic names to specific icon IDs.

## SSOT Principles

The semantic icon mapping follows strict SSOT principles:

1. **Single Authoritative Source**: All semantic icon mappings exist in one file only (`icon-semantic-map.ts`)
2. **No Duplication**: Each semantic meaning has exactly one mapping to an icon ID
3. **Consistent Naming**: Semantic names follow consistent patterns and organization
4. **Version Control**: Changes to mappings are tracked and documented
5. **Centralized Updates**: Updating an icon requires changing only one location

## Benefits of Semantic Mapping

- **Maintainability**: Update icon implementations in a single location
- **Readability**: Use descriptive names like `calendar` instead of technical IDs like `faCalendarLight` 
- **Consistency**: Ensure the same icon is used for the same concept throughout the application
- **Future-proofing**: Change underlying icon libraries without changing component code

## Basic Usage

```tsx
import { UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';
import { Icon } from '@/components/ui/icon/icon';

// Using semantic names
<Icon iconId={UI_ICON_MAP.calendar} />
<Icon iconId={UI_ICON_MAP.arrowRight} />

// With adapters
import { ShadcnIcon } from '@/components/ui/icon/adapters/shadcn-adapter';
<ShadcnIcon iconId={UI_ICON_MAP.check} />
```

## Available Semantic Categories

The semantic map is organized into logical categories:

### Navigation Icons
- `arrowLeft`, `arrowRight`, `arrowUp`, `arrowDown`
- `chevronLeft`, `chevronRight`, `chevronUp`, `chevronDown`
- `anglesLeft`, `anglesRight`

### Action Icons
- `add`, `edit`, `delete`, `save`, `trash`
- `close`, `check`, `search`, `filter`
- `upload`, `download`, `copy`, `link`
- `play`, `pause`, `stop`
- `floppyDisk`, `loading`

### Status/Notification Icons
- `info`, `infoCircle`, `warning`, `error`, `success`
- `bell`, `question`, `clock`, `xCircle`

### Interface Icons
- `menu`, `more`, `settings`
- `home`, `user`, `calendar`, `folder`
- `palette`

### Data Visualization
- `chartLine`, `chartBar`, `chartPie`
- `trendUp`, `trendDown`

### Feedback/Messaging
- `comment`, `commentDots`, `chatBubble`
- `mail`

### Business/Commerce
- `dollarSign`, `tag`, `coins`
- `creditCard`, `money`, `file`, `star`

### Concepts/Ideas
- `lightBulb`, `bookmark`, `bolt`, `lightning`
- `list`

### People/Social
- `userCircle`, `userGroup`

### Objects/Content
- `photo`, `documentText`, `building`, `globe`
- `map`

### Status Indicators
- `checkCircle`, `circleCheck`

## Helper Functions

### Getting Solid Variants

For hover states or emphasized UI elements, use the `getSolidUIIcon` helper function:

```tsx
import { UI_ICON_MAP, getSolidUIIcon } from '@/components/ui/icon/icon-semantic-map';
import { Icon } from '@/components/ui/icon/icon';

// Normal state uses light variant
<Icon iconId={UI_ICON_MAP.calendar} />

// Solid variant for emphasis
<Icon iconId={getSolidUIIcon('calendar')} />
```

### Validating Semantic Keys

To check if a semantic key exists before using it:

```tsx
import { hasSemanticIcon, UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';

// Check if the key exists
if (hasSemanticIcon('calendar')) {
  // Use the icon
  return <Icon iconId={UI_ICON_MAP.calendar} />;
}
```

## Integration with Hover States

The semantic map works seamlessly with the `HoverIcon` component:

```tsx
import { UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';
import { HoverIcon } from '@/components/ui/icon/hover-icon';

<HoverIcon 
  iconId={UI_ICON_MAP.arrowRight} 
  className="text-primary" 
/>
```

## Refactoring Examples

### Before and After Example 1: Direct Icon ID

```tsx
// Before: Using direct technical icon ID
<Icon iconId="faGearLight" />

// After: Using semantic mapping
import { UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';
<Icon iconId={UI_ICON_MAP.settings} />
```

### Before and After Example 2: Multiple Related Icons

```tsx
// Before: Using multiple direct icon IDs
<Icon iconId="faArrowUpLight" />
<Icon iconId="faArrowDownLight" />

// After: Using semantic mapping with destructuring
import { UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';
const { arrowUp, arrowDown } = UI_ICON_MAP;

<Icon iconId={arrowUp} />
<Icon iconId={arrowDown} />
```

### Before and After Example 3: Hover State Handling

```tsx
// Before: Manually handling hover states
const [isHovered, setIsHovered] = useState(false);

<span
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <Icon iconId={isHovered ? "faGearSolid" : "faGearLight"} />
</span>

// After: Using semantic mapping with HoverIcon
import { UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';
import { HoverIcon } from '@/components/ui/icon/hover-icon';

<HoverIcon iconId={UI_ICON_MAP.settings} />
```

## Custom Implementations

For complex components or custom icon usage, you can still leverage the semantic map:

```tsx
import { useState } from 'react';
import { UI_ICON_MAP, getSolidUIIcon } from '@/components/ui/icon/icon-semantic-map';
import { Icon } from '@/components/ui/icon/icon';

const CustomToggleButton = ({ isActive, onClick }) => {
  // Use semantic mapping with conditional logic
  const iconId = isActive 
    ? getSolidUIIcon('check')  // Solid when active
    : UI_ICON_MAP.check;       // Light when inactive
    
  return (
    <button 
      className={`btn ${isActive ? 'btn-active' : ''}`}
      onClick={onClick}
    >
      <Icon iconId={iconId} />
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
};
```

## Adding New Semantic Icons

When adding new semantic icons, follow these SSOT-compliant steps:

1. **Verify the registry**: Ensure the icon exists in the appropriate registry file
2. **Add to semantic map**: Add the mapping to `icon-semantic-map.ts` in the appropriate category
3. **Update documentation**: Document the new semantic name in this guide
4. **Communicate changes**: Notify the team about new additions

Example addition to the semantic map:

```typescript
// In icon-semantic-map.ts
export const UI_ICON_MAP: Record<string, string> = {
  // ... existing mappings
  
  // New semantic icon
  "videoCall": "faVideoLight",
};
```

## Best Practices

1. **Always use semantic names for common icons**
   ```tsx
   // Good
   <Icon iconId={UI_ICON_MAP.add} />
   
   // Avoid direct references when semantic names exist
   <Icon iconId="faPlusLight" />
   ```

2. **Use descriptive semantic names**
   The semantic name should describe what the icon represents, not what it looks like.
   
   ```tsx
   // Good - describes meaning
   UI_ICON_MAP.add
   
   // Bad - describes appearance
   UI_ICON_MAP.plusSign
   ```

3. **Group related semantic icons**
   When creating custom UI components, prefer to import multiple related semantic icons together:
   
   ```tsx
   import { UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';
   
   // Destructure only what you need
   const { 
     play, 
     pause, 
     stop 
   } = UI_ICON_MAP;
   
   // Then use in your component
   <Icon iconId={play} />
   ```

4. **Avoid adding one-off icons to the semantic map**
   The semantic map should contain only icons with clear, reusable meanings across the application.

5. **Follow the SSOT principle rigorously**
   Never create alternative mappings or bypass the semantic map for icons that already have semantic names.

## Related Documentation

- [Icon Adapter Usage](./adapter-usage.md)
- [Icon Context Usage](./icon-context-usage.md)
- [Registry Update Process](./registry-update-process.md) 