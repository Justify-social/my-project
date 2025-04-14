# Dashboard Overview

**Last Updated:** 2025-03-07  
**Status:** Active  
**Owner:** Frontend Team

## Overview

The Dashboard is the central hub of Justify.social, providing users with a comprehensive overview of their campaigns, performance metrics, and quick access to key features. It serves as the landing page after login, designed to help marketers capture authentic audience opinions, measure social campaign impact, and identify standout influencers for their brands.

## Page Goal

The Dashboard aims to:

- Present critical campaign information at a glance
- Highlight time-sensitive upcoming activities
- Surface key performance metrics
- Provide direct access to frequently used features

## User Interface Design

![Dashboard Wireframe](../../public/images/dashboard-wireframe.png)

The Dashboard follows a card-based layout with a clear information hierarchy:

```
┌─────────────────────────────────────────────────────────┐
│ HEADER + NAVIGATION                                     │
├─────────────────┬─────────────────┬─────────────────────┤
│                 │                 │                     │
│  CALENDAR       │  UPCOMING       │  QUICK ACTIONS      │
│  OVERVIEW       │  CAMPAIGNS      │                     │
│                 │                 │                     │
├─────────────────┴─────────────────┴─────────────────────┤
│                                                         │
│  PRIMARY METRICS ROW                                    │
│                                                         │
├─────────────────┬─────────────────┬─────────────────────┤
│                 │                 │                     │
│  BRAND HEALTH   │  INFLUENCER     │  RECENT CAMPAIGNS   │
│  SUMMARY        │  MANAGEMENT     │                     │
│                 │                 │                     │
└─────────────────┴─────────────────┴─────────────────────┘
```

## Key Components

### Calendar Overview

Interactive calendar displaying:

- Campaign start and end dates
- Scheduled activities
- Important deadlines
- Color-coded by campaign type

Users can click on any date to see detailed activities for that day.

### Upcoming Campaigns

Displays campaigns that:

- Are scheduled to launch soon
- Have any status other than "DRAFT"
- Are sorted by start date (closest first)

If no upcoming campaigns exist, the card displays "No upcoming campaigns" with a prominent button to create a first campaign.

### Quick Actions

Contextual shortcuts to common tasks:

- Create Campaign button
- View Reports
- Manage Influencers
- Monitor Brand Health
- Run Creative Tests

Actions adapt based on user's recent activities and role permissions.

### Primary Metrics

Key performance indicators presented as:

- Visual trend charts
- Percentage changes from previous period
- Color-coded indicators (green for positive, red for negative)
- Customizable based on user preferences

### Brand Health Summary

Condensed view of brand health metrics:

- Sentiment trend
- Share of voice
- Audience growth
- Engagement rate

With a direct link to the full Brand Health dashboard.

### Influencer Management

Quick view of:

- Top-performing influencers
- Recently added influencers
- Influencers requiring attention
- Safety score overview

### Recent Campaigns

Scrollable list of recently modified campaigns showing:

- Campaign name
- Status
- Last edited date
- Primary KPI performance
- Quick action buttons (view, edit, duplicate)

## Technical Implementation

The Dashboard uses:

- Server components for data fetching
- Client components for interactivity
- Context API for state management
- SWR for data fetching and caching
- Responsive grid system for layout

Data is refreshed through:

- Initial page load
- Polling for real-time updates
- Manual refresh option
- Revalidation on focus

## Performance Considerations

The Dashboard optimizes performance through:

- Lazy loading of secondary content
- Pagination of campaign lists
- Image optimization
- Code splitting
- Memoization of expensive calculations

## Related Documentation

- [Dashboard Usage Guide](./usage.md)
- [Dashboard Components](./components.md)
- [Campaign Wizard Overview](../campaign-wizard/overview.md)
