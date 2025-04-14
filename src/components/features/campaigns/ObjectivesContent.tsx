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
  if (!data) return <p className="text-gray-500 font-body">No objectives data available</p>;

  return (
    <div className="space-y-6 font-body">
      {/* KPIs */}
      <div className="mb-6 font-body">
        <h3 className="font-semibold mb-3 font-heading">Key Performance Indicators (KPIs)</h3>
        <div className="space-y-2 font-body">
          <div className="font-body">
            <span className="font-medium font-body">Primary KPI: </span>
            {data.primaryKPI}
          </div>
          <div className="font-body">
            <span className="font-medium font-body">Secondary KPIs: </span>
            {data.secondaryKPIs?.join(', ') || 'None selected'}
          </div>
        </div>
      </div>

      {/* Messaging */}
      <div className="mb-6 font-body">
        <h3 className="font-semibold mb-3 font-heading">Messaging</h3>
        <div className="space-y-3 font-body">
          <div className="font-body">
            <span className="font-medium font-body">Main Message: </span>
            {data.mainMessage}
          </div>
          <div className="font-body">
            <span className="font-medium font-body">Hashtags: </span>
            {data.hashtags?.join(', ') || 'None specified'}
          </div>
          <div className="font-body">
            <span className="font-medium font-body">Memorability Statement: </span>
            {data.memorability}
          </div>
          <div className="font-body">
            <span className="font-medium font-body">Key Benefits: </span>
            {data.keyBenefits}
          </div>
        </div>
      </div>

      {/* Hypotheses */}
      <div className="mb-6 font-body">
        <h3 className="font-semibold mb-3 font-heading">Hypotheses</h3>
        <div className="space-y-3 font-body">
          <div className="font-body">
            <span className="font-medium font-body">Expected Achievements: </span>
            {data.expectedAchievements}
          </div>
          <div className="font-body">
            <span className="font-medium font-body">Purchase Intent Impact: </span>
            {data.purchaseIntent}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="font-body">
        <h3 className="font-semibold mb-3 font-heading">Selected Features</h3>
        <div className="space-y-1 font-body">
          {data.features?.length > 0 ? (
            data.features.map((feature, index) => (
              <div key={index} className="flex items-center font-body">
                <Icon iconId="faCheckLight" className="w-4 h-4 mr-2 text-green-500" />
                {feature}
              </div>
            ))
          ) : (
            <div className="text-gray-500 font-body">No features selected</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectivesContent;
