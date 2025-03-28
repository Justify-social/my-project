import React, { useState } from "react";

interface TransparencyPanelProps {
  justifyScore: number;
  breakdown: {
    engagement: number;
    sentiment: number;
    audienceAlignment: number;
    historical: number;
  };
}

const TransparencyPanel: React.FC<TransparencyPanelProps> = ({
  justifyScore,
  breakdown
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="border p-4 rounded mt-4 font-work-sans">
      <h3 className="font-bold mb-2 font-sora">
        Dynamic Justify Score: {justifyScore}
      </h3>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-600 underline text-sm mb-2 font-work-sans">

        {expanded ? "Hide Details" : "Show Details"}
      </button>
      {expanded &&
      <div className="text-sm text-gray-700 font-work-sans">
          <div className="font-work-sans">
            <strong>Engagement Quality:</strong> {breakdown.engagement}%
          </div>
          <div className="font-work-sans">
            <strong>Sentiment Analysis:</strong> {breakdown.sentiment}%
          </div>
          <div className="font-work-sans">
            <strong>Audience Alignment:</strong> {breakdown.audienceAlignment}%
          </div>
          <div className="font-work-sans">
            <strong>Historical Performance:</strong> {breakdown.historical}%
          </div>
        </div>
      }
    </div>);

};

export default TransparencyPanel;