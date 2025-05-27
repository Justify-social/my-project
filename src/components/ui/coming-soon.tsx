'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';

interface ComingSoonProps {
  title: string;
  description: string;
  iconId?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryActions?: {
    label: string;
    href: string;
    iconId?: string;
  }[];
}

export function ComingSoon({
  title,
  description,
  iconId = 'faRocketLight',
  primaryAction,
  secondaryActions = [],
}: ComingSoonProps) {
  const router = useRouter();

  const defaultSecondaryActions = [
    { label: 'View Campaigns', href: '/campaigns', iconId: 'faClipboardLight' },
    { label: 'Go to Dashboard', href: '/dashboard', iconId: 'faHouseLight' },
  ];

  const actions = secondaryActions.length > 0 ? secondaryActions : defaultSecondaryActions;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6 bg-background">
      <Icon iconId={iconId} className="w-16 h-16 md:w-20 md:h-20 text-accent mb-8 drop-shadow-lg" />

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-primary">
        {title}
      </h1>

      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 px-2 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
        {primaryAction && (
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto shadow-lg bg-accent hover:bg-accent/90 text-primary-foreground py-3 text-base"
            onClick={() => router.push(primaryAction.href)}
          >
            <Icon iconId="faBellLight" className="mr-2" />
            {primaryAction.label}
          </Button>
        )}

        {actions.map((action, index) => (
          <Button
            key={index}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto py-3 text-base border border-border"
            onClick={() => router.push(action.href)}
          >
            <Icon
              iconId={action.iconId || (index === 0 ? 'faClipboardLight' : 'faHouseLight')}
              className="mr-2"
            />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="mt-8 max-w-md mx-auto">
        <div className="bg-background/60 backdrop-blur-sm border border-divider rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon iconId="faClockLight" className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Expected Launch</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We're working hard to bring you this feature. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
}
