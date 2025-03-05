# Dashboard Components

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Frontend Team

## Overview

This document details the key components that make up the Dashboard in the Campaign Wizard application. These components are designed to be modular, reusable, and customizable.

## Component Architecture

The Dashboard follows a hierarchical component structure:

```
Dashboard
├── DashboardHeader
│   ├── PageTitle
│   ├── UserMenu
│   └── NotificationsMenu
├── DashboardGrid
│   ├── CampaignSummaryWidget
│   ├── PerformanceMetricsWidget
│   ├── QuickActionsWidget
│   ├── RecentActivityWidget
│   └── CalendarWidget
└── DashboardFooter
    └── SystemStatus
```

## Core Components

### DashboardHeader

The header component that appears at the top of the Dashboard.

**Props:**
- `title`: String - The page title
- `user`: Object - Current user information
- `notifications`: Array - Notification items

**State:**
- `isUserMenuOpen`: Boolean - Whether the user menu is open
- `isNotificationsOpen`: Boolean - Whether the notifications panel is open

**Example:**
```jsx
<DashboardHeader 
  title="Dashboard" 
  user={currentUser} 
  notifications={userNotifications} 
/>
```

### DashboardGrid

The main container for dashboard widgets, supporting drag-and-drop rearrangement.

**Props:**
- `layout`: Object - Widget layout configuration
- `widgets`: Array - List of widget components to display
- `isEditing`: Boolean - Whether the dashboard is in edit mode

**State:**
- `currentLayout`: Object - Current widget positions
- `isDragging`: Boolean - Whether a widget is being dragged

**Example:**
```jsx
<DashboardGrid
  layout={userLayout}
  widgets={activeWidgets}
  isEditing={isCustomizing}
/>
```

## Widget Components

### CampaignSummaryWidget

Displays a summary of campaigns by status.

**Props:**
- `campaigns`: Array - List of campaign objects
- `onCampaignClick`: Function - Handler for campaign click
- `filter`: String - Current filter value

**State:**
- `activeTab`: String - Currently selected status tab
- `visibleCampaigns`: Array - Filtered campaigns to display

**Example:**
```jsx
<CampaignSummaryWidget
  campaigns={userCampaigns}
  onCampaignClick={handleCampaignSelect}
  filter="all"
/>
```

### PerformanceMetricsWidget

Displays performance metrics with charts and graphs.

**Props:**
- `metrics`: Object - Performance data
- `timeRange`: String - Selected time period
- `chartType`: String - Type of chart to display

**State:**
- `selectedMetrics`: Array - Metrics selected for display
- `isExporting`: Boolean - Whether export is in progress

**Example:**
```jsx
<PerformanceMetricsWidget
  metrics={performanceData}
  timeRange="30days"
  chartType="bar"
/>
```

### QuickActionsWidget

Provides shortcut buttons for common actions.

**Props:**
- `actions`: Array - List of action objects
- `onActionClick`: Function - Handler for action click

**Example:**
```jsx
<QuickActionsWidget
  actions={availableActions}
  onActionClick={handleActionSelect}
/>
```

### RecentActivityWidget

Displays a feed of recent activities and notifications.

**Props:**
- `activities`: Array - List of activity objects
- `onActivityClick`: Function - Handler for activity click
- `maxItems`: Number - Maximum number of items to display

**State:**
- `filter`: String - Current activity type filter
- `hasUnread`: Boolean - Whether there are unread activities

**Example:**
```jsx
<RecentActivityWidget
  activities={recentActivities}
  onActivityClick={handleActivitySelect}
  maxItems={10}
/>
```

### CalendarWidget

Displays a calendar with upcoming events and deadlines.

**Props:**
- `events`: Array - List of event objects
- `view`: String - Calendar view mode (month/week/day)
- `onEventClick`: Function - Handler for event click

**State:**
- `currentDate`: Date - Currently displayed date
- `selectedEvent`: Object - Currently selected event

