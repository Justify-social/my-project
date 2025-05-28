'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Base intelligence hub skeleton with common patterns
interface IntelligenceSkeletonProps {
  className?: string;
  showProgressBar?: boolean;
  showMetrics?: boolean;
  metricsCount?: number;
}

export const BaseIntelligenceSkeleton: React.FC<IntelligenceSkeletonProps> = ({
  className,
  showProgressBar = false,
  showMetrics = false,
  metricsCount = 4,
}) => (
  <Card className={cn('border-accent/20 bg-gradient-to-br from-accent/5 to-background', className)}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      {showMetrics && (
        <div className={`grid grid-cols-2 lg:grid-cols-${metricsCount} gap-4`}>
          {Array.from({ length: metricsCount }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
              {showProgressBar && <Skeleton className="h-2 w-full mt-2 rounded-full" />}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

// Trust Hero Section skeleton
export const TrustHeroSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card
    className={cn(
      'border-2 border-accent/20 shadow-lg bg-gradient-to-r from-background to-accent/5',
      className
    )}
  >
    <CardContent className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          {/* Trust Shield */}
          <div className="p-6 rounded-xl border bg-gradient-to-br from-success/5 to-success/10">
            <div className="flex items-center justify-center mb-4">
              <Skeleton className="w-10 h-10 rounded" />
            </div>
            <div className="text-center mb-4">
              <Skeleton className="h-12 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-5 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-6 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Trust Score */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <Skeleton className="h-16 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="border-t border-border/50 my-6" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

// Performance Dashboard skeleton
export const PerformanceDashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <BaseIntelligenceSkeleton
    className={className}
    showMetrics={true}
    metricsCount={4}
    showProgressBar={false}
  />
);

// Content Intelligence skeleton
export const ContentIntelligenceSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <BaseIntelligenceSkeleton
    className={className}
    showMetrics={true}
    metricsCount={4}
    showProgressBar={true}
  />
);

// Audience Demographics skeleton
export const AudienceDemographicsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('border-accent/20 bg-gradient-to-br from-accent/5 to-background', className)}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Quality indicator */}
      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16 rounded-full ml-2" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Demographics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Brand Intelligence skeleton
export const BrandIntelligenceSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('border-accent/20 bg-gradient-to-br from-accent/5 to-background', className)}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Brand alignment overview */}
      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-20 rounded-full ml-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Brand intelligence grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="w-12 h-1 rounded-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Advanced Insights skeleton
export const AdvancedInsightsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('border-accent/20 bg-gradient-to-br from-accent/5 to-background', className)}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Industry positioning */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/20 border border-border/50 text-center">
              <Skeleton className="h-4 w-20 mx-auto mb-1" />
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-6 w-20 mx-auto mt-2 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Lookalike influencers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <div className="space-y-1">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-1 w-full rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Professional Intelligence Card skeleton
export const ProfessionalIntelligenceSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <Card className={cn('border-accent/20 bg-gradient-to-br from-accent/5 to-background', className)}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="space-y-5">
      {/* Contact methods */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="w-4 h-4" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Account intelligence */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg text-center bg-muted/30 border border-border/50">
              <Skeleton className="w-5 h-5 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Orchestrated loading for the entire profile header
export const ProfileHeaderSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <TrustHeroSkeleton />
    <Card className="overflow-hidden border-border/50 shadow-lg bg-gradient-to-br from-background via-background to-muted/10">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main profile info */}
          <div className="lg:col-span-7">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex items-center gap-6 pt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-6 w-12 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Intelligence hubs */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <ProfessionalIntelligenceSkeleton />
            </div>
          </div>

          {/* Justify score */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="p-6 rounded-lg border text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-3 w-20 mx-auto mb-1" />
                <Skeleton className="h-10 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Loading orchestration hook
export const useIntelligenceLoading = () => {
  const [loadingStates, setLoadingStates] = React.useState({
    trust: true,
    professional: true,
    performance: true,
    content: true,
    audience: true,
    brand: true,
    advanced: true,
  });

  const setLoading = React.useCallback(
    (component: keyof typeof loadingStates, loading: boolean) => {
      setLoadingStates(prev => ({ ...prev, [component]: loading }));
    },
    []
  );

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const allLoaded = Object.values(loadingStates).every(state => !state);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    allLoaded,
  };
};
