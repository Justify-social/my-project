"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; // Import default styles

interface Campaign {
  id: number;
  name: string;
  startDate: string; // ISO date string
  endDate?: string;
}

interface CalendarUpcomingProps {
  campaigns: Campaign[];
}

const CalendarUpcoming: React.FC<CalendarUpcomingProps> = ({ campaigns }) => {
  const [value, setValue] = useState(new Date());

  // Render a red dot on days with a campaign start date
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split("T")[0];
      const hasCampaign = campaigns.some(campaign => {
        const campaignDate = new Date(campaign.startDate).toISOString().split("T")[0];
        return campaignDate === dateString;
      });
      return hasCampaign ? <div style={{ color: 'red', fontSize: '1.2rem' }}>•</div> : null;
    }
    return null;
  };

  // Wrap the Calendar in a div with a fixed aria-label
  return (
    <div aria-label="Calendar">
      <Calendar 
        onChange={setValue} 
        value={value} 
        tileContent={tileContent}
      />
    </div>
  );
};

export default CalendarUpcoming;
