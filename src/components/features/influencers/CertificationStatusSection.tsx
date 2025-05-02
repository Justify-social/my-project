'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/icon';

interface CertificationStatusSectionProps {
  influencer: InfluencerProfileData;
  // Note: Specific certification details (beyond InsightIQ verification)
  // are not currently in InfluencerProfileData.
  // This component will likely need enhancing when certification data structure is defined.
}

// Placeholder structure removed

export function CertificationStatusSection({ influencer }: CertificationStatusSectionProps) {
  const { isVerified } = influencer;

  // For now, only display the InsightIQ verification status
  if (!isVerified) {
    // Optionally show a message that the influencer is not verified,
    // or simply render nothing if only verified badges are desired.
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Display Justify Verified based on isInsightIQVerified */}
        <div className={`flex items-start gap-4 p-4 rounded-lg bg-sky-100 text-sky-800`}>
          <Icon iconId={'faCircleCheckSolid'} className="h-8 w-8 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Justify Verified Influencer</h4>
          </div>
        </div>

        {/* Placeholder for other potential certifications */}
        {/* 
                <div className={`flex items-start gap-4 p-4 rounded-lg bg-blue-100 text-blue-800`}>
                    <Icon iconId={'faAwardSimple'} className="h-8 w-8 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Influencer of the Year 2023</h4>
                        <p className="text-sm">Earned based on exceptional performance.</p>
                    </div>
                </div> 
                */}
      </CardContent>
    </Card>
  );
}
