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
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor-profile-analytics';
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
  const [isOpen, setIsOpen] = useState(false);

  // Extract comprehensive contact data using SSOT
  const extractedData = extractInsightIQData(influencer);
  const professionalData = extractedData.professional;

  // Get all available contact methods
  const emails = professionalData.emails.filter(email => email.email);
  const phoneNumbers = professionalData.phoneNumbers.filter(phone => phone.number);
  const socialProfiles = professionalData.socialProfiles.filter(profile => profile.url);
  const websites = professionalData.website ? [professionalData.website] : [];

  // Get the primary/best contact info
  const primaryEmail = emails.find(e => e.isPrimary) || emails[0];
  const primaryPhone = phoneNumbers.find(p => p.verified) || phoneNumbers[0];
  const businessEmail = emails.find(e => e.type === 'BUSINESS') || primaryEmail;

  // Calculate total contact methods available
  const totalContactMethods =
    emails.length + phoneNumbers.length + socialProfiles.length + websites.length;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${type} copied to clipboard!`);
    } catch {
      showErrorToast(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const getContactIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'email':
      case 'business':
      case 'personal':
        return 'faEnvelopeLight';
      case 'phone':
      case 'mobile':
      case 'business_phone':
        return 'faPhoneLight';
      case 'website':
      case 'url':
        return 'faGlobeLight';
      case 'instagram':
        return 'brandsInstagram';
      case 'twitter':
      case 'x':
        return 'brandsXTwitter';
      case 'youtube':
        return 'brandsYoutube';
      case 'linkedin':
        return 'brandsLinkedin';
      case 'tiktok':
        return 'brandsTiktok';
      case 'facebook':
        return 'brandsFacebook';
      default:
        return 'faUserLight';
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Basic phone formatting for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Icon iconId="faPhoneLight" className="mr-2 h-4 w-4" />
          {buttonText}
          {totalContactMethods > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {totalContactMethods}
            </Badge>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <Icon iconId="faUserLight" className="h-5 w-5 text-primary" />
            Contact Information
            <Badge variant="outline" className="ml-auto">
              {influencer.name || influencer.handle}
            </Badge>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Direct contact information for this influencer profile.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Summary */}
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <Icon iconId="faCircleCheckLight" className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-primary">Contact Summary</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Icon iconId="faEnvelopeLight" className="h-3 w-3 text-muted-foreground" />
                <span>
                  {emails.length} email{emails.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon iconId="faPhoneLight" className="h-3 w-3 text-muted-foreground" />
                <span>
                  {phoneNumbers.length} phone{phoneNumbers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon iconId="faGlobeLight" className="h-3 w-3 text-muted-foreground" />
                <span>
                  {websites.length} website{websites.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon iconId="faUsersLight" className="h-3 w-3 text-muted-foreground" />
                <span>{socialProfiles.length} social</span>
              </div>
            </div>
          </div>

          {/* Quick Actions for Primary Contacts */}
          {(primaryEmail || primaryPhone) && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Icon iconId="faRocketLight" className="h-4 w-4 text-primary" />
                Quick Contact
              </h4>
              <div className="grid gap-3">
                {primaryEmail && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-3">
                      <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-success" />
                      <div>
                        <p className="font-medium text-sm">{primaryEmail.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {primaryEmail.type} {primaryEmail.isPrimary && '• Primary'}{' '}
                          {primaryEmail.verified && '• Verified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => copyToClipboard(primaryEmail.email, 'Email')}
                        ariaLabel="Copy email"
                        className="hover:bg-success/10"
                      />
                      <IconButtonAction
                        iconBaseName="faEnvelope"
                        hoverColorClass="text-accent"
                        onClick={() => window.open(`mailto:${primaryEmail.email}`)}
                        ariaLabel="Send email"
                        className="hover:bg-success/10"
                      />
                    </div>
                  </div>
                )}

                {primaryPhone && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-3">
                      <Icon iconId="faPhoneLight" className="h-4 w-4 text-accent" />
                      <div>
                        <p className="font-medium text-sm">
                          {formatPhoneNumber(primaryPhone.number)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {primaryPhone.type} {primaryPhone.country && `• ${primaryPhone.country}`}{' '}
                          {primaryPhone.verified && '• Verified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => copyToClipboard(primaryPhone.number, 'Phone')}
                        ariaLabel="Copy phone"
                        className="hover:bg-accent/10"
                      />
                      <IconButtonAction
                        iconBaseName="faPhone"
                        hoverColorClass="text-accent"
                        onClick={() => window.open(`tel:${primaryPhone.number}`)}
                        ariaLabel="Call phone"
                        className="hover:bg-accent/10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Email Addresses */}
          {emails.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-primary" />
                Email Addresses ({emails.length})
              </h4>
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{email.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{email.type}</span>
                          {email.isPrimary && (
                            <Badge variant="outline" className="text-xs">
                              Primary
                            </Badge>
                          )}
                          {email.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => copyToClipboard(email.email, 'Email')}
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

          {/* All Phone Numbers */}
          {phoneNumbers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Icon iconId="faPhoneLight" className="h-4 w-4 text-primary" />
                Phone Numbers ({phoneNumbers.length})
              </h4>
              <div className="space-y-2">
                {phoneNumbers.map((phone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon iconId="faPhoneLight" className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{formatPhoneNumber(phone.number)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{phone.type}</span>
                          {phone.country && <span>• {phone.country}</span>}
                          {phone.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => copyToClipboard(phone.number, 'Phone')}
                        ariaLabel="Copy phone"
                        className="hover:bg-accent/10"
                      />
                      <IconButtonAction
                        iconBaseName="faPhone"
                        hoverColorClass="text-accent"
                        onClick={() => window.open(`tel:${phone.number}`)}
                        ariaLabel="Call phone"
                        className="hover:bg-accent/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Websites */}
          {websites.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Icon iconId="faGlobeLight" className="h-4 w-4 text-primary" />
                Websites ({websites.length})
              </h4>
              <div className="space-y-2">
                {websites.map((website, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon iconId="faGlobeLight" className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{website}</p>
                        <p className="text-xs text-muted-foreground">Personal website</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => copyToClipboard(website, 'Website')}
                        ariaLabel="Copy website"
                        className="hover:bg-accent/10"
                      />
                      <IconButtonAction
                        iconBaseName="faGlobe"
                        hoverColorClass="text-accent"
                        onClick={() =>
                          window.open(
                            website.startsWith('http') ? website : `https://${website}`,
                            '_blank'
                          )
                        }
                        ariaLabel="Visit website"
                        className="hover:bg-accent/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Profiles */}
          {socialProfiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Icon iconId="faUsersLight" className="h-4 w-4 text-primary" />
                Social Profiles ({socialProfiles.length})
              </h4>
              <div className="space-y-2">
                {socialProfiles.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        iconId={getContactIcon(profile.platform)}
                        className="h-4 w-4 text-muted-foreground"
                      />
                      <div>
                        <p className="font-medium text-sm">{profile.username}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{profile.platform}</span>
                          {profile.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={() => copyToClipboard(profile.url, 'Profile URL')}
                        ariaLabel="Copy profile URL"
                        className="hover:bg-accent/10"
                      />
                      <IconButtonAction
                        iconBaseName="faGlobe"
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

          {/* No Contact Information Available */}
          {totalContactMethods === 0 && (
            <div className="text-center py-8">
              <Icon
                iconId="faCircleInfoLight"
                className="h-12 w-12 text-muted-foreground mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Limited Contact Information
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Contact information is not available in the current data set. This may indicate a
                private account or limited data sharing.
              </p>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                You can still reach out through their social media platforms or public channels.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          {(businessEmail || primaryEmail) && (
            <Button
              onClick={() => {
                const email = businessEmail || primaryEmail;
                if (email) {
                  window.open(`mailto:${email.email}`, '_blank');
                  setIsOpen(false);
                }
              }}
            >
              <Icon iconId="faEnvelopeLight" className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ContactsPopup;
