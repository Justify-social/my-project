'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
// import { cn } from '@/lib/utils'; // Commented out as not currently used
import { formatDistanceToNow } from 'date-fns';
import { RecipientSelector } from '@/components/ui/recipient-selector';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TEMPLATE_METADATA } from '@/components/email-templates/email-templates';

import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Commented out as not currently used

interface SelectedRecipient {
  id: string;
  type: 'user' | 'organisation';
  name: string;
  email?: string;
  userCount?: number;
}

interface EmailForm {
  from: string;
  subject: string;
  templateType: string;
  content: string; // Single rich content field
  scheduledAt: string;
}

interface EmailActivity {
  id: string;
  emailId: string;
  to: string;
  from: string;
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  type: 'welcome' | 'invitation' | 'notification' | 'custom';
  subject: string;
  preview: string;
}

export default function ResendManagementPage() {
  const [selectedRecipients, setSelectedRecipients] = useState<SelectedRecipient[]>([]);
  const [emailForm, setEmailForm] = useState<EmailForm>({
    from: process.env.NEXT_PUBLIC_DEFAULT_FROM_EMAIL || 'hello@justify.social',
    subject: '',
    templateType: 'custom', // Default to custom
    content: '',
    scheduledAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailActivity, setEmailActivity] = useState<EmailActivity[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
  });

  // Fetch email activity and analytics
  const fetchEmailData = async () => {
    try {
      const [activityRes, analyticsRes] = await Promise.all([
        fetch('/api/resend/activity'),
        fetch('/api/resend/analytics'),
      ]);

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setEmailActivity(activityData.activities || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching email data:', error);
    }
  };

  // Fetch email templates
  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch('/api/resend/templates');
      if (response.ok) {
        const data = await response.json();
        setEmailTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  useEffect(() => {
    fetchEmailData();
    fetchEmailTemplates();
  }, []);

  const handleInputChange = (field: keyof EmailForm, value: string) => {
    setEmailForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    const templateMetadata = TEMPLATE_METADATA[template.id as keyof typeof TEMPLATE_METADATA];
    setEmailForm(prev => ({
      ...prev,
      subject:
        template.subject || templateMetadata?.defaultSubject || `Email using ${template.name}`,
      templateType: template.id, // Use template ID as templateType
      content: '', // Clear content when template is selected
    }));
  };

  const sendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/resend/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedRecipients.map(r => ({ id: r.id, type: r.type })),
          ...emailForm,
          // Ensure content is always provided - for templates, use a default message
          content:
            emailForm.templateType === 'custom'
              ? emailForm.content
              : `This email was sent using the ${TEMPLATE_METADATA[emailForm.templateType as keyof typeof TEMPLATE_METADATA]?.name || emailForm.templateType} template.`,
          scheduledAt: emailForm.scheduledAt || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Emails sent successfully');

        // Reset form
        setEmailForm({
          from: process.env.NEXT_PUBLIC_DEFAULT_FROM_EMAIL || 'hello@justify.social',
          subject: '',
          templateType: 'custom',
          content: '',
          scheduledAt: '',
        });
        setSelectedRecipients([]);

        // Refresh data
        fetchEmailData();
      } else {
        toast.error(result.error || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    } finally {
      setIsLoading(false);
    }
  };

  const testTemplate = async (template: EmailTemplate) => {
    try {
      const response = await fetch('/api/resend/test-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          testEmail: 'delivered@resend.dev', // Resend's test email
        }),
      });

      if (response.ok) {
        toast.success(`Test email sent for ${template.name}`);
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing template:', error);
      toast.error('Failed to send test email');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'opened':
        return 'text-blue-600 bg-blue-50';
      case 'clicked':
        return 'text-purple-600 bg-purple-50';
      case 'bounced':
        return 'text-red-600 bg-red-50';
      case 'complained':
        return 'text-orange-600 bg-orange-50';
      case 'sent':
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'faCircleCheckSolid';
      case 'opened':
        return 'faEnvelopeLight';
      case 'clicked':
        return 'faHandPointerSolid';
      case 'bounced':
        return 'faTriangleExclamationSolid';
      case 'complained':
        return 'faExclamationSolid';
      case 'sent':
      default:
        return 'faPaperPlaneSolid';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resend Email Management</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive email management, analytics, templates, and monitoring
          </p>
        </div>
        <Button
          onClick={fetchEmailData}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Icon iconId="faRotateLight" className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="send">Send Email</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="activity">Email Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Icon iconId="faPaperPlaneSolid" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalSent}</div>
                <p className="text-xs text-muted-foreground">
                  Delivery Rate: {analytics.deliveryRate}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <Icon iconId="faCircleCheckSolid" className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.delivered}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalSent > 0
                    ? Math.round((analytics.delivered / analytics.totalSent) * 100)
                    : 0}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Opened</CardTitle>
                <Icon iconId="faEnvelopeSolid" className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.opened}</div>
                <p className="text-xs text-muted-foreground">Open Rate: {analytics.openRate}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicked</CardTitle>
                <Icon iconId="faHandPointerSolid" className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analytics.clicked}</div>
                <p className="text-xs text-muted-foreground">Click Rate: {analytics.clickRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-2">
                  {emailActivity.slice(0, 10).map(activity => (
                    <div
                      key={`${activity.emailId}-${activity.status}-${activity.timestamp}`}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Icon iconId={getStatusIcon(activity.status)} className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{activity.subject}</p>
                          <p className="text-xs text-muted-foreground">{activity.to}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Email Tab */}
        <TabsContent value="send" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Form */}
            <Card>
              <CardHeader>
                <CardTitle>Compose Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From Address</Label>
                  <Input
                    id="from"
                    value={emailForm.from}
                    onChange={e => handleInputChange('from', e.target.value)}
                    placeholder="hello@justify.social"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={e => handleInputChange('subject', e.target.value)}
                    placeholder="Email subject"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select
                    value={emailForm.templateType}
                    onValueChange={value => handleInputChange('templateType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Content</SelectItem>
                      {Object.entries(TEMPLATE_METADATA).map(([id, metadata]) => (
                        <SelectItem key={id} value={id}>
                          {metadata.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  {emailForm.templateType === 'custom' ? (
                    <RichTextEditor
                      id="content"
                      value={emailForm.content}
                      onChange={value => handleInputChange('content', value)}
                      placeholder="Enter your custom email content here..."
                      description="Use the formatting toolbar to style your email."
                      height="180px"
                    />
                  ) : (
                    <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon iconId="faFileLinesSolid" className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Template Mode Active</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Using{' '}
                        <strong>
                          {
                            TEMPLATE_METADATA[
                              emailForm.templateType as keyof typeof TEMPLATE_METADATA
                            ]?.name
                          }
                        </strong>{' '}
                        template. The template content will be automatically applied when sending.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <DateTimePicker
                    id="scheduledAt"
                    label="Schedule Email (optional)"
                    value={emailForm.scheduledAt}
                    onChange={value => handleInputChange('scheduledAt', value)}
                    description="Schedule email for later delivery"
                  />
                </div>

                <Button
                  onClick={sendEmail}
                  disabled={
                    isLoading ||
                    selectedRecipients.length === 0 ||
                    (emailForm.templateType === 'custom' &&
                      (!emailForm.subject || !emailForm.content.trim())) // For custom: need both subject and content
                    // For templates: only need recipients (template provides subject and content)
                  }
                  className="w-full"
                >
                  {isLoading
                    ? 'Sending...'
                    : emailForm.scheduledAt
                      ? `Schedule Email ${emailForm.templateType === 'custom' ? '(Custom)' : '(Template)'}`
                      : `Send Email ${emailForm.templateType === 'custom' ? '(Custom)' : '(Template)'}`}
                </Button>
              </CardContent>
            </Card>

            {/* Recipient Selection */}
            <RecipientSelector
              selectedRecipients={selectedRecipients}
              onSelectionChange={setSelectedRecipients}
            />
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emailTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-sm font-medium">Subject: {template.subject}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleTemplateSelect(template)}
                          className="flex-1"
                          variant={emailForm.templateType === template.id ? 'default' : 'outline'}
                        >
                          {emailForm.templateType === template.id ? 'Selected' : 'Select Template'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => testTemplate(template)}>
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="h-[70vh] overflow-hidden">
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Email ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailActivity.map(activity => (
                      <TableRow
                        key={`${activity.emailId}-${activity.status}-${activity.timestamp}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon iconId={getStatusIcon(activity.status)} className="h-4 w-4" />
                            <Badge className={getStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{activity.to}</TableCell>
                        <TableCell className="max-w-xs truncate">{activity.subject}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{activity.emailId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Delivery Rate</span>
                    <span className="font-bold">{analytics.deliveryRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${analytics.deliveryRate}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Open Rate</span>
                    <span className="font-bold">{analytics.openRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analytics.openRate}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Click Rate</span>
                    <span className="font-bold">{analytics.clickRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${analytics.clickRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues & Warnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <Icon iconId="faTriangleExclamationSolid" className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Bounced Emails</p>
                    <p className="text-sm text-muted-foreground">{analytics.bounced} emails</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <Icon iconId="faExclamationSolid" className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Spam Complaints</p>
                    <p className="text-sm text-muted-foreground">
                      {analytics.complained} complaints
                    </p>
                  </div>
                </div>

                {(analytics.bounced > 0 || analytics.complained > 0) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Review bounced addresses and complaints to maintain sender reputation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
