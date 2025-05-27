import React from 'react';
import { Icon } from '@/components/ui/icon/icon';

interface ObjectivesContentProps {
  data?: {
    primaryKPI: string;
    secondaryKPIs: string[];
    mainMessage: string;
    hashtags: string[];
    memorability: string;
    keyBenefits: string;
    expectedAchievements: string;
    purchaseIntent: string;
    features: string[];
  };
}

const ObjectivesContent: React.FC<ObjectivesContentProps> = ({ data }) => {
  if (!data) return <p className="text-gray-500">No objectives data available</p>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Key Performance Indicators (KPIs)</h3>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Primary KPI: </span>
            {data.primaryKPI}
          </div>
          <div>
            <span className="font-medium">Secondary KPIs: </span>
            {data.secondaryKPIs?.join(', ') || 'None selected'}
          </div>
        </div>
      </div>

      {/* Messaging */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Messaging</h3>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Main Message: </span>
            {data.mainMessage}
          </div>
          <div>
            <span className="font-medium">Hashtags: </span>
            {data.hashtags?.join(', ') || 'None specified'}
          </div>
          <div>
            <span className="font-medium">Memorability Statement: </span>
            {data.memorability}
          </div>
          <div>
            <span className="font-medium">Key Benefits: </span>
            {data.keyBenefits}
          </div>
        </div>
      </div>

      {/* Hypotheses */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Hypotheses</h3>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Expected Achievements: </span>
            {data.expectedAchievements}
          </div>
          <div>
            <span className="font-medium">Purchase Intent Impact: </span>
            {data.purchaseIntent}
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="font-semibold mb-3">Selected Features</h3>
        <div className="space-y-1">
          {data.features?.length > 0 ? (
            data.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Icon iconId="faCheckLight" className="w-4 h-4 mr-2 text-success" />
                {feature}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No features selected</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectivesContent;
