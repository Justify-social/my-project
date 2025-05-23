'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ContentAnalyticsSectionProps {
  influencer: InfluencerProfileData;
}

// Helper function to format large numbers
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

// Helper function to format percentages
const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(1)}%`;
};

export function ContentAnalyticsSection({ influencer }: ContentAnalyticsSectionProps) {
  // Extract actual content data from InsightIQ API response if available
  const profileData = (influencer as any).profile || (influencer as any).insightiq?.profile;
  const contentData = (influencer as any).content || (influencer as any).insightiq?.content;

  // Use available data from the influencer object
  const averageViews = influencer.engagementMetrics?.averageViews;
  const contentCount = profileData?.content_count;
  const sponsoredPostsPerformance = profileData?.sponsored_posts_performance;
  const hiddenLikesPercentage = profileData?.posts_hidden_likes_percentage_value;
  const averageReelsViews = profileData?.average_reels_views;

  // Extract content collections from API
  const topContents = contentData?.top_contents || profileData?.top_contents;
  const recentContents = contentData?.recent_contents || profileData?.recent_contents;
  const topHashtags = profileData?.top_hashtags;
  const topMentions = profileData?.top_mentions;

  // If no content analytics are available, show informative message
  if (!profileData && !contentData && !averageViews && !contentCount) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Icon iconId="faVideoLight" className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Content Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Advanced content analytics from InsightIQ are not available in sandbox mode.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This section will show top performing content, hashtag analysis, content performance
                metrics, and sponsored content insights when connected to production InsightIQ API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon iconId="faFileLight" className="h-4 w-4 text-primary" />
              Total Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-interactive">{formatNumber(contentCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Posts published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon iconId="faEyeLight" className="h-4 w-4 text-primary" />
              Avg. Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatNumber(averageViews || averageReelsViews)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per post</p>
          </CardContent>
        </Card>

        {sponsoredPostsPerformance && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon iconId="faChartLineLight" className="h-4 w-4 text-primary" />
                Sponsored Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {sponsoredPostsPerformance.toFixed(1)}x
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs organic posts</p>
            </CardContent>
          </Card>
        )}

        {hiddenLikesPercentage && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon iconId="faEyeSlashLight" className="h-4 w-4 text-primary" />
                Hidden Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {formatPercentage(hiddenLikesPercentage)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Of posts</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hashtags & Mentions */}
      {(topHashtags || topMentions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topHashtags && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faTagLight" className="h-5 w-5 text-primary" />
                  Top Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topHashtags.slice(0, 10).map((hashtag: any, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-interactive hover:bg-interactive/10"
                    >
                      {hashtag.name || hashtag.hashtag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {topMentions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faUserLight" className="h-5 w-5 text-primary" />
                  Top Mentions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topMentions.slice(0, 10).map((mention: any, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-success hover:bg-success/10"
                    >
                      {mention.name || mention.mention}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Performing Content */}
      {topContents && topContents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon iconId="faTrophyLight" className="h-5 w-5 text-primary" />
              Top Performing Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topContents.slice(0, 4).map((content: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={content.thumbnail_url} alt="Content thumbnail" />
                      <AvatarFallback>
                        <Icon iconId="faImageLight" className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {content.type || 'POST'}
                        </Badge>
                        {content.published_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(content.published_at), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-2 mb-2">
                        {content.description || content.caption || 'Content'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {content.engagement?.like_count && (
                          <span className="flex items-center gap-1">
                            <Icon iconId="faHeartLight" className="h-3 w-3" />
                            {formatNumber(content.engagement.like_count)}
                          </span>
                        )}
                        {content.engagement?.comment_count && (
                          <span className="flex items-center gap-1">
                            <Icon iconId="faCommentLight" className="h-3 w-3" />
                            {formatNumber(content.engagement.comment_count)}
                          </span>
                        )}
                        {content.engagement?.view_count && (
                          <span className="flex items-center gap-1">
                            <Icon iconId="faEyeLight" className="h-3 w-3" />
                            {formatNumber(content.engagement.view_count)}
                          </span>
                        )}
                      </div>
                    </div>
                    {content.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={content.url} target="_blank" rel="noopener noreferrer">
                          <Icon iconId="faArrowRightLight" className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Content */}
      {recentContents && recentContents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon iconId="faClockLight" className="h-5 w-5 text-primary" />
              Recent Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContents.slice(0, 5).map((content: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={content.thumbnail_url} alt="Content thumbnail" />
                    <AvatarFallback>
                      <Icon iconId="faImageLight" className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {content.type || 'POST'}
                      </Badge>
                      {content.published_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(content.published_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">
                      {content.description || content.caption || 'Content'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {content.engagement?.like_count && (
                      <span className="flex items-center gap-1">
                        <Icon iconId="faHeartLight" className="h-3 w-3" />
                        {formatNumber(content.engagement.like_count)}
                      </span>
                    )}
                    {content.engagement?.comment_count && (
                      <span className="flex items-center gap-1">
                        <Icon iconId="faCommentLight" className="h-3 w-3" />
                        {formatNumber(content.engagement.comment_count)}
                      </span>
                    )}
                  </div>
                  {content.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={content.url} target="_blank" rel="noopener noreferrer">
                        <Icon iconId="faArrowRightLight" className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
