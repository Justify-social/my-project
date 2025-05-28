'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor';

interface ProfessionalIntelligenceCardProps {
  influencer: InfluencerProfileData;
}

// Helper function for one-click actions
const copyToClipboard = async (text: string, label: string) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error(`Failed to copy ${label}.`);
      console.error('Copy error:', err);
    }
  } else {
    toast.error('Clipboard access not available.');
  }
};

// Account type styling
const getAccountTypeStyles = (accountType: string) => {
  switch (accountType) {
    case 'BUSINESS':
      return {
        badge: 'bg-primary/10 text-primary border-primary/20',
        icon: 'faBuildingLight',
      };
    case 'CREATOR':
      return {
        badge: 'bg-accent/10 text-accent border-accent/20',
        icon: 'faStarLight',
      };
    case 'PERSONAL':
      return {
        badge: 'bg-secondary/10 text-secondary border-secondary/20',
        icon: 'faUserLight',
      };
    default:
      return {
        badge: 'bg-muted/10 text-muted-foreground border-muted/20',
        icon: 'faQuestionLight',
      };
  }
};

export const ProfessionalIntelligenceCard: React.FC<ProfessionalIntelligenceCardProps> = ({
  influencer,
}) => {
  // 🎯 SSOT: Use centralized data extraction
  const extractedData = extractInsightIQData(influencer);
  const professionalData = extractedData.professional;
  const accountTypeStyles = getAccountTypeStyles(professionalData.accountType);

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-accent/20 bg-gradient-to-br from-accent/5 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faUserLight" className="text-accent w-5 h-5" />
            <span className="text-primary">Professional Information</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-xs', accountTypeStyles.badge)}>
              <Icon iconId={accountTypeStyles.icon} className="w-3 h-3 mr-1" />
              {professionalData.accountType}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Contact Methods - Apple-style action cards */}
        {professionalData.emails.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email Contacts
            </div>
            {professionalData.emails.map((email, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg transition-colors',
                  'bg-muted/30 hover:bg-muted/50 border border-border/50',
                  email.isPrimary && 'bg-accent/5 border-accent/20'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon
                    iconId="faEnvelopeLight"
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      email.isPrimary ? 'text-accent' : 'text-muted-foreground'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{email.email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {email.type}
                      {email.isPrimary && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Primary
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButtonAction
                          iconBaseName="faCopy"
                          hoverColorClass="text-accent"
                          onClick={() => copyToClipboard(email.email, 'Email')}
                          ariaLabel="Copy email"
                          className="hover:bg-accent/10 hover:text-accent"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Copy email</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButtonAction
                          iconBaseName="faEnvelope"
                          hoverColorClass="text-accent"
                          onClick={() => window.open(`mailto:${email.email}`, '_blank')}
                          ariaLabel="Send email"
                          className="hover:bg-accent/10 hover:text-accent"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Send email</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phone Numbers */}
        {professionalData.phoneNumbers.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Phone Numbers
            </div>
            {professionalData.phoneNumbers.map((phone, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon
                    iconId="faPhoneLight"
                    className="w-4 h-4 text-muted-foreground flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{phone.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {phone.type} {phone.country && `(${phone.country})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButtonAction
                          iconBaseName="faCopy"
                          hoverColorClass="text-accent"
                          onClick={() => copyToClipboard(phone.number, 'Phone number')}
                          ariaLabel="Copy phone"
                          className="hover:bg-accent/10 hover:text-accent"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Copy phone</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButtonAction
                          iconBaseName="faPhone"
                          hoverColorClass="text-accent"
                          onClick={() => window.open(`tel:${phone.number}`, '_blank')}
                          ariaLabel="Call phone"
                          className="hover:bg-accent/10 hover:text-accent"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Call phone</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Website */}
        {professionalData.website && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Website
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Icon
                  iconId="faGlobeLight"
                  className="w-4 h-4 text-muted-foreground flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium text-interactive hover:underline cursor-pointer truncate"
                    onClick={() => window.open(professionalData.website!, '_blank')}
                  >
                    Visit Website
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {professionalData.website}
                  </p>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconButtonAction
                      iconBaseName="faArrowRight"
                      hoverColorClass="text-accent"
                      onClick={() => window.open(professionalData.website!, '_blank')}
                      ariaLabel="Open website"
                      className="hover:bg-accent/10 hover:text-accent"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Open website</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Verification & Location Intelligence */}
        <div className="space-y-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account Intelligence
          </div>

          {/* Verification Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={cn(
                'p-3 rounded-lg text-center transition-colors',
                professionalData.verificationStatus.isPlatformVerified
                  ? 'bg-success/5 border border-success/20'
                  : 'bg-muted/30 border border-border/50'
              )}
            >
              <Icon
                iconId={
                  professionalData.verificationStatus.isPlatformVerified
                    ? 'faCircleCheckSolid'
                    : 'faCircleXmarkLight'
                }
                className={cn(
                  'w-5 h-5 mx-auto mb-1',
                  professionalData.verificationStatus.isPlatformVerified
                    ? 'text-success'
                    : 'text-muted-foreground'
                )}
              />
              <p className="text-xs font-medium">Platform Verified</p>
            </div>

            <div
              className={cn(
                'p-3 rounded-lg text-center transition-colors',
                professionalData.verificationStatus.isBusinessAccount
                  ? 'bg-primary/5 border border-primary/20'
                  : 'bg-muted/30 border border-border/50'
              )}
            >
              <Icon
                iconId={
                  professionalData.verificationStatus.isBusinessAccount
                    ? 'faBuildingLight'
                    : 'faUserLight'
                }
                className={cn(
                  'w-5 h-5 mx-auto mb-1',
                  professionalData.verificationStatus.isBusinessAccount
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <p className="text-xs font-medium">Business Account</p>
            </div>
          </div>

          {/* Account Age */}
          {professionalData.verificationStatus.accountAge && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 cursor-help">
                    <Icon iconId="faCalendarLight" className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {Math.floor(professionalData.verificationStatus.accountAge / 365)} years old
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({professionalData.verificationStatus.accountAge} days)
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Account created {professionalData.verificationStatus.accountAge} days ago</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Location */}
          {(professionalData.location.city ||
            professionalData.location.state ||
            professionalData.location.country) && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
              <Icon iconId="faMapLight" className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {[
                  professionalData.location.city,
                  professionalData.location.state,
                  professionalData.location.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}

          {/* Category */}
          {professionalData.category && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
              <Icon iconId="faTagLight" className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{professionalData.category}</span>
            </div>
          )}
        </div>

        {/* Background Check Summary */}
        <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20 animate-in slide-in-from-bottom-3 duration-500 delay-1000">
          <div className="flex items-center gap-3 mb-3">
            <Icon iconId="faClipboardLight" className="w-5 h-5 text-success" />
            <span className="font-medium text-primary">Background Check Summary</span>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
              Verified
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Icon
                iconId={professionalData.emails.length > 0 ? 'faCheckLight' : 'faXmarkLight'}
                className={cn(
                  'w-3 h-3',
                  professionalData.emails.length > 0 ? 'text-success' : 'text-destructive'
                )}
              />
              <span>
                Contact information {professionalData.emails.length > 0 ? 'verified' : 'incomplete'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                iconId={
                  professionalData.verificationStatus.isPlatformVerified
                    ? 'faCheckLight'
                    : 'faXmarkLight'
                }
                className={cn(
                  'w-3 h-3',
                  professionalData.verificationStatus.isPlatformVerified
                    ? 'text-success'
                    : 'text-warning'
                )}
              />
              <span>
                Platform verification{' '}
                {professionalData.verificationStatus.isPlatformVerified ? 'confirmed' : 'pending'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                iconId={
                  professionalData.verificationStatus.accountAge &&
                  professionalData.verificationStatus.accountAge > 365
                    ? 'faCheckLight'
                    : 'faTriangleExclamationLight'
                }
                className={cn(
                  'w-3 h-3',
                  professionalData.verificationStatus.accountAge &&
                    professionalData.verificationStatus.accountAge > 365
                    ? 'text-success'
                    : 'text-warning'
                )}
              />
              <span>
                Account maturity{' '}
                {professionalData.verificationStatus.accountAge &&
                professionalData.verificationStatus.accountAge > 365
                  ? 'established'
                  : 'recent'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
