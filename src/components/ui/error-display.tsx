'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/icon';

export interface ErrorDisplayProps {
  message: string;
  errorType?:
    | 'INVALID_PLATFORM'
    | 'NOT_FOUND'
    | 'NETWORK_ERROR'
    | 'GLOBAL'
    | 'PAGE_NOT_FOUND'
    | 'GENERIC';
  platformString?: string;
  handle?: string;
  isFullPage?: boolean;
  onReset?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  errorType = 'GENERIC',
  platformString,
  handle,
  isFullPage = false,
  onReset,
}) => {
  const router = useRouter();

  const getErrorDetails = () => {
    switch (errorType) {
      case 'INVALID_PLATFORM':
        return {
          title: 'Invalid Platform Specified',
          icon: 'faTriangleExclamationLight' as const,
          description: `The platform "${platformString}" is not supported. Please use a valid platform.`,
          suggestions: [
            'Try using "INSTAGRAM" instead of "INST"',
            'Supported platforms: Instagram, TikTok, YouTube, Twitter, Facebook',
            'Check the URL and make sure the platform parameter is correct',
          ],
          actions: [
            {
              label: 'Go to Marketplace',
              action: () => router.push('/influencer-marketplace'),
              variant: 'default' as const,
              icon: 'faArrowLeftLight' as const,
            },
            {
              label: 'Try Instagram',
              action: () => router.push(`/influencer-marketplace/${handle}?platform=INSTAGRAM`),
              variant: 'outline' as const,
              icon: 'brandsInstagram' as const,
            },
          ],
        };

      case 'NOT_FOUND':
        return {
          title: 'Profile Not Found',
          icon: 'faUserSlashLight' as const,
          description:
            "The influencer profile you're looking for doesn't exist or has been removed.",
          suggestions: [
            'Check the username spelling',
            'Make sure the platform is correct',
            'The profile might have been deleted or made private',
          ],
          actions: [
            {
              label: 'Back to Marketplace',
              action: () => router.push('/influencer-marketplace'),
              variant: 'default' as const,
              icon: 'faArrowLeftLight' as const,
            },
            {
              label: 'Search Influencers',
              action: () => router.push('/influencer-marketplace'),
              variant: 'outline' as const,
              icon: 'faSearchLight' as const,
            },
          ],
        };

      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          icon: 'faWifiSlashLight' as const,
          description: 'Unable to load the profile due to a network error.',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'The server might be temporarily unavailable',
          ],
          actions: [
            {
              label: 'Try Again',
              action: () => window.location.reload(),
              variant: 'default' as const,
              icon: 'faRotateLight' as const,
            },
            {
              label: 'Go Back',
              action: () => router.back(),
              variant: 'outline' as const,
              icon: 'faArrowLeftLight' as const,
            },
          ],
        };

      case 'GLOBAL':
        return {
          title: 'Something went wrong!',
          icon: 'faTriangleExclamationLight' as const,
          description:
            "We encountered a critical error. Our team has been notified and we're working on a fix.",
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support if the issue persists',
          ],
          actions: [
            {
              label: 'Try Again',
              action: onReset || (() => window.location.reload()),
              variant: 'default' as const,
              icon: 'faRotateLight' as const,
            },
            {
              label: 'Go to Dashboard',
              action: () => router.push('/dashboard'),
              variant: 'secondary' as const,
              icon: 'faHouseLight' as const,
            },
          ],
        };

      case 'PAGE_NOT_FOUND':
        return {
          title: '404 - Page Not Found',
          icon: 'faMapLight' as const,
          description:
            "Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.",
          suggestions: [
            'Check the URL spelling',
            'Try going back to the previous page',
            'Contact support if you believe this is an error',
          ],
          actions: [
            {
              label: 'Go to Dashboard',
              action: () => router.push('/dashboard'),
              variant: 'default' as const,
              icon: 'faHouseLight' as const,
            },
            {
              label: 'Go Back',
              action: () => router.back(),
              variant: 'secondary' as const,
              icon: 'faArrowLeftLight' as const,
            },
          ],
        };

      default:
        return {
          title: 'Error Loading Content',
          icon: 'faTriangleExclamationLight' as const,
          description: message || 'An unexpected error occurred while loading the content.',
          suggestions: [
            'Try refreshing the page',
            'Check the URL parameters',
            'Contact support if the issue persists',
          ],
          actions: [
            {
              label: 'Try Again',
              action: () => window.location.reload(),
              variant: 'default' as const,
              icon: 'faRotateLight' as const,
            },
            {
              label: 'Go to Dashboard',
              action: () => router.push('/dashboard'),
              variant: 'outline' as const,
              icon: 'faArrowLeftLight' as const,
            },
          ],
        };
    }
  };

  const errorDetails = getErrorDetails();

  if (isFullPage) {
    // All full-page errors should use the clean 404-style layout as SSOT
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6 bg-background">
        {/* Error Icon */}
        <Icon
          iconId={errorDetails.icon}
          className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mb-8 drop-shadow-lg"
        />

        {/* Error Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-primary">
          {errorDetails.title}
        </h1>

        {/* Error Description */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 px-2 leading-relaxed">
          {errorDetails.description}
        </p>

        {/* Error Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {errorDetails.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="lg"
              className={`w-full sm:w-auto py-3 text-base ${
                action.variant === 'default'
                  ? 'shadow-lg bg-accent hover:bg-accent/90 text-primary-foreground'
                  : 'border border-border'
              }`}
              onClick={action.action}
            >
              <Icon iconId={action.icon} className="mr-2" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-background/60 backdrop-blur-sm border border-divider rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon iconId="faCircleInfoLight" className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Need Help?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {errorType === 'PAGE_NOT_FOUND'
                ? 'If you believe this is an error, please check the URL or contact support for assistance.'
                : 'If this problem persists, please contact our support team with the error details.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Card-based layout for inline errors
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="border-destructive/20 bg-destructive/5 max-w-2xl w-full">
        <CardContent className="p-8 text-center">
          {/* Error Icon */}
          <Icon iconId={errorDetails.icon} className="h-16 w-16 text-destructive mx-auto mb-6" />

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-destructive mb-3">{errorDetails.title}</h1>

          {/* Error Description */}
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            {errorDetails.description}
          </p>

          {/* Error Details */}
          <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon iconId="faCircleInfoLight" className="h-4 w-4 text-accent" />
              Troubleshooting Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Icon
                    iconId="faCheckLight"
                    className="h-3 w-3 text-success mt-0.5 flex-shrink-0"
                  />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {errorDetails.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="lg"
                onClick={action.action}
                className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon iconId={action.icon} className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon iconId="faCircleInfoLight" className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Need Help?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact our support team with the error details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
