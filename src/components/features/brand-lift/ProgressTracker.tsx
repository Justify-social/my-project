'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from '@/components/ui/icon';
import { Progress } from "@/components/ui/progress"; // Shadcn Progress component
import StatusTag from './StatusTag'; // Corrected import path
import { BrandLiftStudyStatus } from '@prisma/client'; // Import correct enum
import logger from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import fetcher from '@/lib/fetcher'; // Use default import
import useSWR from 'swr';

interface ProgressData {
    studyId: string;
    studyStatus: BrandLiftStudyStatus;
    localDatabaseResponseCount: number;
    cintLiveProgress?: {
        status: string; // e.g., "live", "paused", "completed"
        targetCompletes: number;
        currentCompletes: number;
        currentPrescreens: number;
        medianIR: number;
        medianLOISeconds: number;
    } | null;
    interimLiftMetrics?: {
        exposedCount: number;
        controlCount: number;
        // awarenessLift?: number | null;
    } | null;
}

interface ProgressTrackerProps {
    studyId: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ studyId }) => {
    const router = useRouter();
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/brand-lift/surveys/${studyId}/progress`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch progress data');
            }
            const data: ProgressData = await response.json();
            setProgressData(data);
        } catch (err: any) {
            logger.error('Error fetching study progress:', { studyId, error: err.message });
            setError(err.message || 'Failed to load progress data.');
        }
        if (!isRefresh) setIsLoading(false);
    }, [studyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-7 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-8 w-24 self-end" />
                </CardContent>
            </Card>
        );
    }

    if (error || !progressData) {
        return (
            <Alert variant="destructive">
                <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
                <AlertTitle>Error Loading Progress</AlertTitle>
                <AlertDescription>{error || 'Progress data is unavailable.'}</AlertDescription>
                <Button onClick={() => fetchData(true)} variant="outline" size="sm" className="mt-2">Try Again</Button>
            </Alert>
        );
    }

    const { studyStatus, localDatabaseResponseCount, cintLiveProgress, interimLiftMetrics } = progressData;
    const target = cintLiveProgress?.targetCompletes || localDatabaseResponseCount; // Use Cint target if available, else local might not have a clear target
    const current = cintLiveProgress?.currentCompletes ?? localDatabaseResponseCount;
    const progressPercentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Study Progress</CardTitle>
                    {progressData?.studyStatus && (
                        <CardDescription>Status: <StatusTag status={studyStatus} type="study" /></CardDescription>
                    )}
                </div>
                <Button onClick={() => fetchData(true)} variant="outline" size="sm">
                    <Icon iconId="faArrowsRotateLight" className="mr-2 h-4 w-4" /> Refresh Data
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Responses Gathered</span>
                        <span>{current} / {cintLiveProgress ? cintLiveProgress.targetCompletes : '(Target N/A)'}</span>
                    </div>
                    <Progress value={progressPercentage} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">Local DB count: {localDatabaseResponseCount}</p>
                    {cintLiveProgress && (
                        <div className="text-sm text-muted-foreground mt-2">
                            Cint Status: <StatusTag status={cintLiveProgress.status.toUpperCase() as any} type="study" /> | Prescreens: {cintLiveProgress.currentPrescreens} | Median IR: {cintLiveProgress.medianIR?.toFixed(2)} | Median LOI: ~{Math.round((cintLiveProgress.medianLOISeconds || 0) / 60)} min
                        </div>
                    )}
                </div>

                <Card className="bg-slate-50 p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-md">Interim Metrics (Placeholder)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-sm">
                        <p>Exposed Group N: {interimLiftMetrics?.exposedCount ?? 'N/A'}</p>
                        <p>Control Group N: {interimLiftMetrics?.controlCount ?? 'N/A'}</p>
                        <p className="text-muted-foreground mt-1">Detailed lift calculations will appear here once data processing is complete.</p>
                    </CardContent>
                </Card>

                {studyStatus === BrandLiftStudyStatus.COLLECTING && (
                    <Button className="w-full" onClick={() => alert('TODO: Pause Study - API call to update BrandLiftStudy status to PAUSED and inform Cint')}>
                        <Icon iconId="faPauseLight" className="mr-2" /> Pause Data Collection
                    </Button>
                )}
                {studyStatus === BrandLiftStudyStatus.COMPLETED && (
                    <Button className="w-full" onClick={() => router.push(`/report/${studyId}`)}>
                        <Icon iconId="faChartSimpleLight" className="mr-2" /> View Full Report
                    </Button>
                )}

            </CardContent>
        </Card>
    );
};

export default ProgressTracker; 