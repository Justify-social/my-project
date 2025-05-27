'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

// Types for our notification system
export interface Notification {
  id: string;
  type:
    | 'CAMPAIGN_SUBMITTED'
    | 'BRAND_LIFT_SUBMITTED'
    | 'BRAND_LIFT_REPORT_READY'
    | 'SYSTEM'
    | 'SUCCESS'
    | 'ERROR'
    | 'WARNING'
    | 'INFO';
  status: 'UNREAD' | 'READ' | 'DISMISSED';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  dismissedAt?: string;
  expiresAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAsReadBulk: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (notificationId: string) => Promise<void>;
  dismissBulk: (notificationIds: string[]) => Promise<void>;
  createNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  // Real-time toast helpers
  showToast: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options?: { action?: { label: string; onClick: () => void } }
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  pollInterval?: number; // How often to check for new notifications (ms)
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pollInterval = 30000, // Default: 30 seconds
}) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate unread count
  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
        });

        if (response.ok) {
          setNotifications(prev =>
            prev.map(n =>
              n.id === notificationId
                ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
                : n
            )
          );
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [user?.id]
  );

  // Mark multiple notifications as read
  const markAsReadBulk = useCallback(
    async (notificationIds: string[]) => {
      if (!user?.id || notificationIds.length === 0) return;

      try {
        const response = await fetch('/api/notifications/bulk-read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationIds }),
        });

        if (response.ok) {
          const now = new Date().toISOString();
          setNotifications(prev =>
            prev.map(n =>
              notificationIds.includes(n.id) ? { ...n, status: 'READ' as const, readAt: now } : n
            )
          );
        }
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    },
    [user?.id]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });

      if (response.ok) {
        const now = new Date().toISOString();
        setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' as const, readAt: now })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [user?.id]);

  // Dismiss notification
  const dismiss = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/notifications/${notificationId}/dismiss`, {
          method: 'PATCH',
        });

        if (response.ok) {
          setNotifications(prev =>
            prev.map(n =>
              n.id === notificationId
                ? { ...n, status: 'DISMISSED' as const, dismissedAt: new Date().toISOString() }
                : n
            )
          );
        }
      } catch (error) {
        console.error('Failed to dismiss notification:', error);
      }
    },
    [user?.id]
  );

  // Dismiss multiple notifications
  const dismissBulk = useCallback(
    async (notificationIds: string[]) => {
      if (!user?.id || notificationIds.length === 0) return;

      try {
        const response = await fetch('/api/notifications/bulk-dismiss', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationIds }),
        });

        if (response.ok) {
          const now = new Date().toISOString();
          setNotifications(prev =>
            prev.map(n =>
              notificationIds.includes(n.id)
                ? { ...n, status: 'DISMISSED' as const, dismissedAt: now }
                : n
            )
          );
        }
      } catch (error) {
        console.error('Failed to dismiss notifications:', error);
      }
    },
    [user?.id]
  );

  // Create new notification
  const createNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification),
        });

        if (response.ok) {
          const newNotification = await response.json();
          setNotifications(prev => [newNotification, ...prev]);

          // Show toast immediately for better UX
          showToast(
            notification.type === 'SUCCESS'
              ? 'success'
              : notification.type === 'ERROR'
                ? 'error'
                : notification.type === 'WARNING'
                  ? 'warning'
                  : 'info',
            notification.message,
            notification.actionUrl
              ? {
                  action: {
                    label: 'View',
                    onClick: () => (window.location.href = notification.actionUrl!),
                  },
                }
              : undefined
          );
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    },
    [user?.id]
  );

  // Show toast message
  const showToast = useCallback(
    (
      type: 'success' | 'error' | 'warning' | 'info',
      message: string,
      options?: { action?: { label: string; onClick: () => void } }
    ) => {
      const toastOptions = {
        ...options,
        duration: type === 'error' ? 6000 : 4000, // Error messages stay longer
      };

      switch (type) {
        case 'success':
          toast.success(message, toastOptions);
          break;
        case 'error':
          toast.error(message, toastOptions);
          break;
        case 'warning':
          toast.warning(message, toastOptions);
          break;
        case 'info':
        default:
          toast.info(message, toastOptions);
          break;
      }
    },
    []
  );

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Auto-fetch notifications on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // Polling for new notifications
  useEffect(() => {
    if (!user?.id || pollInterval <= 0) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [user?.id, pollInterval, fetchNotifications]);

  // Auto-show toast for new notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (
        notification.status === 'UNREAD' &&
        Date.now() - new Date(notification.createdAt).getTime() < 5000 // Only show for notifications created in last 5 seconds
      ) {
        const toastType =
          notification.type === 'SUCCESS'
            ? 'success'
            : notification.type === 'ERROR'
              ? 'error'
              : notification.type === 'WARNING'
                ? 'warning'
                : 'info';

        showToast(
          toastType,
          notification.message,
          notification.actionUrl
            ? {
                action: {
                  label: 'View',
                  onClick: () => (window.location.href = notification.actionUrl!),
                },
              }
            : undefined
        );
      }
    });
  }, [notifications, showToast]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsReadBulk,
    markAllAsRead,
    dismiss,
    dismissBulk,
    createNotification,
    refreshNotifications,
    showToast,
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
};
