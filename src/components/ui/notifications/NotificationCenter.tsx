'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon/icon';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  className?: string;
  maxHeight?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
  maxHeight = '400px',
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismiss,
    refreshNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Filter out dismissed notifications for the main view
  const visibleNotifications = notifications.filter(n => n.status !== 'DISMISSED');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CAMPAIGN_SUBMITTED':
        return 'appCampaigns'; // Use app icon for campaigns
      case 'BRAND_LIFT_SUBMITTED':
        return 'appBrandLift'; // Use app icon for brand lift
      case 'BRAND_LIFT_REPORT_READY':
        return 'appReports'; // Use app icon for reports
      case 'SUCCESS':
        return 'faCircleCheckSolid'; // Correct solid icon name
      case 'ERROR':
        return 'faTriangleExclamationSolid'; // Correct solid icon name
      case 'WARNING':
        return 'faTriangleExclamationLight'; // Use light version for warnings
      case 'INFO':
      default:
        return 'faCircleInfoSolid'; // Correct solid icon name
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50';
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
      case 'CAMPAIGN_SUBMITTED':
      case 'BRAND_LIFT_SUBMITTED':
      case 'BRAND_LIFT_REPORT_READY':
        return 'text-blue-600 bg-blue-50';
      case 'INFO':
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (notification.status === 'UNREAD') {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className={cn('relative', className)} data-cy="notification-center-trigger">
          <IconButtonAction
            iconBaseName="faBell"
            hoverColorClass="text-accent"
            ariaLabel="Open notifications"
            defaultColorClass="text-foreground" // Black by default
            staysSolid={true} // Always solid, only change color on hover
            className="h-14 w-14 rounded-full" // Match coins size (56px)
          />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              data-cy="notification-badge"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80" data-cy="notification-center-dropdown">
        <div className="flex items-center justify-between p-2">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 w-7 p-0"
              data-cy="notification-refresh"
            >
              <Icon iconId="faRotateLight" className="h-3 w-3" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 px-2 text-xs"
                data-cy="notification-mark-all-read"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="p-2 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Icon iconId="faBellLight" className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-xs mt-1">We'll notify you when something important happens</p>
            </div>
          ) : (
            <div className="p-1">
              {visibleNotifications.map(notification => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex flex-col items-start gap-2 p-3 cursor-pointer',
                    notification.status === 'UNREAD' && 'bg-muted/50'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  data-cy={`notification-item-${notification.id}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0',
                        getNotificationColor(notification.type)
                      )}
                    >
                      <Icon iconId={getNotificationIcon(notification.type)} className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {notification.title}
                        </p>
                        {notification.status === 'UNREAD' && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>

                        {notification.actionUrl && (
                          <Badge variant="secondary" className="text-xs">
                            Click to view
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full justify-end">
                    {notification.status === 'UNREAD' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="h-6 px-2 text-xs"
                        data-cy={`notification-mark-read-${notification.id}`}
                      >
                        Mark read
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        dismiss(notification.id);
                      }}
                      className="h-6 px-2 text-xs text-muted-foreground"
                      data-cy={`notification-dismiss-${notification.id}`}
                    >
                      Dismiss
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {visibleNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
                data-cy="notification-view-all"
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
