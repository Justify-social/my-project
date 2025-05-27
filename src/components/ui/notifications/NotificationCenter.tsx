'use client';

import React, { useState } from 'react';
import { useNotifications, type Notification } from '@/providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NAVIGATION_CONSTANTS } from '../navigation/navigation-constants';
// Importing components in case they're needed later
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  maxHeight: _maxHeight = '400px',
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
        return 'appCampaigns';
      case 'BRAND_LIFT_SUBMITTED':
        return 'appBrandLift';
      case 'BRAND_LIFT_REPORT_READY':
        return 'appReports';
      case 'SUCCESS':
        return 'faCircleCheckSolid';
      case 'ERROR':
        return 'faTriangleExclamationSolid';
      case 'WARNING':
        return 'faTriangleExclamationLight';
      case 'INFO':
      default:
        return 'faCircleInfoSolid';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ERROR':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'WARNING':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'CAMPAIGN_SUBMITTED':
      case 'BRAND_LIFT_SUBMITTED':
      case 'BRAND_LIFT_REPORT_READY':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'INFO':
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getNotificationBadgeStyle = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return {
          variant: 'default' as const,
          className: 'bg-emerald-600 text-white hover:bg-emerald-700 border-0',
        };
      case 'ERROR':
        return {
          variant: 'default' as const,
          className: 'bg-rose-600 text-white hover:bg-rose-700 border-0',
        };
      case 'WARNING':
        return {
          variant: 'default' as const,
          className: 'bg-amber-600 text-white hover:bg-amber-700 border-0',
        };
      case 'CAMPAIGN_SUBMITTED':
      case 'BRAND_LIFT_SUBMITTED':
      case 'BRAND_LIFT_REPORT_READY':
        return {
          variant: 'default' as const,
          className: 'bg-sky-600 text-white hover:bg-sky-700 border-0',
        };
      case 'INFO':
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-0',
        };
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
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
            hoverColorClass={NAVIGATION_CONSTANTS.hoverColor}
            ariaLabel="Open notifications"
            defaultColorClass={NAVIGATION_CONSTANTS.defaultColor}
            staysSolid={true}
            className={`${NAVIGATION_CONSTANTS.bellSize} ${NAVIGATION_CONSTANTS.forceBellSize} rounded-full transition-all duration-300 hover:scale-110 active:scale-95`}
          />
          {unreadCount > 0 && (
            <div
              className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center ring-2 ring-white shadow-md transition-all duration-200"
              data-cy="notification-badge"
              style={{
                animation: 'notification-breathe 3s ease-in-out infinite',
              }}
            >
              <span className="text-white text-xs font-bold leading-none tracking-tight">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[420px] max-w-[95vw] shadow-2xl border-0 bg-white/98 backdrop-blur-md p-0 overflow-hidden"
        data-cy="notification-center-dropdown"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Icon iconId="faBellSolid" className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h4 className="font-semibold text-base text-slate-900">Notifications</h4>
              {unreadCount > 0 && <p className="text-xs text-slate-500">{unreadCount} unread</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-110"
              data-cy="notification-refresh"
            >
              <Icon iconId="faRotateLight" className="h-4 w-4 text-slate-600" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-8 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105"
                data-cy="notification-mark-all-read"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Content */}
        <ScrollArea className="max-h-[28rem]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="h-11 w-11 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-4 bg-slate-200 rounded w-16" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-slate-200 rounded w-20" />
                      <div className="h-6 bg-slate-200 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Icon iconId="faBellLight" className="h-7 w-7 text-slate-400" />
              </div>
              <h5 className="font-semibold text-slate-900 mb-2 text-base">All caught up!</h5>
              <p className="text-sm text-slate-500 leading-relaxed max-w-48 mx-auto">
                We'll notify you when something important happens with your campaigns
              </p>
            </div>
          ) : (
            <div className="py-2">
              {visibleNotifications.map((notification, index) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-4 p-4 mx-3 my-1 cursor-pointer rounded-xl transition-all duration-300 hover:bg-slate-50 focus:bg-slate-50 hover:shadow-sm hover:scale-[1.02] group border border-transparent',
                    notification.status === 'UNREAD' &&
                      'bg-gradient-to-r from-sky-50/80 to-blue-50/50 hover:from-sky-50 hover:to-blue-50 focus:from-sky-50 focus:to-blue-50 border-sky-100',
                    index === 0 && 'mt-3',
                    index === visibleNotifications.length - 1 && 'mb-3'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  data-cy={`notification-item-${notification.id}`}
                >
                  {/* Enhanced Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center h-11 w-11 rounded-xl border-2 flex-shrink-0 shadow-sm transition-all duration-200 group-hover:scale-110',
                      getNotificationColor(notification.type)
                    )}
                  >
                    <Icon iconId={getNotificationIcon(notification.type)} className="h-5 w-5" />
                  </div>

                  {/* Enhanced Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h6 className="font-semibold text-slate-900 text-sm leading-tight overflow-hidden">
                        <span className="block">{notification.title}</span>
                      </h6>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notification.status === 'UNREAD' && (
                          <div className="h-2.5 w-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full shadow-sm" />
                        )}
                        <Badge
                          variant={getNotificationBadgeStyle(notification.type).variant}
                          className={`text-xs px-2.5 py-1 h-auto font-medium shadow-sm ${getNotificationBadgeStyle(notification.type).className}`}
                        >
                          {notification.type === 'CAMPAIGN_SUBMITTED'
                            ? 'Campaign'
                            : notification.type === 'BRAND_LIFT_SUBMITTED'
                              ? 'Brand Lift'
                              : notification.type === 'BRAND_LIFT_REPORT_READY'
                                ? 'Report'
                                : notification.type === 'SUCCESS'
                                  ? 'Success'
                                  : notification.type === 'ERROR'
                                    ? 'Error'
                                    : notification.type === 'WARNING'
                                      ? 'Warning'
                                      : 'Info'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3 leading-relaxed overflow-hidden">
                      <span className="block line-clamp-2">{notification.message}</span>
                    </p>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-500 font-medium flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notification.actionUrl && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1 h-auto bg-white border-slate-300 shadow-sm font-medium"
                          >
                            <Icon iconId="faArrowUpLight" className="h-3 w-3 mr-1" />
                            View
                          </Badge>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {notification.status === 'UNREAD' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-7 px-2 text-xs text-slate-600 hover:bg-white hover:text-slate-800 rounded-md transition-all duration-200 hover:scale-105 shadow-sm border border-transparent hover:border-slate-200"
                              data-cy={`notification-mark-read-${notification.id}`}
                            >
                              <Icon iconId="faCheckLight" className="h-3 w-3 mr-1" />
                              Read
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              dismiss(notification.id);
                            }}
                            className="h-7 px-2 text-xs text-slate-500 hover:bg-white hover:text-slate-700 rounded-md transition-all duration-200 hover:scale-105 shadow-sm border border-transparent hover:border-slate-200"
                            data-cy={`notification-dismiss-${notification.id}`}
                          >
                            <Icon iconId="faXmarkLight" className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
