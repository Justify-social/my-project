'use client';

import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Icon } from '@/components/ui/icon/icon';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  extractInsightIQData,
  InsightIQExtractedData,
} from '@/lib/data-extraction/insightiq-extractor';
import { InfluencerProfileData } from '@/types/influencer';

export interface ContactsPopupProps {
  influencer: InfluencerProfileData;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  buttonText?: string;
}

export const ContactsPopup: React.FC<ContactsPopupProps> = ({
  influencer,
  variant = 'outline',
  size = 'sm',
  className,
  buttonText = 'Contact',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Extract comprehensive contact data using SSOT utility
  const extractedData = extractInsightIQData(influencer);
  const professionalData = extractedData.professional;

  const handleCopyToClipboard = async (text: string, type: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
      } catch (err) {
        toast.error(`Failed to copy ${type.toLowerCase()}.`);
      }
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic phone number formatting
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => setIsDialogOpen(true)}
        >
          <Icon iconId="faPhoneLight" className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <Icon iconId="faAddressCardLight" className="h-5 w-5 text-accent" />
            Contact Information - {influencer.name || influencer.handle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Direct contact information for{' '}
            {extractedData.professional.emails[0]?.email ? 'verified' : 'this'} influencer profile.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Data Source Information */}
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon iconId="faCloudLight" className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-primary">Verified Contact Data</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Contact information extracted from verified sources and social platforms
            </p>
          </div>

          {/* Email Addresses */}
          {professionalData.emails.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-semibold text-primary">Email Addresses</h4>
                <Badge variant="secondary" className="text-xs">
                  {professionalData.emails.length} found
                </Badge>
              </div>
              <div className="space-y-2">
                {professionalData.emails.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Icon
                        iconId="faEnvelopeLight"
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{email.email}</p>
                          {email.isPrimary && (
                            <Badge variant="outline" className="text-xs">
                              Primary
                            </Badge>
                          )}
                          {email.verified && (
                            <Icon iconId="faCircleCheckSolid" className="w-3 h-3 text-success" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{email.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => handleCopyToClipboard(email.email, 'Email')}
                        ariaLabel="Copy email"
                        className="hover:bg-accent/10"
                      />
                      <IconButtonAction
                        iconBaseName="faEnvelope"
                        hoverColorClass="text-accent"
                        onClick={() => window.open(`mailto:${email.email}`)}
                        ariaLabel="Send email"
                        className="hover:bg-accent/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phone Numbers */}
          {professionalData.phoneNumbers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon iconId="faPhoneLight" className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-semibold text-primary">Phone Numbers</h4>
                <Badge variant="secondary" className="text-xs">
                  {professionalData.phoneNumbers.length} found
                </Badge>
              </div>
              <div className="space-y-2">
                {professionalData.phoneNumbers.map((phone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Icon
                        iconId="faPhoneLight"
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{formatPhoneNumber(phone.number)}</p>
                          {phone.verified && (
                            <Icon iconId="faCircleCheckSolid" className="w-3 h-3 text-success" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {phone.type} {phone.country && `• ${phone.country}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => handleCopyToClipboard(phone.number, 'Phone number')}
                        ariaLabel="Copy phone number"
                        className="hover:bg-accent/10"
                      />
                      <IconButtonAction
                        iconBaseName="faPhone"
                        hoverColorClass="text-accent"
                        onClick={() => window.open(`tel:${phone.number}`)}
                        ariaLabel="Call number"
                        className="hover:bg-accent/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {professionalData.website && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon iconId="faGlobeLight" className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-semibold text-primary">Website</h4>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon
                    iconId="faGlobeLight"
                    className="w-4 h-4 text-muted-foreground flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-interactive hover:underline cursor-pointer truncate">
                      {professionalData.website}
                    </p>
                    <p className="text-xs text-muted-foreground">Official website</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <IconButtonAction
                    iconBaseName="faCopy"
                    hoverColorClass="text-accent"
                    onClick={() => handleCopyToClipboard(professionalData.website!, 'Website URL')}
                    ariaLabel="Copy website URL"
                    className="hover:bg-accent/10"
                  />
                  <IconButtonAction
                    iconBaseName="faArrowRight"
                    hoverColorClass="text-accent"
                    onClick={() => window.open(professionalData.website!, '_blank')}
                    ariaLabel="Visit website"
                    className="hover:bg-accent/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Profiles */}
          {professionalData.socialProfiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon iconId="faUsersLight" className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-semibold text-primary">Social Profiles</h4>
                <Badge variant="secondary" className="text-xs">
                  {professionalData.socialProfiles.length} platforms
                </Badge>
              </div>
              <div className="space-y-2">
                {professionalData.socialProfiles.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Icon
                        iconId="faUserLight"
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{profile.platform}</p>
                          {profile.verified && (
                            <Icon iconId="faCircleCheckSolid" className="w-3 h-3 text-success" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          @{profile.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => handleCopyToClipboard(profile.url, 'Profile URL')}
                        ariaLabel="Copy profile URL"
                        className="hover:bg-accent/10"
                      />
                      <IconButtonAction
                        iconBaseName="faArrowRight"
                        hoverColorClass="text-accent"
                        onClick={() => window.open(profile.url, '_blank')}
                        ariaLabel="Visit profile"
                        className="hover:bg-accent/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addresses */}
          {professionalData.addresses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon iconId="faMapMarkerAltLight" className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-semibold text-primary">Addresses</h4>
                <Badge variant="secondary" className="text-xs">
                  {professionalData.addresses.length} found
                </Badge>
              </div>
              <div className="space-y-2">
                {professionalData.addresses.map((address, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start gap-3">
                      <Icon
                        iconId="faMapMarkerAltLight"
                        className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{address.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {address.address}
                          {address.city && `, ${address.city}`}
                          {address.state && `, ${address.state}`}
                          {address.country && `, ${address.country}`}
                          {address.postalCode && ` ${address.postalCode}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Summary */}
          <Separator />
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-3 mb-3">
              <Icon iconId="faClipboardLight" className="w-5 h-5 text-success" />
              <span className="font-medium text-primary">Contact Summary</span>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                {professionalData.emails.length + professionalData.phoneNumbers.length} contacts
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Icon iconId="faCheckLight" className="w-3 h-3 text-success" />
                <span>
                  {professionalData.emails.length} email address
                  {professionalData.emails.length !== 1 ? 'es' : ''} available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon iconId="faCheckLight" className="w-3 h-3 text-success" />
                <span>
                  {professionalData.phoneNumbers.length} phone number
                  {professionalData.phoneNumbers.length !== 1 ? 's' : ''} available
                </span>
              </div>
              {professionalData.website && (
                <div className="flex items-center gap-2">
                  <Icon iconId="faCheckLight" className="w-3 h-3 text-success" />
                  <span>Official website confirmed</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Icon iconId="faCheckLight" className="w-3 h-3 text-success" />
                <span>Account type: {professionalData.accountType}</span>
              </div>
            </div>
          </div>

          {/* No Contact Information Available */}
          {professionalData.emails.length === 0 &&
            professionalData.phoneNumbers.length === 0 &&
            !professionalData.website &&
            professionalData.socialProfiles.length === 0 && (
              <div className="text-center py-8">
                <Icon
                  iconId="faInfoCircleLight"
                  className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                />
                <h4 className="text-sm font-medium text-primary mb-2">
                  No Contact Information Available
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Contact information is not available in the current data set. This may indicate a
                  private account or limited data sharing.
                </p>
              </div>
            )}
        </div>

        <AlertDialogFooter>
          <Button onClick={() => setIsDialogOpen(false)} variant="outline">
            Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ContactsPopup;
