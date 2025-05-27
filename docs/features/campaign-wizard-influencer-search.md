# Campaign Wizard - Influencer Search Integration

## Overview

The campaign wizard's Step 1 now includes an enhanced influencer search feature that integrates directly with the InsightIQ marketplace API. Users can search for influencers by typing their handle or name, and see real-time search results with profile information.

## Features

### 🔍 **Real-time Search**

- **Debounced Search**: 500ms delay to avoid excessive API calls
- **Minimum Characters**: Search triggers after typing 2+ characters
- **Platform Filtering**: Search results filtered by selected platform
- **Auto-suggestion**: Dropdown shows matching influencer profiles

### 👤 **Rich Profile Previews**

- **Profile Photos**: Display actual influencer avatars
- **Verification Status**: Blue checkmark for verified accounts
- **Follower Count**: Formatted follower numbers (1.2M, 850K, etc.)
- **Engagement Rate**: Shows engagement percentage when available
- **Platform Badges**: Visual platform indicators

### ✅ **Smart Selection**

- **Auto-fill Platform**: Automatically sets platform when influencer is selected
- **Visual Confirmation**: Green highlight and preview when influencer is selected
- **Easy Clearing**: X button to clear selection and start over
- **Form Integration**: Seamlessly integrates with form validation

## Technical Implementation

### Components

1. **InfluencerSearchEntry** (`src/components/features/campaigns/InfluencerSearchEntry.tsx`)

   - Replaces the basic text input with search functionality
   - Integrates with existing form validation
   - Uses the same `influencerService` as the marketplace

2. **Step1Content Updates** (`src/components/features/campaigns/Step1Content.tsx`)
   - Imports and uses `InfluencerSearchEntry` instead of basic `InfluencerEntry`
   - Maintains all existing form structure and validation

### API Integration

- **Endpoint**: Uses existing `/api/influencers` endpoint
- **Service**: Leverages `influencerService.getInfluencers()` method
- **Data Source**: InsightIQ sandbox API with real influencer data
- **Pagination**: Limits search results to 10 for performance

### User Experience Flow

1. **User selects platform** (Instagram, YouTube, TikTok, etc.)
2. **User types in search box** (handle, name, or keywords)
3. **Search triggers automatically** after 2 characters
4. **Dropdown shows results** with profile photos and stats
5. **User clicks to select** an influencer
6. **Form auto-fills** handle and platform
7. **Visual confirmation** shows selected influencer with green highlighting

## Search Results Data

Each search result displays:

- **Avatar Image**: Direct from InsightIQ API
- **Name/Handle**: Full name or username
- **Verification Badge**: ✓ for verified accounts
- **Follower Count**: Formatted (600M, 1.2M, 850K)
- **Platform Badge**: Visual platform identifier
- **Engagement Rate**: When available from API

## Example Usage

```typescript
// The search automatically finds influencers like:
{
  name: "Cristiano Ronaldo",
  handle: "cristiano",
  platform: "INSTAGRAM",
  followersCount: 600709593,
  isVerified: true,
  engagementRate: 0.01255,
  avatarUrl: "https://..."
}
```

## Benefits

### For Users

- **Faster workflow**: No need to manually type exact handles
- **Fewer errors**: Visual confirmation reduces typos
- **Better discovery**: See follower counts and verification status
- **Platform integration**: Seamless connection to marketplace data

### For Developers

- **Code reuse**: Leverages existing marketplace infrastructure
- **Consistent UX**: Same search experience across app
- **Type safety**: Full TypeScript integration
- **Error handling**: Robust error states and loading indicators

## Testing

The feature works with:

- ✅ InsightIQ sandbox data (600M+ follower accounts)
- ✅ Real profile photos and verification status
- ✅ Platform filtering (Instagram, YouTube, TikTok, etc.)
- ✅ Form validation and submission
- ✅ Error handling for API failures

## Future Enhancements

- **Recent searches**: Remember recently selected influencers
- **Favorites**: Save frequently used influencers
- **Bulk import**: Import multiple influencers from marketplace
- **Advanced filters**: Age, location, engagement rate filtering
