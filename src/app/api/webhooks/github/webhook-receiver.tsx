'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/atoms/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/molecules/tabs';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { Label } from '@/components/ui/atoms/label';
import { Switch } from '@/components/ui/atoms/switch';
import { Badge } from '@/components/ui/atoms/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/atoms/alert';
import { Icon } from '@/components/ui/atoms/icon';

interface WebhookEvent {
  id: string;
  event: string;
  repository: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  details: {
    sender: string;
    action?: string;
    components?: {
      added: number;
      modified: number;
      removed: number;
    };
    branch?: string;
    commitId?: string;
  };
}

/**
 * WebhookReceiver Component
 * 
 * Displays webhook logs, configuration settings, and provides an interface
 * for administrators to manage GitHub webhook integration.
 */
export default function WebhookReceiver() {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookSecret, setWebhookSecret] = useState<string>('');
  const [allowedBranches, setAllowedBranches] = useState<string>('main,master');
  const [autoDeployEnabled, setAutoDeployEnabled] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [configSaved, setConfigSaved] = useState<boolean>(false);

  // Initialize webhook URL
  useEffect(() => {
    const baseUrl = window.location.origin;
    setWebhookUrl(`${baseUrl}/api/webhooks/github`);
  }, []);

  // Fetch webhook logs on mount
  useEffect(() => {
    fetchWebhookLogs();
  }, []);

  // Fetch webhook configuration
  const fetchWebhookLogs = async () => {
    setIsLoading(true);
    try {
      // Simulated data - would be replaced with actual API call
      const response = await new Promise<WebhookEvent[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 'wh_1234567890',
              event: 'push',
              repository: 'org/ui-components',
              timestamp: new Date().toISOString(),
              status: 'success',
              details: {
                sender: 'developer1',
                branch: 'main',
                commitId: 'abc1234',
                components: {
                  added: 2,
                  modified: 5,
                  removed: 0
                }
              }
            },
            {
              id: 'wh_0987654321',
              event: 'pull_request',
              repository: 'org/ui-components',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              status: 'success',
              details: {
                sender: 'developer2',
                action: 'opened',
                components: {
                  added: 1,
                  modified: 0,
                  removed: 0
                }
              }
            },
            {
              id: 'wh_5678901234',
              event: 'pull_request',
              repository: 'org/ui-components',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              status: 'error',
              details: {
                sender: 'developer3',
                action: 'synchronize'
              }
            }
          ]);
        }, 500);
      });
      
      setWebhookEvents(response);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">GitHub Webhook Integration</h1>
      
      <Tabs defaultValue="logs">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="logs">Webhook Logs</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>
        
        {/* Webhook Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Recent Webhook Events</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchWebhookLogs}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Icon iconId="faArrowRotateRightLight" className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icon iconId="faArrowRotateRightLight" className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                View the most recent webhook events received from GitHub
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhookEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No webhook events received yet
                </div>
              ) : (
                <div className="space-y-4">
                  {webhookEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getStatusColor(event.status)}`} />
                          <span className="font-semibold">
                            {event.event === 'push' ? 'Push' : 'Pull Request'}
                          </span>
                          <Badge variant="outline">{event.repository}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      
                      <div className="pl-5 text-sm">
                        <p>
                          <span className="text-gray-600">From:</span> {event.details.sender}
                          {event.details.branch && (
                            <span> on <Badge variant="secondary">{event.details.branch}</Badge></span>
                          )}
                          {event.details.action && (
                            <span> ({event.details.action})</span>
                          )}
                        </p>
                        
                        {event.details.components && (
                          <p className="mt-1">
                            Components: 
                            {event.details.components.added > 0 && (
                              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                                +{event.details.components.added} added
                              </Badge>
                            )}
                            {event.details.components.modified > 0 && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                {event.details.components.modified} modified
                              </Badge>
                            )}
                            {event.details.components.removed > 0 && (
                              <Badge className="ml-2 bg-red-100 text-red-800 border-red-200">
                                {event.details.components.removed} removed
                              </Badge>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Configuration Tab */}
        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure how webhooks are processed and integrated with your component library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex">
                  <Input 
                    id="webhook-url"
                    value={webhookUrl} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyWebhookUrl}
                    className="ml-2 w-[100px]"
                  >
                    {showCopied ? (
                      <>
                        <Icon iconId="faCircleCheckLight" className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Icon iconId="faCopyLight" className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Use this URL in your GitHub repository webhook settings
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                <Input 
                  id="webhook-secret"
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                />
                <p className="text-sm text-gray-500">
                  Secret key used to verify webhook signatures
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowed-branches">Allowed Branches</Label>
                <Input 
                  id="allowed-branches"
                  value={allowedBranches}
                  onChange={(e) => setAllowedBranches(e.target.value)}
                  placeholder="main,master"
                />
                <p className="text-sm text-gray-500">
                  Comma-separated list of branches to process webhooks from
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-deploy">Auto Deploy Changes</Label>
                  <p className="text-sm text-gray-500">
                    Automatically deploy component changes from verified webhooks
                  </p>
                </div>
                <Switch
                  id="auto-deploy"
                  checked={autoDeployEnabled}
                  onCheckedChange={setAutoDeployEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Send notifications when components are updated via webhooks
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              {configSaved && (
                <Alert className="bg-green-50 border-green-200">
                  <Icon iconId="faCircleCheckLight" className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Configuration saved successfully
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSaveConfig}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icon iconId="faArrowRotateRightLight" className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Setup Guide Tab */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Webhook Setup Guide</CardTitle>
              <CardDescription>
                Follow these steps to configure webhooks in your GitHub repository
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Navigate to Repository Settings</h3>
                <p className="text-gray-600">
                  Go to your GitHub repository and click on "Settings" in the top navigation bar.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Access Webhooks Section</h3>
                <p className="text-gray-600">
                  In the left sidebar, click on "Webhooks" and then "Add webhook".
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Configure Webhook</h3>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payload URL:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{webhookUrl}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Content type:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">application/json</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Secret:</span>
                      <span className="italic text-gray-500">Create a secure secret and enter it here</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Events:</span>
                      <span>Push events, Pull request events</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">4. Save Webhook</h3>
                <p className="text-gray-600">
                  Click "Add webhook" to create the webhook. GitHub will send a ping event to verify the configuration.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">5. Update Environment Variables</h3>
                <p className="text-gray-600">
                  Add the following environment variables to your application:
                </p>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <code className="block text-sm">
                    <div>GITHUB_WEBHOOK_SECRET=your_webhook_secret</div>
                    <div>GITHUB_TOKEN=github_personal_access_token</div>
                    <div>WEBHOOK_ALLOWED_BRANCHES=main,master</div>
                  </code>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">6. Verify Integration</h3>
                <p className="text-gray-600">
                  Make a test commit to your repository and verify that the webhook is received in the logs tab.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 