'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@/components/ui/icon/icon';
import { useNotifications } from '@/providers/NotificationProvider';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { RecipientSelector } from '@/components/ui/recipient-selector';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { toast } from 'react-hot-toast';

interface SelectedRecipient {
  id: string;
  type: 'user' | 'organisation';
  name: string;
  email?: string;
  userCount?: number;
}

interface NotificationForm {
  type: string;
  title: string;
  message: string;
  actionUrl: string;
  expiresAt: string;
}

export default function NotificationsDebugPage() {
  const { notifications, refreshNotifications } = useNotifications();
  const [selectedRecipients, setSelectedRecipients] = useState<SelectedRecipient[]>([]);
  const [form, setForm] = useState<NotificationForm>({
    type: 'INFO',
    title: '',
    message: '',
    actionUrl: '',
    expiresAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof NotificationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const createBulkNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedRecipients.map(r => ({ id: r.id, type: r.type })),
          ...form,
          expiresAt: form.expiresAt || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Notifications created successfully');
        refreshNotifications();

        // Reset form
        setForm({
          type: 'INFO',
          title: '',
          message: '',
          actionUrl: '',
          expiresAt: '',
        });
        setSelectedRecipients([]);
      } else {
        toast.error(result.error || 'Failed to create notifications');
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
      toast.error('Failed to create notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.message) {
      toast.error('Title and message are required');
      return;
    }

    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    await createBulkNotifications();
  };

  const quickNotifications = [
    {
      label: 'Campaign Submitted',
      form: {
        type: 'CAMPAIGN_SUBMITTED',
        title: 'Campaign Submitted Successfully',
        message: 'Your campaign has been submitted and is being reviewed by our team.',
        actionUrl: '/campaigns',
      },
    },
    {
      label: 'Brand Lift Report Ready',
      form: {
        type: 'BRAND_LIFT_REPORT_READY',
        title: 'Brand Lift Report Ready',
        message: 'Your Brand Lift report is now available for download.',
        actionUrl: '/brand-lift/reports',
      },
    },
    {
      label: 'System Maintenance',
      form: {
        type: 'WARNING',
        title: 'Scheduled Maintenance',
        message: 'System maintenance is scheduled for tonight from 2-4 AM EST.',
        actionUrl: '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      },
    },
  ];

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
        return 'text-green-600';
      case 'ERROR':
        return 'text-red-600';
      case 'WARNING':
        return 'text-yellow-600';
      case 'CAMPAIGN_SUBMITTED':
      case 'BRAND_LIFT_SUBMITTED':
      case 'BRAND_LIFT_REPORT_READY':
        return 'text-blue-600';
      case 'INFO':
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <Button
          onClick={refreshNotifications}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Icon iconId="faRotateLight" className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Notifications</TabsTrigger>
          <TabsTrigger value="view">View All Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Notification Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Notification</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={value => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAMPAIGN_SUBMITTED">Campaign Submitted</SelectItem>
                        <SelectItem value="BRAND_LIFT_SUBMITTED">Brand Lift Submitted</SelectItem>
                        <SelectItem value="BRAND_LIFT_REPORT_READY">
                          Brand Lift Report Ready
                        </SelectItem>
                        <SelectItem value="SUCCESS">Success</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="WARNING">Warning</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="SYSTEM">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="Notification title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={e => handleInputChange('message', e.target.value)}
                      placeholder="Notification message"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actionUrl">Action URL (optional)</Label>
                    <Input
                      id="actionUrl"
                      value={form.actionUrl}
                      onChange={e => handleInputChange('actionUrl', e.target.value)}
                      placeholder="/campaigns or https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <DateTimePicker
                      id="expiresAt"
                      label="Expires At (optional)"
                      value={form.expiresAt}
                      onChange={value => handleInputChange('expiresAt', value)}
                      description="Set when this notification should automatically expire"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Creating...' : 'Create Notification'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recipient Selection */}
            <RecipientSelector
              selectedRecipients={selectedRecipients}
              onSelectionChange={setSelectedRecipients}
            />
          </div>

          {/* Quick Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickNotifications.map((quick, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setForm(prev => ({ ...prev, ...quick.form }))}
                    className="h-auto p-4 flex flex-col items-start text-left"
                  >
                    <span className="font-medium">{quick.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {quick.form.message.slice(0, 60)}...
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 border rounded-md"
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center h-8 w-8 rounded-full bg-muted flex-shrink-0',
                          getNotificationColor(notification.type)
                        )}
                      >
                        <Icon iconId={getNotificationIcon(notification.type)} className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <Badge
                            variant={notification.status === 'UNREAD' ? 'default' : 'secondary'}
                          >
                            {notification.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>

                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{notification.type}</Badge>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{notifications.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unread Count</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {notifications.filter(n => n.status === 'UNREAD').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dismissed Count</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-600">
                  {notifications.filter(n => n.status === 'DISMISSED').length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
