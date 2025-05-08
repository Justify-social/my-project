# InsightIQ Integration Concepts

**Last Reviewed:** 2025-05-09
**Status:** Placeholder - Needs Content

## Overview

This document explains the conceptual role of InsightIQ within the Justify platform, focusing on _what_ it provides and _why_ we integrate with it, rather than the technical implementation details (which are covered in [External Integrations](../architecture/external-integrations.md)).

## What is InsightIQ?

_(Action: Product Manager/Tech Lead for Influencer Discovery to provide a clear description of InsightIQ and its primary function in the market.)_

- **Example Text:** InsightIQ is a third-party platform specializing in [Describe InsightIQ's core offering - e.g., influencer analytics, audience demographic data, platform connection aggregation]. It provides standardized access to data across multiple social media platforms.

## Why We Integrate with InsightIQ

_(Action: Product Manager/Tech Lead to detail the strategic reasons for choosing and integrating with InsightIQ.)_

- **Example Points:**
  - Provides access to comprehensive influencer performance metrics not readily available otherwise.
  - Offers standardized data structures across different social platforms.
  - Enables verification of influencer accounts.
  - Provides audience demographic data crucial for matching influencers to campaign target audiences.
  - Reduces the need for Justify to build and maintain direct integrations with numerous social media platform APIs.

## Key Concepts & Data Provided

_(Action: Tech Lead to outline the key data points and concepts leveraged from InsightIQ.)_

- **Influencer Profiles**: Basic information, follower counts, verification status.
- **Performance Metrics**: Engagement rates, reach estimates, content performance.
- **Audience Demographics**: Age, gender, location, interests (where available).
- **Account Linking**: How Justify connects its internal representation (`MarketplaceInfluencer`) to specific accounts within InsightIQ (`InsightIQAccountLink`).
- **Data Freshness**: Understanding how often InsightIQ data is updated and how Justify handles potentially stale data (e.g., `insightiqDataLastRefreshedAt` field).

## Data Flow Concept

_(Action: Tech Lead to provide a high-level conceptual diagram or description of the data flow.)_

- **Example:** Justify Backend searches/queries InsightIQ API -> InsightIQ returns influencer data -> Justify Backend processes, scores, potentially caches/persists data (`MarketplaceInfluencer`), and serves it to the Justify Frontend.

Understanding these concepts is crucial for developers working on the Influencer Discovery feature and for team members discussing influencer data capabilities.
