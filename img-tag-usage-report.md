# <img> Tag Usage Report
Generated on: 2025-03-05T15:34:48.441Z

## Summary
- Files with `<img>` tag usage: 13
- Total occurrences: 21

## Files with <img> tag usage

### src//app/settings/test-upload/page.tsx (1 occurrences)

- Line 166: `<img src={preview} alt="Preview" className="mt-2 max-h-40 rounded" />`

### src//app/settings/branding/page.tsx (1 occurrences)

- Line 514: `<img`

### src//app/settings/page.tsx (1 occurrences)

- Line 359: `<img`

### src//app/dashboard/DashboardContent.tsx (5 occurrences)

- Line 312: `<img`
- Line 1348: `<img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />`
- Line 1378: `<img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />`
- Line 1403: `<img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/men/86.jpg" alt="" />`
- Line 1428: `<img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/men/54.jpg" alt="" />`

### src//app/debug-tools/database/page.tsx (2 occurrences)

- Line 138: `description: 'Report on <img> tag usage instead of Next.js Image component',`
- Line 845: `description="Scan for <img> tag usage instead of Next.js Image"`

### src//app/influencers/marketplace/[id]/page.tsx (2 occurrences)

- Line 213: `<img`
- Line 287: `<img`

### src//app/campaigns/wizard/step-1/Step1Content.tsx (1 occurrences)

- Line 895: `<img`

### src//app/campaigns/wizard/step-4/Step4Content.tsx (1 occurrences)

- Line 843: `<img src={URL.createObjectURL(previewAsset.file)} alt={previewAsset.file.name} className="w-full mb-4" />`

### src//app/help/page.tsx (1 occurrences)

- Line 363: `<img`

### src//components/Navigation/Sidebar.tsx (2 occurrences)

- Line 94: `<img`
- Line 148: `<img`

### src//components/AssetPreview/index.tsx (1 occurrences)

- Line 21: `<img`

### src//components/Influencers/InfluencerCard.tsx (2 occurrences)

- Line 16: `<img`
- Line 23: `<img`

### src//components/gif/GifGallery.tsx (1 occurrences)

- Line 61: `<img`

## Recommendations

1. Replace `<img>` tags with Next.js `<Image>` components:
   - Import the Image component: `import Image from "next/image";`
   - Replace `<img>` with `<Image>`
   - Ensure width and height props are provided (required by Next.js)
   - Use proper loading and quality attributes for optimization

2. Consider using the interactive fix script:
   ```
   node src/scripts/fix-img-tags.js --fix --file=path/to/file.tsx
   ```

3. For images that don't need optimization (like SVGs or icons), consider using:
   ```jsx
   <Image
     src="/path/to/image.jpg"
     alt="Description"
     width={500}
     height={300}
     unoptimized
   />
   ```
