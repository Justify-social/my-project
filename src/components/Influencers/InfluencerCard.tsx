////////////////////////////////////
// src/components/Influencers/InfluencerCard.tsx
////////////////////////////////////
"use client";

import React from "react";
import { Influencer } from "../../../types/influencer";

interface InfluencerCardProps {
  influencer: Influencer;
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({ influencer }) => {
  return (
    <div className="flex flex-col items-start font-work-sans">
      <img
        src={influencer.avatar}
        alt={`${influencer.name}'s avatar`}
        className="w-16 h-16 object-cover rounded-full mb-2" />

      <h2 className="text-lg font-semibold font-sora">{influencer.name}</h2>
      {influencer.featuredCampaignImage &&
      <img
        src={influencer.featuredCampaignImage}
        alt="Featured Campaign"
        className="mt-2 w-full h-32 object-cover rounded" />

      }
      <p className="text-sm mt-2 font-work-sans">Score: {influencer.dynamicScore}</p>
      <p className="text-sm font-work-sans">Platform: {influencer.platform}</p>
      <p className="text-sm font-work-sans">Tier: {influencer.tier}</p>
      {influencer.bio && <p className="text-sm mt-2 font-work-sans">{influencer.bio}</p>}
    </div>);

};

export default InfluencerCard;