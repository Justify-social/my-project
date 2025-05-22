'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BrandLiftPageSubtitle from '@/components/features/brand-lift/BrandLiftPageSubtitle';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Skeleton } from '@/components/ui/skeleton';
import logger from '@/lib/logger';
import { BrandLiftStudyData } from '@/types/brand-lift';

const StudySubmittedPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

  const [studyDetails, setStudyDetails] = useState<Partial<BrandLiftStudyData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studyId) {
      const fetchStudyDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/brand-lift/surveys/${studyId}`);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch study details: ${res.statusText}`);
          }
          const data = await res.json();
          setStudyDetails(data);
        } catch (err: unknown) {
          logger.error('Error fetching study details for StudySubmittedPage:', {
            studyId,
            error: (err as Error).message,
          });
          setError((err as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudyDetails();
    } else {
      setIsLoading(false);
      setError('Study ID not found.');
      logger.error('Invalid study ID for StudySubmittedPage', { param: studyIdParam });
    }
  }, [studyId, studyIdParam]);

  return (
    <div className="container mx-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center bg-background">
      {isLoading && (
        <div className="w-full max-w-md">
          <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-8" />
          <Skeleton className="h-10 md:h-12 w-3/4 md:w-1/2 mx-auto rounded mb-4" />
          <Skeleton className="h-5 w-1/2 mx-auto mb-6" />
          <Skeleton className="h-16 w-full max-w-xl mx-auto rounded mb-4" />
          <Skeleton className="h-10 w-32 mx-auto rounded" />
        </div>
      )}

      {!isLoading && error && (
        <div className="text-destructive">
          <Icon iconId="faTriangleExclamationLight" className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Study Information</h2>
          <p>{error}</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-6">
            Return to Dashboard
          </Button>
        </div>
      )}

      {!isLoading && !error && studyDetails && (
        <>
          <Icon
            iconId="faCircleCheckSolid"
            className="w-16 h-16 md:w-20 md:h-20 text-accent mb-8 drop-shadow-lg"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-primary">
            Study Submitted!
          </h1>

          <div className="mb-6 w-full max-w-xl flex justify-center">
            <BrandLiftPageSubtitle
              campaignId={studyDetails.campaign?.uuid}
              campaignName={studyDetails.campaign?.campaignName}
              studyName={studyDetails.name}
              funnelStage={studyDetails.funnelStage}
            />
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-4 px-2">
            Your Brand Lift Study "
            <span className="font-semibold text-foreground">
              {studyDetails.name || 'this study'}
            </span>
            " has been successfully submitted. Our Success Team is now processing your study, and
            your report will be delivered via email. Thank you!
          </p>
          <p className="text-sm text-muted-foreground mt-2 mb-8 max-w-xl px-2">
            Any questions - reach out by email:{' '}
            <a
              href="mailto:hello@justify.social"
              className="underline hover:text-accent transition-colors"
            >
              hello@justify.social
            </a>
          </p>

          <Button
            onClick={() => router.push('/dashboard')}
            size="lg"
            variant="outline"
            className="py-3 text-base w-full sm:w-auto sm:min-w-[200px]"
          >
            <Icon iconId="faArrowLeftLight" className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </>
      )}
    </div>
  );
};

export default StudySubmittedPage;
