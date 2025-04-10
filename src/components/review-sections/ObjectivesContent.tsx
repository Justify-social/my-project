import React from 'react';
import { Icon } from '@/components/ui/icon';

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
  if (!data) return <p className="text-gray-500 font-work-sans">No objectives data available</p>;

  return (
    <div className="space-y-6 font-work-sans">
      {/* KPIs */}
      <div className="mb-6 font-work-sans">
        <h3 className="font-semibold mb-3 font-sora">Key Performance Indicators (KPIs)</h3>
        <div className="space-y-2 font-work-sans">
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Primary KPI: </span>
            {data.primaryKPI}
          </div>
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Secondary KPIs: </span>
            {data.secondaryKPIs?.join(', ') || 'None selected'}
          </div>
        </div>
      </div>

      {/* Messaging */}
      <div className="mb-6 font-work-sans">
        <h3 className="font-semibold mb-3 font-sora">Messaging</h3>
        <div className="space-y-3 font-work-sans">
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Main Message: </span>
            {data.mainMessage}
          </div>
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Hashtags: </span>
            {data.hashtags?.join(', ') || 'None specified'}
          </div>
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Memorability Statement: </span>
            {data.memorability}
          </div>
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Key Benefits: </span>
            {data.keyBenefits}
          </div>
        </div>
      </div>

      {/* Hypotheses */}
      <div className="mb-6 font-work-sans">
        <h3 className="font-semibold mb-3 font-sora">Hypotheses</h3>
        <div className="space-y-3 font-work-sans">
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Expected Achievements: </span>
            {data.expectedAchievements}
          </div>
          <div className="font-work-sans">
            <span className="font-medium font-work-sans">Purchase Intent Impact: </span>
            {data.purchaseIntent}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="font-work-sans">
        <h3 className="font-semibold mb-3 font-sora">Selected Features</h3>
        <div className="space-y-1 font-work-sans">
          {data.features?.length > 0 ?
            data.features.map((feature, index) =>
              <div key={index} className="flex items-center font-work-sans">
                <Icon iconId="faCheckLight" className="w-4 h-4 mr-2 text-success" />
                {feature}
              </div>
            ) :
            <div className="text-muted-foreground font-work-sans">No features selected</div>
          }
        </div>
      </div>
    </div>);

};

export default ObjectivesContent;