'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { InfluencerProfileData } from '@/types/influencer';

interface ContentAnalyticsSectionProps {
  influencer: InfluencerProfileData;
}

// Type definitions for InsightIQ content data
interface ContentEngagement {
  like_count?: number;
  comment_count?: number;
  view_count?: number;
}

interface Content {
  type?: string;
  published_at?: string;
  description?: string;
  thumbnail_url?: string;
  url?: string;
  engagement?: ContentEngagement;
}

interface Hashtag {
  name: string;
}

interface Mention {
  name: string;
}

interface EngagementRateHistogram {
  engagement_rate_band?: {
    min: number;
    max: number;
  };
  count?: number;
}

interface InsightIQContentData {
  content?: {
    contentCount?: number;
    topContents?: Content[];
    recentContents?: Content[];
    sponsoredContents?: Content[];
    topHashtags?: Hashtag[];
    topMentions?: Mention[];
    sponsoredPostsPerformance?: number;
  };
  engagement?: {
    averageLikes?: number;
    averageComments?: number;
    averageViews?: number;
    engagementRateHistogram?: EngagementRateHistogram[];
  };
}

const ContentAnalyticsSection: React.FC<ContentAnalyticsSectionProps> = ({ influencer }) => {
  // Extract comprehensive InsightIQ content data with proper typing
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: InsightIQContentData })
    .insightiq;
  const contentData = insightiq?.content;
  const engagementData = insightiq?.engagement;

  // Content performance metrics
  const topContents = contentData?.topContents || [];
  const recentContents = contentData?.recentContents || [];
  const sponsoredContents = contentData?.sponsoredContents || [];
  const topHashtags = contentData?.topHashtags || [];
  const topMentions = contentData?.topMentions || [];
  const engagementHistogram = engagementData?.engagementRateHistogram || [];
  const sponsoredPerformance = contentData?.sponsoredPostsPerformance;

  // Content Overview Card
  const ContentOverviewCard = () => (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faChartBarLight" className="h-5 w-5 text-accent" />
          Content Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{contentData?.contentCount || 0}</div>
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {engagementData?.averageLikes?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Likes</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {engagementData?.averageComments?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Comments</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {engagementData?.averageViews
                ? `${(engagementData.averageViews / 1000).toFixed(0)}K`
                : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Views</div>
          </div>
        </div>

        {sponsoredPerformance && (
          <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-warning">
                Sponsored vs Organic Performance
              </span>
              <Badge variant={sponsoredPerformance > 1 ? 'default' : 'secondary'}>
                {sponsoredPerformance > 1 ? '+' : ''}
                {((sponsoredPerformance - 1) * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {sponsoredPerformance > 1
                ? 'Sponsored content performs better than organic'
                : 'Organic content performs better than sponsored'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Top Performing Content Card
  const TopContentCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faFireLight" className="h-5 w-5 text-destructive" />
          Top Performing Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topContents.length > 0 ? (
          topContents.slice(0, 5).map((content: Content, index: number) => (
            <div key={index} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {content.type || 'POST'}
                    </Badge>
                    {content.published_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(content.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-2">
                    {content.description || 'No description available'}
                  </p>
                </div>
                {content.thumbnail_url && (
                  <div className="ml-3 w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={content.thumbnail_url}
                      alt="Content thumbnail"
                      width={64}
                      height={64}
                      className="object-cover"
                      onError={() => {
                        // Handle error silently
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Icon iconId="faHeartLight" className="h-3 w-3 text-destructive" />
                  <span>{content.engagement?.like_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon iconId="faCommentLight" className="h-3 w-3 text-interactive" />
                  <span>{content.engagement?.comment_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon iconId="faEyeLight" className="h-3 w-3 text-warning" />
                  <span>{content.engagement?.view_count?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>

              {content.url && (
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  <Icon iconId="faExternalLinkLight" className="h-3 w-3 mr-1" />
                  View Content
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Icon
              iconId="faFileImageLight"
              className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">No top content data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Recent Content Activity Card
  const RecentContentCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faClockLight" className="h-5 w-5 text-interactive" />
          Recent Content Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentContents.length > 0 ? (
          recentContents.slice(0, 4).map((content: Content, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border border-border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {content.type || 'POST'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {content.published_at
                        ? new Date(content.published_at).toLocaleDateString()
                        : 'Recent'}
                    </span>
                  </div>
                  <p className="text-sm truncate">
                    {content.description || 'Recent content activity'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {content.engagement?.like_count
                  ? `${content.engagement.like_count.toLocaleString()} likes`
                  : ''}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Icon iconId="faClockLight" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent content data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Sponsored Content Analysis Card
  const SponsoredContentCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faBullhornLight" className="h-5 w-5 text-warning" />
          Sponsored Content Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sponsoredContents.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground mb-3">
              {sponsoredContents.length} sponsored posts identified
            </div>
            {sponsoredContents.slice(0, 3).map((content: Content, index: number) => (
              <div key={index} className="border border-warning/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-warning/10 text-warning border-warning/20">Sponsored</Badge>
                  <span className="text-xs text-muted-foreground">
                    {content.published_at
                      ? new Date(content.published_at).toLocaleDateString()
                      : 'Date N/A'}
                  </span>
                </div>
                <p className="text-sm line-clamp-2">{content.description || 'Sponsored content'}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span>{content.engagement?.like_count?.toLocaleString() || 0} likes</span>
                  <span>{content.engagement?.comment_count?.toLocaleString() || 0} comments</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-6">
            <Icon iconId="faBullhornLight" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No sponsored content detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Hashtags and Mentions Analysis
  const HashtagsMentionsCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faHashtagLight" className="h-5 w-5 text-accent" />
          Content Strategy Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Hashtags */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Most Used Hashtags</div>
          {topHashtags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topHashtags.slice(0, 10).map((hashtag: Hashtag, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{hashtag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hashtag data available</p>
          )}
        </div>

        <Separator />

        {/* Top Mentions */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Frequently Mentioned Accounts</div>
          {topMentions.length > 0 ? (
            <div className="space-y-2">
              {topMentions.slice(0, 5).map((mention: Mention, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Icon iconId="faAtLight" className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">@{mention.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No mention data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Engagement Distribution Analysis
  const EngagementDistributionCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faChartAreaLight" className="h-5 w-5 text-success" />
          Engagement Distribution Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {engagementHistogram.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Distribution of engagement rates across content
            </div>
            {engagementHistogram.map((band: EngagementRateHistogram, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>
                    {band.engagement_rate_band?.min}% - {band.engagement_rate_band?.max}%
                  </span>
                  <span className="font-medium">{band.count || 0} posts</span>
                </div>
                <Progress
                  value={((band.count || 0) / (contentData?.contentCount || 1)) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Icon
              iconId="faChartAreaLight"
              className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Engagement distribution data not available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!contentData && !engagementData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Icon
              iconId="faFileImageLight"
              className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Comprehensive content analytics will be available here once InsightIQ data is fully
              processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Overview */}
      <ContentOverviewCard />

      {/* Main Content Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TopContentCard />
          <SponsoredContentCard />
        </div>

        <div className="space-y-6">
          <RecentContentCard />
          <HashtagsMentionsCard />
        </div>
      </div>

      {/* Full Width Engagement Analysis */}
      <EngagementDistributionCard />
    </div>
  );
};

export default ContentAnalyticsSection;
