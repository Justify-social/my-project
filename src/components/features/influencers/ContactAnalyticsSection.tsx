'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@/components/ui/icon/icon';
import { InfluencerProfileData } from '@/types/influencer';

interface ContactAnalyticsSectionProps {
  influencer: InfluencerProfileData;
}

const ContactAnalyticsSection: React.FC<ContactAnalyticsSectionProps> = ({ influencer }) => {
  // Extract comprehensive InsightIQ data
  const insightiq = (influencer as any).insightiq;
  const contactData = insightiq?.contacts;
  const pricingData = insightiq?.pricing;
  const audienceData = insightiq?.audience;
  const profileData = insightiq?.profile;

  // Extract ALL contact information (not just first)
  const allEmails = profileData?.emails || [];
  const allPhones = profileData?.phone_numbers || [];
  const allAddresses = profileData?.addresses || [];

  // Account verification and business details
  const accountDetails = {
    isVerified: profileData?.is_verified || false,
    isBusiness: profileData?.is_business || false,
    isOfficialArtist: profileData?.is_official_artist || false,
    accountType: profileData?.platform_account_type || 'UNKNOWN',
    createdAt: profileData?.platform_profile_published_at,
    category: profileData?.category,
  };

  // Calculate account age if creation date available
  const accountAge = accountDetails.createdAt
    ? Math.floor(
        (Date.now() - new Date(accountDetails.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  // Calculate collaboration viability score
  const hasContactInfo = !!(contactData?.email || contactData?.phone || contactData?.website);
  const hasPricingData = !!pricingData?.pricing;
  const highQualityAudience = (audienceData?.credibility_score || 0) > 0.6;
  const significantReach = (audienceData?.significant_followers_percentage || 0) > 5;

  const collaborationScore =
    [hasContactInfo, hasPricingData, highQualityAudience, significantReach].filter(Boolean).length *
    25;

  // Enhanced Contact Information Card
  const ContactInfoCard = () => (
    <Card className="border-interactive/20 bg-gradient-to-br from-interactive/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faAddressCardLight" className="h-5 w-5 text-interactive" />
          Complete Contact Directory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Multiple Email Addresses */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Email Addresses</div>
          {allEmails.length > 0 ? (
            <div className="space-y-2">
              {allEmails.map((email: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-success" />
                    <div>
                      <a
                        href={`mailto:${email.email_id}`}
                        className="text-sm font-medium text-interactive hover:underline"
                      >
                        {email.email_id}
                      </a>
                      <div className="text-xs text-muted-foreground">{email.type || 'General'}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Icon iconId="faCopyLight" className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No email addresses available</p>
          )}
        </div>

        <Separator />

        {/* Multiple Phone Numbers */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Phone Numbers</div>
          {allPhones.length > 0 ? (
            <div className="space-y-2">
              {allPhones.map((phone: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Icon iconId="faPhoneLight" className="h-4 w-4 text-success" />
                    <div>
                      <span className="text-sm font-medium">{phone.phone_number}</span>
                      <div className="text-xs text-muted-foreground">
                        {phone.type || 'General'} • {phone.country_code || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Icon iconId="faCopyLight" className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No phone numbers available</p>
          )}
        </div>

        <Separator />

        {/* Physical Addresses */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Physical Addresses</div>
          {allAddresses.length > 0 ? (
            <div className="space-y-2">
              {allAddresses.map((address: any, index: number) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon iconId="faMapMarkerAltLight" className="h-4 w-4 text-warning mt-1" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{address.type || 'Address'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {address.street_address && <div>{address.street_address}</div>}
                        <div>
                          {address.city}, {address.state} {address.postal_code}
                        </div>
                        <div>{address.country}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No physical addresses available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Account Verification & Status Card
  const AccountStatusCard = () => (
    <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faShieldCheckLight" className="h-5 w-5 text-success" />
          Account Verification & Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verification Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-interactive/5 border border-interactive/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Icon
                iconId={accountDetails.isVerified ? 'faCircleCheckSolid' : 'faCircleXmarkSolid'}
                className={`h-5 w-5 ${accountDetails.isVerified ? 'text-success' : 'text-destructive'}`}
              />
              <span className="text-sm font-medium">Platform Verified</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Official platform verification status
            </div>
          </div>

          <div className="text-center p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Icon
                iconId={accountDetails.isOfficialArtist ? 'faStarSolid' : 'faStarLight'}
                className={`h-5 w-5 ${accountDetails.isOfficialArtist ? 'text-warning' : 'text-muted-foreground'}`}
              />
              <span className="text-sm font-medium">Official Artist</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {accountDetails.isOfficialArtist ? 'Verified artist account' : 'Standard account'}
            </div>
          </div>
        </div>

        {/* Account Type & Business Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Type:</span>
            <Badge variant={accountDetails.isBusiness ? 'default' : 'secondary'}>
              {accountDetails.isBusiness ? 'Business' : 'Personal'} • {accountDetails.accountType}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge variant="outline">{accountDetails.category || 'Uncategorized'}</Badge>
          </div>

          {accountAge && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Age:</span>
              <Badge variant="outline">
                {accountAge} days ({(accountAge / 365).toFixed(1)} years)
              </Badge>
            </div>
          )}

          {accountDetails.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created:</span>
              <span className="text-sm font-medium">
                {new Date(accountDetails.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Account Authenticity Score */}
        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Authenticity Assessment</span>
            <Badge variant="default">
              {accountDetails.isVerified && accountDetails.isBusiness
                ? 'High'
                : accountDetails.isVerified
                  ? 'Medium'
                  : 'Standard'}{' '}
              Trust
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Based on verification status, account type, and platform indicators
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Pricing Information Card
  const PricingInfoCard = () => (
    <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faDollarSignLight" className="h-5 w-5 text-success" />
          Collaboration Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pricingData?.pricing ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Currency</span>
              <Badge variant="outline" className="font-mono">
                {pricingData.pricing.currency || 'USD'}
              </Badge>
            </div>

            {pricingData.pricing.post_type && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-primary">Content Type Pricing</div>
                {Object.entries(pricingData.pricing.post_type).map(
                  ([type, range]: [string, any]) => (
                    <div key={type} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {type.replace('_', ' ')}
                        </span>
                        <Icon iconId="faImageLight" className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-lg font-bold text-success">
                        ${range.min?.toLocaleString()} - ${range.max?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Average: ${Math.round((range.min + range.max) / 2).toLocaleString()}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {pricingData.explanations && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="text-sm font-medium text-primary">Pricing Factors</div>
                  {Object.entries(pricingData.explanations).map(([factor, data]: [string, any]) => (
                    <div key={factor} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{factor.replace('_', ' ')}</span>
                        <Badge variant="secondary">{data.level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{data.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Icon
              iconId="faDollarSignLight"
              className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground mb-4">
              Pricing information not available in public data
            </p>
            <Button variant="outline" size="sm">
              <Icon iconId="faCalculatorLight" className="h-4 w-4 mr-2" />
              Request Custom Quote
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Outreach Actions Card
  const OutreachActionsCard = () => (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faRocketLight" className="h-5 w-5 text-accent" />
          Initiate Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full" disabled={!hasContactInfo}>
          <Icon iconId="faEnvelopeLight" className="h-4 w-4 mr-2" />
          Send Collaboration Email
        </Button>

        <Button variant="outline" className="w-full">
          <Icon iconId="faCalendarLight" className="h-4 w-4 mr-2" />
          Schedule Discovery Call
        </Button>

        <Button variant="outline" className="w-full">
          <Icon iconId="faFileTextLight" className="h-4 w-4 mr-2" />
          Generate Media Kit Request
        </Button>

        <Separator className="my-3" />

        <div className="space-y-2">
          <div className="text-sm font-medium text-primary">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="ghost" className="justify-start">
              <Icon iconId="faBookmarkLight" className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <Icon iconId="faShareLight" className="h-3 w-3 mr-1" />
              Share
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <Icon iconId="faDownloadLight" className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <Icon iconId="faFlagLight" className="h-3 w-3 mr-1" />
              Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!contactData && !pricingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Icon
              iconId="faAddressCardLight"
              className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Contact and pricing information will be available here once extracted from InsightIQ
              data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContactInfoCard />
        <AccountStatusCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PricingInfoCard />
        <OutreachActionsCard />
      </div>
    </div>
  );
};

export default ContactAnalyticsSection;
