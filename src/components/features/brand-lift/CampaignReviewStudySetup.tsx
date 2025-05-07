'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import logger from '@/lib/logger';

// Assume KPI enum/options are available (e.g., imported or defined)
// Replace with actual KPI options/enum from types or config
const ALL_KPIS = [
  {
    id: 'BRAND_AWARENESS',
    label: 'Brand Awareness',
    description: 'Measures if respondents recall seeing the brand.',
  },
  {
    id: 'AD_RECALL',
    label: 'Ad Recall',
    description: 'Measures if respondents recall seeing the specific ad.',
  },
  {
    id: 'MESSAGE_ASSOCIATION',
    label: 'Message Association',
    description: 'Measures if respondents associate the key message with the brand.',
  },
  {
    id: 'CONSIDERATION',
    label: 'Consideration',
    description: 'Measures if respondents would consider the brand for relevant purchases.',
  },
  {
    id: 'BRAND_PREFERENCE',
    label: 'Brand Preference',
    description: 'Measures if respondents prefer the brand over competitors.',
  },
  {
    id: 'PURCHASE_INTENT',
    label: 'Purchase Intent',
    description: 'Measures likelihood to purchase in the near future.',
  },
];

const FUNNEL_STAGES = [
  {
    id: 'TOP_FUNNEL',
    label: 'Top Funnel',
    description: 'Focuses on Awareness and Recall metrics.',
  },
  {
    id: 'MID_FUNNEL',
    label: 'Mid Funnel',
    description: 'Focuses on Consideration and Preference.',
  },
  { id: 'BOTTOM_FUNNEL', label: 'Bottom Funnel', description: 'Focuses on Intent and Action.' },
];

interface CampaignDetails {
  id: number;
  campaignName: string;
  primaryKPI?: string | null;
  platform?: string | null;
  audience?: { description?: string } | null; // Assuming nested structure for simplicity
  // Add other fields based on actual API response for `@Select Campaign.png`
}

const studySetupSchema = z.object({
  studyName: z.string().min(3, { message: 'Study name must be at least 3 characters.' }),
  funnelStage: z.string({ required_error: 'Funnel stage is required.' }).min(1), // Ensure selection
  primaryKpi: z.string({ required_error: 'Primary KPI is required.' }).min(1),
  secondaryKpis: z.array(z.string()).optional(),
});

type StudySetupFormValues = z.infer<typeof studySetupSchema>;

interface CampaignReviewStudySetupProps {
  campaignId: number;
}

const CampaignReviewStudySetup: React.FC<CampaignReviewStudySetupProps> = ({ campaignId }) => {
  const router = useRouter();
  const [campaignData, setCampaignData] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<StudySetupFormValues>({
    resolver: zodResolver(studySetupSchema),
    defaultValues: {
      studyName: '',
      secondaryKpis: [],
    },
  });

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`/api/campaign-data-for-brand-lift/${campaignId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch campaign details: ${response.statusText}`
          );
        }
        const data: CampaignDetails = await response.json();
        setCampaignData(data);
        setValue('studyName', `${data.campaignName ?? 'Campaign'} - Brand Lift Study`);
      } catch (err: any) {
        logger.error('Error fetching campaign details:', { campaignId, error: err.message });
        setFetchError(err.message || 'An unexpected error occurred.');
      }
      setIsLoading(false);
    };
    fetchCampaignDetails();
  }, [campaignId, setValue]);

  const onSubmit: SubmitHandler<StudySetupFormValues> = async data => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = { ...data, campaignId, secondaryKpis: data.secondaryKpis ?? [] };
      logger.info('Submitting new Brand Lift study', { payload });
      const response = await fetch('/api/brand-lift/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create study: ${response.statusText}`);
      }
      const newStudy = await response.json();
      logger.info('Brand Lift study created successfully', { newStudyId: newStudy.id });
      router.push(`/survey-design/${newStudy.id}`);
    } catch (err: any) {
      logger.error('Error creating Brand Lift study:', { error: err.message });
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24 ml-auto" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
        <AlertTitle>Error Loading Campaign Data</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Campaign Details</CardTitle>
          <CardDescription>
            Confirming details for: {campaignData?.campaignName ?? '...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <Label>Primary Objective:</Label>{' '}
            <span className="text-muted-foreground">{campaignData?.primaryKPI ?? 'N/A'}</span>
          </div>
          <div>
            <Label>Platform:</Label>{' '}
            <span className="text-muted-foreground">{campaignData?.platform ?? 'N/A'}</span>
          </div>
          <div className="md:col-span-2">
            <Label>Audience Summary:</Label>{' '}
            <span className="text-muted-foreground">
              {campaignData?.audience?.description ?? 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Brand Lift Study Setup</CardTitle>
            <CardDescription>Define the parameters for your new study.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studyName">Study Name</Label>
              <Input
                id="studyName"
                {...register('studyName')}
                placeholder="e.g., Q3 Product Launch Lift Study"
              />
              {errors.studyName && (
                <p className="text-xs text-destructive">{errors.studyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select Funnel Stage</Label>
              <Select
                onValueChange={value => setValue('funnelStage', value, { shouldValidate: true })}
                name={register('funnelStage').name}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funnel stage..." />
                </SelectTrigger>
                <SelectContent>
                  {FUNNEL_STAGES.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center">
                        {stage.label}
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 ml-2">
                                <Icon
                                  iconId="faCircleInfoLight"
                                  className="h-3 w-3 text-muted-foreground"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{stage.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.funnelStage && (
                <p className="text-xs text-destructive">{errors.funnelStage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Primary KPI</Label>
              <Select
                onValueChange={value => setValue('primaryKpi', value, { shouldValidate: true })}
                name={register('primaryKpi').name}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary KPI..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_KPIS.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      <div className="flex items-center">
                        {kpi.label}
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 ml-2">
                                <Icon
                                  iconId="faCircleInfoLight"
                                  className="h-3 w-3 text-muted-foreground"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{kpi.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryKpi && (
                <p className="text-xs text-destructive">{errors.primaryKpi.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Secondary KPIs (Optional)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {ALL_KPIS.map(kpi => (
                  <div key={kpi.id} className="flex items-center space-x-2">
                    <Checkbox id={`kpi-${kpi.id}`} value={kpi.id} {...register('secondaryKpis')} />
                    <Label
                      htmlFor={`kpi-${kpi.id}`}
                      className="text-sm font-normal flex items-center cursor-pointer"
                    >
                      {kpi.label}
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                              <Icon
                                iconId="faCircleInfoLight"
                                className="h-3 w-3 text-muted-foreground"
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{kpi.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>
                ))}
              </div>
              {errors.secondaryKpis && (
                <p className="text-xs text-destructive">{errors.secondaryKpis.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {submitError && (
              <Alert variant="destructive" className="mr-auto max-w-md">
                <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
                <AlertTitle>Error Creating Study</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Icon iconId="faSpinnerLight" className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Continue to Survey Design
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default CampaignReviewStudySetup;
