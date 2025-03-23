# Icon System Fix Plan

## Identified Issues

1. **Missing SVG Files (404 Errors)**:
   - close.svg → needs to be mapped to xmark.svg
   - dollar.svg → needs to be mapped to dollar-sign.svg
   - edit.svg → needs to be mapped to pen-to-square.svg
   - history.svg → needs to be mapped to clock-rotate-left.svg
   - home.svg → needs to be mapped to house.svg
   - search.svg → needs to be mapped to magnifying-glass.svg
   - user-circle.svg → needs to be mapped to circle-user.svg
   - warning.svg → needs to be mapped to triangle-exclamation.svg
   - profile-image.svg → missing entirely, needs to be created

2. **Component Warning**:
   - `IconTester is a locked component and should not be modified`
   - We created a wrapper (`CustomIconDisplay`), but it needs to be used everywhere IconTester is referenced

## Root Causes

1. **Naming Mismatch**:
   - FontAwesome Pro uses different naming conventions than what our code is trying to reference
   - Many icon names in our code are using legacy or semantic names instead of actual FontAwesome icon names

2. **Path Mismatch**:
   - Icon URL map references files like `/ui-icons/solid/close.svg`
   - But these files don't exist because FontAwesome names them differently (e.g., `xmark.svg` instead of `close.svg`)

3. **Missing Wrapper for Locked Component**:
   - IconTester component is marked as locked and should not be modified
   - We need a proper wrapper everywhere it's used

## Solution Approach

### 1. Fix Missing SVG Files (Priority: High)

**Update Icon References in Code to Use Correct FontAwesome Names**

Create path aliases in the SvgIcon component to map legacy names to actual FontAwesome names:

```typescript
const iconNameMappings: Record<string, string> = {
  'close': 'xmark',
  'dollar': 'dollar-sign',
  'edit': 'pen-to-square',
  'history': 'clock-rotate-left',
  'home': 'house',
  'search': 'magnifying-glass',
  'user-circle': 'circle-user',
  'warning': 'triangle-exclamation'
};

// In the icon resolution code:
const iconName = iconNameMappings[requestedName] || requestedName;
```

### 2. Ensure IconTester Wrapper Is Used Properly (Priority: Medium)

1. Find all imports of IconTester and replace with CustomIconDisplay
2. Make sure CustomIconDisplay properly passes all props to IconTester

```tsx
// src/components/ui/custom-icon-display.tsx
import { IconTester } from './icons/test/IconTester';

export const CustomIconDisplay = (props) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Icon Preview</h3>
      <IconTester {...props} />
    </div>
  );
};
```

### 3. Create Missing Profile Image (Priority: Low)

Create a profile-image.svg file in the public directory:

```bash
# Use a placeholder profile image
curl https://ui-avatars.com/api/?name=User&background=random -o public/profile-image.svg
```

## Complete Legacy Icon Mappings

```
faSettings → faGear
faMail → faEnvelope
faDelete → faTrashCan
faChatBubble → faCommentDots
faView → faEye
faDocumentText → faFileLines
faClose → faXmark
faSearch → faMagnifyingGlass
faWarning → faTriangleExclamation
faHome → faHouse
faHistory → faClockRotateLeft
faDollar → faDollarSign
faEdit → faPenToSquare
faUserCircle → faCircleUser
```

## Implementation Status

- [x] Created CustomIconDisplay wrapper for IconTester
- [x] Updated icon name references in examples.tsx
- [x] Added favicon to prevent 404
- [ ] Create icon name mapping in SvgIcon component
- [ ] Create profile-image.svg
- [ ] Update references to legacy icon names throughout codebase

## Testing Steps

After implementing these changes, verify that:
1. All FontAwesome icons load correctly with no 404 errors
2. No IconTester locked component warning appears
3. Profile images display correctly 