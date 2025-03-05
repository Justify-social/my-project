# Dashboard Overview

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Frontend Team

## Overview

The Dashboard is the central hub of the Campaign Wizard application, providing users with a comprehensive overview of their campaigns, performance metrics, and quick access to key features. It serves as the landing page after login and is designed to give users immediate insights into their marketing activities.

## Key Components

### Campaign Summary

The Campaign Summary section displays an overview of all campaigns, categorized by status:

- **Active Campaigns**: Currently running campaigns
- **Draft Campaigns**: Campaigns in progress
- **Completed Campaigns**: Finished campaigns
- **Upcoming Campaigns**: Scheduled campaigns

Each campaign card shows key information:
- Campaign name
- Status
- Date range
- Primary KPI
- Performance indicator

### Performance Metrics

The Performance Metrics section provides aggregated data across all campaigns:

- **Brand Awareness**: Overall brand awareness metrics
- **Engagement**: User engagement statistics
- **Conversion**: Conversion rates and totals
- **ROI**: Return on investment calculations

Metrics are visualized using charts and graphs for easy interpretation.

### Quick Actions

The Quick Actions section provides shortcuts to common tasks:

- **Create Campaign**: Start a new campaign
- **View Reports**: Access reporting tools
- **Manage Assets**: View and manage creative assets
- **Team Collaboration**: Access team features

### Recent Activity

The Recent Activity feed shows the latest updates across the application:

- Campaign status changes
- New comments or feedback
- Team member actions
- System notifications

### Calendar View

The Calendar View displays upcoming events and deadlines:

- Campaign start and end dates
- Scheduled reports
- Team meetings
- Important milestones

## Technical Implementation

The Dashboard is built using:

- **React Components**: Modular UI components
- **Context API**: State management for dashboard data
- **React Query**: Data fetching and caching
- **Chart.js**: Data visualization
- **CSS Modules**: Component styling

## Customization Options

Users can customize their dashboard experience:

- **Widget Arrangement**: Drag and drop widgets to rearrange
- **Widget Visibility**: Show/hide specific widgets
- **Time Range**: Filter data by time period
- **Favorites**: Pin important campaigns or reports

## Data Refresh

Dashboard data is kept up-to-date through:

- **Initial Load**: Data loaded on page load
- **Polling**: Regular background updates (every 5 minutes)
- **Manual Refresh**: User-triggered refresh
- **Real-time Updates**: WebSocket for critical updates

## Responsive Design

The Dashboard is fully responsive and adapts to different screen sizes:

- **Desktop**: Full layout with all widgets
- **Tablet**: Reorganized layout with scrollable sections
- **Mobile**: Simplified view with collapsible sections

## Accessibility

The Dashboard follows accessibility best practices:

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and roles
- **Color Contrast**: WCAG 2.1 AA compliant
- **Focus Management**: Clear focus indicators

## Related Documentation

- [Dashboard Usage Guide](./usage.md)
- [Dashboard Components](./components.md)
- [Campaign Wizard](../campaign-wizard/overview.md) 