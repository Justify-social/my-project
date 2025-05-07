import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // For App Router navigation

// Actual Shadcn UI imports (paths might vary based on project setup)
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { InfoCircledIcon } from "@radix-ui/react-icons"; // Example icon

// TODO: Define this type more accurately based on the actual API response from /api/campaigns
interface CampaignSelectItem {
  id: number | string; // Assuming id is string or number as per CampaignWizardSubmission
  campaignName: string;
  startDate?: string | Date;
  endDate?: string | Date;
  primaryKPI?: string;
  submissionStatus?: string; // Added based on API response in campaigns/route.ts
  // Add other fields that might be displayed for selection context
}

interface CampaignSelectorProps {
  onCampaignSelected: (campaignId: string | number) => void;
}

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({ onCampaignSelected }) => {
  const [campaigns, setCampaigns] = useState<CampaignSelectItem[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(undefined); // Ensure string for Select component
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // Uncomment if using navigation directly within this component

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/campaigns?status=COMPLETED&user_accessible=true');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
          throw new Error(
            `Failed to fetch campaigns: ${response.statusText} - ${errorData.error || 'Unknown server error'}`
          );
        }
        const data: CampaignSelectItem[] = await response.json();
        // Filter for campaigns that are truly "completed" based on your logic, if status=COMPLETED is not strict enough
        // For example, if submissionStatus is available and needs to be 'PUBLISHED' or 'COMPLETED_FINAL'
        // const filteredData = data.filter(c => c.submissionStatus === 'YOUR_COMPLETED_ENUM_VALUE');
        setCampaigns(data || []);
      } catch (err: any) {
        setError(err.message || 'Could not load campaigns.');
        setCampaigns([]);
      }
      setIsLoading(false);
    };
    fetchCampaigns();
  }, []);

  const handleSetupStudy = () => {
    if (selectedCampaignId) {
      onCampaignSelected(selectedCampaignId);
      // Or, if navigation is handled here:
      // router.push(`/brand-lift/campaign-review-setup/${selectedCampaignId}`);
    } else {
      // This alert is okay for now, but a more integrated UI notification would be better.
      alert('Please select a campaign first.');
    }
  };

  // --- Start of UI component placeholders ---
  // These would be actual imports from Shadcn in a real scenario.
  const Card = ({ children, className }: any) => (
    <div className={`bg-white shadow-md rounded-lg border border-gray-200 ${className}`}>
      {children}
    </div>
  );
  const CardHeader = ({ children }: any) => (
    <div className="p-6 border-b border-gray-200">{children}</div>
  );
  const CardTitle = ({ children }: any) => (
    <h2 className="text-2xl font-semibold text-gray-800">{children}</h2>
  );
  const CardDescription = ({ children }: any) => (
    <p className="text-sm text-gray-500 mt-1">{children}</p>
  );
  const CardContent = ({ children }: any) => <div className="p-6">{children}</div>;
  const CardFooter = ({ children }: any) => (
    <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">{children}</div>
  );

  const Select = ({ children, value, onValueChange, disabled }: any) => (
    <select
      value={value}
      onChange={e => onValueChange(e.target.value)}
      disabled={disabled}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
    >
      {children}
    </select>
  );
  const SelectTrigger = ({ children }: any) => <div className="hidden">{children}</div>; // Not directly used in native select
  const SelectValue = ({ placeholder }: any) => (
    <option value="" disabled>
      {placeholder}
    </option>
  ); // integrated into Select
  const SelectContent = ({ children }: any) => <>{children}</>; // integrated into Select
  const SelectItem = ({ value, children, disabled }: any) => (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );

  const Button = (props: any) => (
    <button
      {...props}
      className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${props.disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}`}
    />
  );
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className || 'h-8 w-full'}`}></div>
  );
  const Alert = ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div
      className={`p-4 rounded-md ${variant === 'destructive' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-300 text-blue-700'}`}
    >
      {children}
    </div>
  );
  const AlertTitle = ({ children }: any) => <h3 className="font-medium mb-1">{children}</h3>;
  const AlertDescription = ({ children }: any) => <p className="text-sm">{children}</p>;
  // --- End of UI component placeholders ---

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/3 ml-auto" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardContent>
          <Alert variant="destructive">
            {/* <InfoCircledIcon className="h-4 w-4" /> */}
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Select Campaign for Brand Lift Study</CardTitle>
        <CardDescription>
          Choose a completed campaign to measure its brand lift. Only eligible campaigns are shown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <Alert>
            {/* <InfoCircledIcon className="h-4 w-4" /> */}
            <AlertTitle>No Campaigns Available</AlertTitle>
            <AlertDescription>
              There are no completed campaigns eligible for a Brand Lift study at the moment. Please
              ensure campaigns are marked as completed and meet accessibility criteria.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="campaign-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Campaign
              </label>
              <Select
                id="campaign-select"
                value={selectedCampaignId || ''}
                onValueChange={(value: string) => setSelectedCampaignId(value)}
              >
                <SelectValue placeholder="Select a campaign..." />
                {campaigns.map(campaign => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.campaignName} (ID: {campaign.id} - Status:{' '}
                    {campaign.submissionStatus || 'N/A'})
                  </SelectItem>
                ))}
              </Select>
            </div>
            {/* TODO: Per Figma, add buttons for "Edit Selected Campaign" and "+ Create New Campaign". 
                            These would likely navigate to existing campaign wizard flows or be deferred features.
                            Example placeholder:
                            <div className="flex space-x-2 mt-4">
                                <Button variant="outline" disabled={!selectedCampaignId}>Edit Selected</Button>
                                <Button variant="outline">+ Create New Campaign</Button> 
                            </div>
                        */}
          </div>
        )}
      </CardContent>
      {campaigns.length > 0 && (
        <CardFooter>
          <Button onClick={handleSetupStudy} disabled={!selectedCampaignId || isLoading}>
            Setup Brand Lift Study
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CampaignSelector;
