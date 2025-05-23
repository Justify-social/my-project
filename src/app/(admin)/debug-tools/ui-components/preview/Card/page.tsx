import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function CardPreviewPage() {
  const componentMeta = {
    name: 'Card',
    description:
      'A versatile container for grouping related content and actions. Built with flexible composition patterns.',
    category: 'organism',
    subcategory: 'layout',
    renderType: 'server',
    author: 'Shadcn UI',
    since: '2023-01-01',
    status: 'stable',
  };

  const examples: string[] = [
    `import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>

// Card with footer
<Card>
  <CardHeader>
    <CardTitle>Create project</CardTitle>
    <CardDescription>Deploy your new project in one-click.</CardDescription>
  </CardHeader>
  <CardContent>
    <form>
      <div className="grid w-full items-center gap-4">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Name of your project" />
      </div>
    </form>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Deploy</Button>
  </CardFooter>
</Card>`,
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-secondary">
        <ol className="list-none p-0 inline-flex space-x-2">
          <li className="flex items-center">
            <Link href="/debug-tools/ui-components" className="hover:text-Interactive">
              UI Components
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="capitalize">{componentMeta.category}</span>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="font-medium text-primary">{componentMeta.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="mb-8 border-b border-divider pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">{componentMeta.name}</h1>
          <div className="flex items-center space-x-3 text-sm">
            {componentMeta.status && (
              <Badge
                variant="outline"
                className={cn(
                  'font-medium',
                  statusStyles[componentMeta.status] || statusStyles.development
                )}
              >
                {componentMeta.status}
              </Badge>
            )}
            <span className="text-secondary capitalize">({componentMeta.renderType || 'N/A'})</span>
          </div>
        </div>
        {componentMeta.description && (
          <p className="mt-2 text-secondary max-w-3xl">{componentMeta.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          {componentMeta.author && <span>Author: {componentMeta.author}</span>}
          {componentMeta.since && <span>Since: {componentMeta.since}</span>}
        </div>
      </div>

      {/* Examples Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Examples / Usage</h2>
        <div className="space-y-6">
          {/* Basic Card */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Basic Card</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>You have 3 unread messages.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icon iconId="faEnvelopeLight" className="h-4 w-4" />
                      <span className="text-sm">Your order was shipped!</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon iconId="faHeartLight" className="h-4 w-4" />
                      <span className="text-sm">Someone liked your post</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon iconId="faCommentLight" className="h-4 w-4" />
                      <span className="text-sm">You have a new comment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Team Progress</CardTitle>
                  <CardDescription>Track your team's monthly performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tasks Completed</span>
                      <span className="font-medium">42/50</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Card with Footer */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Card with Footer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Create project</CardTitle>
                  <CardDescription>Deploy your new project in one-click.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Name of your project" />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="framework">Framework</Label>
                        <Input id="framework" placeholder="Next.js" />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Deploy</Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>Choose the perfect plan for your needs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      $29<span className="text-lg font-normal">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <Icon iconId="faCheckLight" className="mr-2 h-4 w-4" />
                        Unlimited projects
                      </li>
                      <li className="flex items-center">
                        <Icon iconId="faCheckLight" className="mr-2 h-4 w-4" />
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <Icon iconId="faCheckLight" className="mr-2 h-4 w-4" />
                        Advanced analytics
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Subscribe Now</Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Profile Cards */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Profile Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/avatars/01.png" alt="@johndoe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">John Doe</CardTitle>
                      <CardDescription>@johndoe</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Frontend developer passionate about creating beautiful user experiences.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Icon iconId="faUserPlusLight" className="mr-2 h-4 w-4" />
                    Follow
                  </Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/avatars/02.png" alt="@janesmith" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Jane Smith</CardTitle>
                      <CardDescription>@janesmith</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    UX designer focused on accessibility and inclusive design practices.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Icon iconId="faUserPlusLight" className="mr-2 h-4 w-4" />
                    Follow
                  </Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/avatars/03.png" alt="@mikewilson" />
                      <AvatarFallback>MW</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Mike Wilson</CardTitle>
                      <CardDescription>@mikewilson</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Full-stack engineer with expertise in cloud architecture and DevOps.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Icon iconId="faCheckLight" className="mr-2 h-4 w-4" />
                    Following
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Metric Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Icon iconId="faDollarSignLight" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                  <Icon iconId="faUsersLight" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2350</div>
                  <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <Icon iconId="faCreditCardLight" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                  <Icon iconId="faActivityLight" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Complex Cards */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Complex Cards</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Activity</CardTitle>
                      <CardDescription>Recent activity from your team</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon iconId="faRefreshLight" className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">John deployed to production</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Jane created a new branch</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MW</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Mike updated the documentation</p>
                        <p className="text-xs text-muted-foreground">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full">
                    View all activity
                    <Icon iconId="faArrowRightLight" className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used actions and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <Icon iconId="faFileAltLight" className="h-6 w-6" />
                      <span className="text-sm">New Document</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <Icon iconId="faFolderLight" className="h-6 w-6" />
                      <span className="text-sm">New Folder</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <Icon iconId="faUploadLight" className="h-6 w-6" />
                      <span className="text-sm">Upload File</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <Icon iconId="faShareLight" className="h-6 w-6" />
                      <span className="text-sm">Share</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      {examples && examples.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">Code Examples</h2>
          <div className="space-y-4">
            {examples.map((exampleCode: string, index: number) => (
              <div key={index} className="border border-divider rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h4 className="text-sm font-medium">Usage Examples</h4>
                </div>
                <pre className="text-sm p-4 bg-gray-50 text-gray-800 overflow-x-auto">
                  <code>{exampleCode}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Best Practices</h2>
        <div className="border border-divider rounded-lg p-6">
          <div className="grid gap-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2">✅ Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use semantic hierarchy with CardTitle and CardDescription</li>
                <li>• Keep card content focused on a single topic or action</li>
                <li>• Provide clear CTAs in the footer when needed</li>
                <li>• Use consistent spacing with the provided components</li>
                <li>• Group related cards with similar visual patterns</li>
                <li>• Consider card loading states for dynamic content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">❌ Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Overcrowd cards with too much information</li>
                <li>• Use cards for simple lists that don't need grouping</li>
                <li>• Mix inconsistent visual patterns within card groups</li>
                <li>• Forget to handle empty states gracefully</li>
                <li>• Use cards when a simpler layout would suffice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Component Structure */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Component Structure</h2>
        <div className="border border-divider rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Card Components</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <code>Card</code> - Root container with border and shadow
                </li>
                <li>
                  • <code>CardHeader</code> - Top section for title and description
                </li>
                <li>
                  • <code>CardTitle</code> - Main heading (h3-like styling)
                </li>
                <li>
                  • <code>CardDescription</code> - Subtitle or description text
                </li>
                <li>
                  • <code>CardContent</code> - Main content area
                </li>
                <li>
                  • <code>CardFooter</code> - Bottom section for actions
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Typical Structure</h4>
              <div className="bg-muted p-4 rounded text-sm">
                <code>
                  {
                    '<Card>\n  <CardHeader>\n    <CardTitle>...</CardTitle>\n    <CardDescription>...</CardDescription>\n  </CardHeader>\n  <CardContent>\n    {/* Main content */}\n  </CardContent>\n  <CardFooter>\n    {/* Actions */}\n  </CardFooter>\n</Card>'
                  }
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
