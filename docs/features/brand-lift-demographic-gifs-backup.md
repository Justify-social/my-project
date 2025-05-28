# Brand Lift Survey - Demographic Question GIF URLs Backup

**Created:** 2025-01-21  
**Purpose:** Backup of hardcoded GIF URLs for demographic questions in Brand Lift surveys  
**Location:** `src/components/features/brand-lift/SurveyQuestionBuilder.tsx`

## Gender Question GIFs

**Question:** "What is your gender?"

| Option                | GIF URL                                                                                                                                                                         | Description        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Male**              | `https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnZseXA0eHlna2FiODA0ZGdrN3E0ZmYybG4xc2MyM21mZzgwYjlmcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WuGSL4LFUMQU/giphy.gif`       | Will Smith         |
| **Female**            | `https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWZiOWdoNno3NzFybWp5MzB6eGU2dHl3NWcwOW1xbmt3NHd2NTAyZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5rUG5e98jvlhm/giphy.gif`      | Beyoncé            |
| **Other**             | `https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXBqeXZibDdhMWFnbTZhNjNjeG8yN2MzZnF0NXN0ZDJiMDl4MWY1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ndspmyWNDTC0MKW2de/giphy.gif` | Other/Non-binary   |
| **Prefer not to say** | `https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExamxwbHdrbDFzMTlhc2ZjZ2c1eDV0NWc1a3loampsdTVuN3NmdXZiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jbxfRR84why0wNstbw/giphy.gif` | Privacy/Not saying |

## Age Group Question GIFs

**Question:** "Which age group do you belong to?"

| Age Range             | GIF URL                                                                                                                                                                         | Description       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Under 18**          | `https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGZ1M2c1cXFjajByYzluNzllamRmbzd6dnU4dmJ6M3g2amZ1bnQ2byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1nfwnYf5Uz7hzhYof8/giphy.gif` | Funny Kid         |
| **18-24**             | `https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWd6eWVwYjgyOTQwaGRlNjJnb3d3aXplczB4aGI2cGN2aDVkZWh6eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SeuMW8SY2KivEOumhW/giphy.gif` | Ok Boomer         |
| **25-34**             | `https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG4xMDNidGs5dzRtcG5tODNnNHlqMzdmd3ZkYm53dDR0YjZ2eGF6biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kdX3zD7qAAY5Cu6s0b/giphy.gif` | Joey from Friends |
| **35-44**             | `https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3RyeWl4ZHN0aWg3bm14dGZ4MGgyN3Y0bWdpb3J3YzhuZ3J3MnhsNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Js8gkvuhpQLhkQ6kXN/giphy.gif` | Dad               |
| **45-54**             | `https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWlpZ3EwazN1ZTEwdmFmNDdqamhzbWZkZ3Q4ZHJtNTR4a24xODQ2diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Km2YiI2mzRKgw/giphy.gif`      | No Money          |
| **55-64**             | `https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWZnamNtZnU3dG1wdGY0dTB6anBvc29lNWxuY2ZlZG55dGlld2cxMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCdPNT81vlv3y/giphy.gif`      | Money             |
| **65+**               | `https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGlydW9ubTVoaHI3bW5ibHhiZjBuMXpleDA0aHl5NnR1OHRpM3o5OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JT87wTuCmorTUhk6k4/giphy.gif` | Tom Cruise        |
| **Prefer not to say** | `https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnpzNGc0Nmx0YzVjNGdvNnVhb2FjcTEzcmt5ZGhrYnlkb2JpaGtiayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W0Dldg5FhnH3dkfTtH/giphy.gif` | Not saying        |

## Implementation Notes

- **Location**: These URLs are hardcoded in the `SurveyQuestionBuilder.tsx` file around lines 1520-1640
- **Purpose**: Standard demographic questions automatically added during AI suggestion process
- **Mobile-First**: All GIFs selected for mobile survey platform use
- **Content Guidelines**: Real people, fun but appropriate, no text overlays, no political figures
- **Verification**: Each GIF manually verified for content appropriateness and gender representation

## Backup Recovery

To restore these GIFs:

1. Copy the URLs from this backup
2. Replace the `imageUrl` values in the demographic question generation section
3. Ensure the order matches: Male, Female, Other, Prefer not to say (for gender)
4. Ensure age order: Under 18, 18-24, 25-34, 35-44, 45-54, 55-64, 65+, Prefer not to say

## Last Updated

**Date**: 2025-01-21  
**By**: AI Assistant  
**Version**: 1.0  
**Status**: Active GIF URLs in production
