'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// --- Helper: Card for Debug Tool Links ---
interface DebugToolCardProps {
  title: string;
  description: string;
  linkHref?: string;
  buttonText: string;
  onButtonClick?: () => void;
  isLoading?: boolean;
}

const DebugToolCard: React.FC<DebugToolCardProps> = ({
  title,
  description,
  linkHref,
  buttonText,
  onButtonClick,
  isLoading,
}) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {linkHref ? (
        <Button variant="default" asChild>
          <Link href={linkHref}>{buttonText}</Link>
        </Button>
      ) : (
        <Button variant="default" onClick={onButtonClick} disabled={isLoading}>
          {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
          {buttonText}
        </Button>
      )}
    </CardContent>
  </Card>
);
// -------------------------------------

export default function DebugToolsPage() {
  const [campaignId, setCampaignId] = useState<string>('');

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-primary">Debug Tools</h1>

      {/* Debug Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* <DebugToolCard 
            title="Campaign Data Verification" 
            description="Verify campaign data and identify submission issues."
            buttonText="Use Verification Tool"
            onButtonClick={() => document.getElementById('campaign-verify')?.scrollIntoView({ behavior: 'smooth' })}
        /> */}
        <DebugToolCard
          title="API Verification"
          description="Test and verify external API integrations."
          linkHref="/debug-tools/api-verification"
          buttonText="Open API Verification"
        />
        <DebugToolCard
          title="UI Components"
          description="View and test centralized UI components."
          linkHref="/debug-tools/ui-components"
          buttonText="View UI Components"
        />
        <DebugToolCard
          title="Database Health"
          description="Access schema, documentation, and health monitoring."
          linkHref="/debug-tools/database"
          buttonText="View Database Health"
        />
        <DebugToolCard
          title="Graphiti Monitoring"
          description="Monitor knowledge graph usage and integration health."
          linkHref="http://localhost:7474/browser/"
          buttonText="View Graphiti Dashboard"
        />
      </div>

      {/* Campaign Verification Tool Section */}
      <Card id="campaign-verify" className="border-divider">
        <CardHeader>
          <CardTitle className="text-xl">Verify Campaign Data</CardTitle>
          <CardDescription>Enter a campaign ID to verify its data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={campaignId}
              onChange={e => setCampaignId(e.target.value)}
              placeholder="Enter Campaign ID"
              className="flex-grow"
            />
          </div>

          {/* Go to Step Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(step => (
              <Button key={step} variant="secondary" disabled={!campaignId}>
                Go to Step {step}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Results Display - Commented out as 'results' state is removed */}
      {/*
      {results && (
        <Card className="border-divider">
          <CardHeader>
            <CardTitle className="text-xl">Campaign Data for: <span className="font-mono text-base">{results.id}</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-input bg-muted/30">
                <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
                <CardContent>
                  <Table className="text-sm">
                    <TableBody>
                      <TableRow><TableCell className="font-medium text-secondary w-1/3">ID</TableCell><TableCell className="font-mono">{results.id}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">Name</TableCell><TableCell>{results.campaignName}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">Description</TableCell><TableCell>{results.description}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">Start Date</TableCell><TableCell>{results.startDate ? new Date(results.startDate).toLocaleDateString() : 'N/A'}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">End Date</TableCell><TableCell>{results.endDate ? new Date(results.endDate).toLocaleDateString() : 'N/A'}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">Time Zone</TableCell><TableCell>{results.timeZone}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">Status</TableCell><TableCell><Badge variant="outline">{results.status}</Badge></TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card className="border-input bg-muted/30">
                <CardHeader><CardTitle className="text-base">Financial Information</CardTitle></CardHeader>
                <CardContent>
                  <Table className="text-sm">
                    <TableBody>
                      <TableRow><TableCell className="font-medium text-secondary w-1/3">Currency</TableCell><TableCell>{results.currency}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">Total Budget</TableCell><TableCell>{results.totalBudget}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium text-secondary">Social Media Budget</TableCell><TableCell>{results.socialMediaBudget}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <Card className="border-input bg-muted/30">
              <CardHeader><CardTitle className="text-base">Contacts</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Primary</h4>
                  {results.primaryContact ? (
                    <div>
                      <p>{results.primaryContact.firstName} {results.primaryContact.surname}</p>
                      <p className="text-muted-foreground text-xs">{results.primaryContact.email}</p>
                      <p className="text-muted-foreground text-xs">{results.primaryContact.position}</p>
                    </div>
                  ) : <p className="text-destructive text-xs italic">Missing</p>}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Secondary</h4>
                  {results.secondaryContact ? (
                    <div>
                      <p>{results.secondaryContact.firstName} {results.secondaryContact.surname}</p>
                      <p className="text-muted-foreground text-xs">{results.secondaryContact.email}</p>
                      <p className="text-muted-foreground text-xs">{results.secondaryContact.position}</p>
                    </div>
                  ) : <p className="text-muted-foreground text-xs italic">None</p>}
                </div>
              </CardContent>
            </Card>
            <Card className="border-input bg-muted/30">
              <CardHeader><CardTitle className="text-base">Raw Campaign Data</CardTitle></CardHeader>
              <CardContent className="bg-background text-accent-foreground p-3 rounded overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
      */}
    </div>
  );
}
