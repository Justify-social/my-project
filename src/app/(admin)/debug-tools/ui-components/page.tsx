/**
 * UI Component Browser
 * 
 * This page displays key UI components from @/components/ui for visual reference.
 */

import {
  Button, ButtonProps,
  Card, CardHeader, CardTitle, CardContent,
  Badge,
  Input,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  ThemeToggle,
  Avatar, AvatarImage, AvatarFallback,
  Alert, AlertTitle, AlertDescription,
  Table,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui";
import { LightIcon, SolidIcon, Icon } from '@/components/ui/icon';

export default function ComponentBrowserPage() {
  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">UI Component Browser</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>

      {/* Section for Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Button</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button><LightIcon iconId="faArrowRightLight" className="mr-2" /> Icon Left</Button>
          <Button>Icon Right <LightIcon iconId="faCheckLight" className="ml-2" /></Button>
          <Button size="lg">Large</Button>
          <Button size="sm">Small</Button>
          <Button size="icon"><LightIcon iconId="faGearLight" /></Button>
        </CardContent>
      </Card>

      {/* Section for Card */}
      <Card>
        <CardHeader>
          <CardTitle>Card</CardTitle>
        </CardHeader>
        <CardContent>
          This is the content area of a standard card.
        </CardContent>
      </Card>

      {/* Section for Badge */}
      <Card>
        <CardHeader>
          <CardTitle>Badge</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </CardContent>
      </Card>

      {/* Section for Alert */}
      <Card>
        <CardHeader>
          <CardTitle>Alert</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <LightIcon iconId="faTriangleExclamationLight" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>This is a default alert.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <LightIcon iconId="faDiamondExclamationLight" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>This is a destructive alert.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section for Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>

      {/* Section for Input */}
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Enter text here..." />
        </CardContent>
      </Card>

      {/* Section for Select */}
      <Card>
        <CardHeader>
          <CardTitle>Select</CardTitle>
        </CardHeader>
        <CardContent>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Section for Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">Account details go here.</TabsContent>
            <TabsContent value="password">Password settings go here.</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Section for Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Icon</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <Icon iconId="faUserLight" />
          <LightIcon iconId="faGearLight" />
          <SolidIcon iconId="faCheckSolid" />
          <Icon iconId="faArrowRightLight" />
          <Icon iconId="faTrashCanLight" size="lg" />
          <Icon iconId="faChartLineLight" size="sm" />
          <Icon iconId="brandsFacebook" /> { /* Brand Icon */}
          <Icon iconId="appHome" size="xl" /> { /* Example App Icon */}
        </CardContent>
      </Card>

    </div>
  );
} 