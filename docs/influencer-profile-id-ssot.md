# Influencer Profile Identification: Single Source of Truth (SSOT)

## Overview

In the influencer marketplace feature, ensuring accurate identification of influencer profiles is critical to prevent data mismatches and ensure a seamless user experience. This document outlines the approach to using `platform_profile_id` as the Single Source of Truth (SSOT) for identifying influencer profiles.

## Rationale

The `platform_profile_id` is a unique identifier provided by the InsightIQ API that directly corresponds to a specific influencer's profile on a given platform. Unlike other identifiers such as `workPlatformId`, which may not uniquely identify a profile, `platform_profile_id` ensures that the correct profile data is fetched and displayed.

### Previous Issue

An issue was identified where using `workPlatformId` led to mismatches in profile data, causing incorrect influencer profiles to be displayed (e.g., clicking on Leo Messi's profile loaded Dwayne Johnson's data). This was due to the non-unique nature of `workPlatformId` in certain contexts.

### Solution

To resolve this, the codebase has been updated to prioritize `platform_profile_id` (mapped to `profileId` in our types) for fetching and linking influencer profiles. This identifier is used across all relevant components and API calls to ensure consistency and accuracy.

## Implementation Details

- **Type Definitions**: The `profileId` field has been added to `InfluencerSummary` and `InfluencerProfileData` interfaces in `src/types/influencer.ts`.
- **Data Mapping**: In `src/lib/data-mapping/influencer.ts`, `platform_profile_id` from InsightIQ data is mapped to `profileId`.
- **Service Logic**: `src/lib/insightiqService.ts` prioritizes fetching profiles using `profileId` with the `GET /v1/profiles/{id}` endpoint when available.
- **API Routes**: `src/app/api/influencers/[identifier]/route.ts` extracts `profileId` from query parameters and passes it to the service.
- **UI Components**: Components like `InfluencerSummaryCard.tsx` and profile pages use `profileId` for accurate linking to profiles.

## Guidelines for Developers

1. **Always Use `profileId`**: When fetching or linking to an influencer profile, always check for and use the `profileId` if available. This ensures the correct profile is accessed.
2. **Fallback to Other Identifiers**: Only if `profileId` is not available should you fall back to other identifiers like `identifier` and `platformId`, but log a warning to indicate this fallback.
3. **Update Documentation**: If you modify how profiles are identified or fetched, update this document to reflect the changes.
4. **Test for Mismatches**: When implementing new features or modifying existing ones related to influencer profiles, test to ensure that the displayed data matches the requested profile.

## Related JIRA Ticket

- **JIRA-7**: Fix influencer profile loading to use `platform_profile_id` for accurate data retrieval.

By adhering to this SSOT approach, we ensure data integrity and prevent future issues with profile mismatches. If you have questions or need clarification, please consult with the development team or refer to the JIRA ticket for more context.
