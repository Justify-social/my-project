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
  breakdown,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="border p-4 rounded mt-4">
      <h3 className="font-bold mb-2">
        Dynamic Justify Score: {justifyScore}
      </h3>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-600 underline text-sm mb-2"
      >
        {expanded ? "Hide Details" : "Show Details"}
      </button>
      {expanded && (
        <div className="text-sm text-gray-700">
          <div>
            <strong>Engagement Quality:</strong> {breakdown.engagement}%
          </div>
          <div>
            <strong>Sentiment Analysis:</strong> {breakdown.sentiment}%
          </div>
          <div>
            <strong>Audience Alignment:</strong> {breakdown.audienceAlignment}%
          </div>
          <div>
            <strong>Historical Performance:</strong> {breakdown.historical}%
          </div>
        </div>
      )}
    </div>
  );
};

export default TransparencyPanel;
