# Dashboard Status Visualization Implementation Instructions

This document provides detailed instructions for implementing status visualization in the dashboard. These changes will color-code campaigns by their status and ensure all campaigns (not just active ones) are displayed in both the upcoming section and calendar view.

## 1. Add getStatusInfo Function

Add this function near the top of the `DashboardContent.tsx` file, just after other helper functions:

```javascript
// Helper to get status color and text
const getStatusInfo = (status: string) => {
  // Normalize status to lowercase for case-insensitive matching
  const normalizedStatus = (status || '').toLowerCase();
  switch (normalizedStatus) {
    case 'approved':
      return {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved'
      };
    case 'active':
      return {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Active'
      };
    case 'submitted':
      return {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Submitted'
      };
    case 'in_review':
    case 'in-review':
    case 'inreview':
      return {
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'In Review'
      };
    case 'paused':
      return {
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Paused'
      };
    case 'completed':
      return {
        class: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Completed'
      };
    case 'draft':
    default:
      return {
        class: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Draft'
      };
  }
};
```

## 2. Update CampaignCard Component

Modify the CampaignCard component to include status badges. Find the return statement in CampaignCard and update the div structure to include the status badge:

```javascript
return <motion.div initial={{
  opacity: 0,
  y: 10
}} animate={{
  opacity: 1,
  y: 0
}} className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => onClick ? onClick() : router.push(`/campaigns/${campaign.id}`)}>

    <div className="p-3 sm:p-4 font-work-sans">
      <div className="flex items-start justify-between font-work-sans">
        <div className="flex-1 mr-2 font-work-sans">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-medium text-[var(--primary-color)] font-sora">{campaign.campaignName}</h3>
            <StatusBadge status={campaign.submissionStatus || 'draft'} size="sm" />
          </div>
          <p className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans">
            {new Date(campaign.startDate).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short'
          })}
            {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short'
          })}`}
          </p>
        </div>
        <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center ${campaign.platform === 'Instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : campaign.platform === 'TikTok' ? 'bg-black' : 'bg-red-600'} font-work-sans`}>
          {/* Platform icons remain unchanged */}
          {campaign.platform === 'Instagram' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>}
          {campaign.platform === 'TikTok' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>}
          {campaign.platform === 'YouTube' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>}
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-4 text-xs font-work-sans">
        <div className="font-work-sans">
          <p className="text-[var(--secondary-color)] font-work-sans">Budget</p>
          <p className="font-medium text-[var(--primary-color)] font-work-sans">
            {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
          }).format(campaign.totalBudget)}
          </p>
        </div>
        <div className="font-work-sans">
          <p className="text-[var(--secondary-color)] font-work-sans">Primary KPI</p>
          <div className="flex items-center gap-1.5 font-work-sans">
            <img src={kpiInfo.icon} alt={kpiInfo.title} className="w-4 h-4" />

            <p className="font-medium text-[var(--primary-color)] font-work-sans">{kpiInfo.title}</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>;
```

## 3. Update Calendar Event Creation

Modify the calendarEvents useMemo function to include status-based colors:

```javascript
// Calendar events for the upcoming campaigns - include ALL campaigns for the calendar
const calendarEvents = useMemo(() => {
  console.log('Creating calendar events from campaigns:', campaignsData?.campaigns?.length || 0);
  
  // Make sure we have campaigns data
  if (!campaignsData?.campaigns || campaignsData.campaigns.length === 0) {
    console.log('No campaigns data available for calendar');
    return [];
  }
  
  // Map all campaigns to calendar events
  const events = campaignsData.campaigns
    .filter(campaign => campaign && campaign.id) // Ensure valid campaign objects
    .map(campaign => {
      // Ensure valid dates
      let start = new Date();
      try {
        const startDate = new Date(campaign.startDate);
        if (!isNaN(startDate.getTime())) {
          start = startDate;
        }
      } catch (e) {
        console.error('Invalid start date:', campaign.startDate);
      }
      
      // End date defaults to 1 day after start if not provided or invalid
      let end = new Date(start);
      end.setDate(end.getDate() + 1);
      try {
        if (campaign.endDate) {
          const endDate = new Date(campaign.endDate);
          if (!isNaN(endDate.getTime())) {
            end = endDate;
          }
        }
      } catch (e) {
        console.error('Invalid end date:', campaign.endDate);
      }

      // Get status info for colors
      const statusInfo = getStatusInfo(campaign.submissionStatus || 'draft');
      
      // Create the calendar event
      return {
        id: campaign.id,
        title: campaign.campaignName,
        start: start,
        end: end,
        platform: campaign.platform || 'other',
        budget: campaign.totalBudget,
        kpi: campaign.primaryKPI,
        status: campaign.submissionStatus || 'draft',
        statusText: statusInfo.text,
        statusClass: statusInfo.class,
        color: getCampaignColor(campaign.platform || 'other')
      };
    });
  
  console.log('Total calendar events created:', events.length);
  
  // Log a few events for debugging
  events.slice(0, 3).forEach((event, index) => {
    console.log(`Calendar event ${index}:`, {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      platform: event.platform,
      status: event.status,
      statusText: event.statusText,
      color: event.color
    });
  });
  
  return events;
}, [campaignsData?.campaigns]);
```

## 4. Update CalendarMonthView Component

Add a status legend to the CalendarMonthView component by modifying its return statement. Add this before the closing </div>:

```javascript
{/* Status legend */}
<div className="p-2 flex flex-wrap gap-2 border-t border-[var(--divider-color)]">
  <span className="text-xs font-medium text-gray-500">Status:</span>
  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-800 border border-gray-200">
    <span className="w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
    Draft
  </span>
  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-800 border border-green-200">
    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
    Active/Approved/Submitted
  </span>
  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
    In Review/Paused
  </span>
  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-blue-100 text-blue-800 border border-blue-200">
    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
    Completed
  </span>
</div>
```

## 5. Update Calendar Day Rendering

If there is a calendar grid rendering section, find where it renders event elements and update to use status-based styling:

```javascript
{day.events.map((event) => (
  <div
    key={event.id}
    className={`text-xs truncate p-1 rounded ${event.statusClass} border cursor-pointer`}
    onMouseEnter={() => setHoverEvent(event.id)}
    onMouseLeave={() => setHoverEvent(null)}
    title={`${event.title} (${event.statusText})`}
  >
    {event.title}
  </div>
))}
```

## 6. Remove Status Filtering

Replace the activeCampaigns useMemo function with this version that doesn't filter by status:

```javascript
// Process campaigns for different views - include ALL campaigns, not just active ones
const activeCampaigns = useMemo(() => {
  // Return all campaigns without status filtering
  return campaignsData?.campaigns || [];
}, [campaignsData?.campaigns]);
```

## Implementation Notes

1. These changes will display all campaigns regardless of status
2. Each campaign will be color-coded according to its status
3. Status badges will be displayed in the campaign cards
4. The calendar will include a legend explaining the status colors
5. Campaign status will be visible in tooltips and visual indicators

After making these changes, the dashboard will show all campaigns with clear status differentiation. 