**Example:**
```jsx
<CalendarWidget
  events={calendarEvents}
  view="month"
  onEventClick={handleEventSelect}
/>
```

## Utility Components

### MetricCard

Displays a single metric with value and trend.

**Props:**
- `title`: String - Metric name
- `value`: Number - Current value
- `previousValue`: Number - Previous value for comparison
- `format`: String - Value format (percentage, currency, number)
- `icon`: Element - Icon component

**Example:**
```jsx
<MetricCard
  title="Brand Awareness"
  value={65}
  previousValue={58}
  format="percentage"
  icon={<AwarenessIcon />}
/>
```

### CampaignCard

Displays a summary of a single campaign.

**Props:**
- `campaign`: Object - Campaign data
- `onClick`: Function - Click handler
- `actions`: Array - Available actions

**Example:**
```jsx
<CampaignCard
  campaign={campaignData}
  onClick={handleClick}
  actions={cardActions}
/>
```

### ActivityItem

Displays a single activity or notification.

**Props:**
- `activity`: Object - Activity data
- `onClick`: Function - Click handler
- `isUnread`: Boolean - Whether the activity is unread

**Example:**
```jsx
<ActivityItem
  activity={activityData}
  onClick={handleClick}
  isUnread={true}
/>
```

## Customization Components

### DashboardCustomizer

Interface for customizing the dashboard layout.

**Props:**
- `layout`: Object - Current layout configuration
- `availableWidgets`: Array - All possible widgets
- `activeWidgets`: Array - Currently active widgets
- `onSave`: Function - Save handler
- `onCancel`: Function - Cancel handler

**State:**
- `draftLayout`: Object - Draft layout being edited
- `draftWidgets`: Array - Draft widget selection

**Example:**
```jsx
<DashboardCustomizer
  layout={currentLayout}
  availableWidgets={allWidgets}
  activeWidgets={visibleWidgets}
  onSave={handleSaveLayout}
  onCancel={handleCancelEdit}
/>
```

## Technical Details

### State Management

Dashboard state is managed using React Context:

```jsx
// DashboardContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [layout, setLayout] = useState(defaultLayout);
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load user preferences
  useEffect(() => {
    // Load saved layout and widgets
  }, []);
  
  // Save changes
  const saveLayout = (newLayout, newWidgets) => {
    setLayout(newLayout);
    setWidgets(newWidgets);
    setIsEditing(false);
    // Persist to backend
  };
  
  return (
    <DashboardContext.Provider value={{
      layout,
      widgets,
      isEditing,
      setIsEditing,
      saveLayout
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
```

### Data Fetching

Dashboard data is fetched using React Query:

```jsx
// useDashboardData.js
import { useQuery } from 'react-query';
import { fetchCampaigns, fetchMetrics, fetchActivities, fetchEvents } from '../api';

export function useDashboardData() {
  const campaignsQuery = useQuery('campaigns', fetchCampaigns, {
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });
  
  const metricsQuery = useQuery('metrics', fetchMetrics, {
    refetchInterval: 5 * 60 * 1000
  });
  
  const activitiesQuery = useQuery('activities', fetchActivities, {
    refetchInterval: 60 * 1000 // 1 minute
  });
  
  const eventsQuery = useQuery('events', fetchEvents, {
    refetchInterval: 5 * 60 * 1000
  });
  
  return {
    campaigns: campaignsQuery.data || [],
    metrics: metricsQuery.data || {},
    activities: activitiesQuery.data || [],
    events: eventsQuery.data || [],
    isLoading: campaignsQuery.isLoading || metricsQuery.isLoading || 
               activitiesQuery.isLoading || eventsQuery.isLoading,
    error: campaignsQuery.error || metricsQuery.error || 
           activitiesQuery.error || eventsQuery.error
  };
}
```

## Related Documentation

- [Dashboard Overview](./overview.md)
- [Dashboard Usage Guide](./usage.md)
- [React Component Library](../../development/component-library.md) 