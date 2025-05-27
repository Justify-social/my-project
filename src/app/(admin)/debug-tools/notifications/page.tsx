'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

interface User {
  id: string;
  email: string;
  name?: string;
}

interface NotificationForm {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string;
  expiresAt: string;
}

export default function NotificationsDebugPage() {
  const { notifications, refreshNotifications, showToast } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [form, setForm] = useState<NotificationForm>({
    userId: '',
    type: 'INFO',
    title: '',
    message: '',
    actionUrl: '',
    expiresAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('error', 'Failed to fetch users');
    }
  }, [showToast]);

  // Fetch users for the dropdown
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (field: keyof NotificationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  const createNotification = async (userIds: string[]) => {
    setIsLoading(true);
    try {
      const promises = userIds.map(userId =>
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            userId,
            expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
          }),
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        showToast('success', `${successCount} notification(s) created successfully`);
        refreshNotifications();

        // Reset form
        setForm({
          userId: '',
          type: 'INFO',
          title: '',
          message: '',
          actionUrl: '',
          expiresAt: '',
        });
        setSelectedUsers([]);
      }

      if (failureCount > 0) {
        showToast('error', `${failureCount} notification(s) failed to create`);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      showToast('error', 'Failed to create notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.message) {
      showToast('error', 'Title and message are required');
      return;
    }

    const targetUsers = selectedUsers.length > 0 ? selectedUsers : [form.userId];

    if (targetUsers.length === 0 || (targetUsers.length === 1 && !targetUsers[0])) {
      showToast('error', 'Please select at least one user');
      return;
    }

    await createNotification(targetUsers);
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

  const filteredUsers = users.filter(
    user =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchEmail.toLowerCase()))
  );

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
                    <Label htmlFor="expiresAt">Expires At (optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={e => handleInputChange('expiresAt', e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Creating...' : 'Create Notification'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="searchEmail">Search Users</Label>
                  <Input
                    id="searchEmail"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    placeholder="Search by email or name"
                    className="w-full"
                  />
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={cn(
                          'flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-muted',
                          selectedUsers.includes(user.id) && 'bg-muted'
                        )}
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.email}</p>
                          {user.name && (
                            <p className="text-xs text-muted-foreground truncate">{user.name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="text-sm text-muted-foreground">
                  {selectedUsers.length} user(s) selected
                </div>
              </CardContent>
            </Card>
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
