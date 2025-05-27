'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { useUser, useAuth } from '@clerk/nextjs';
import { LoadingSkeleton, TableSkeleton } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logger } from '@/utils/logger';

// Platform type definition
type Platform = 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK';

// Status type for influencer relationships
type InfluencerStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED';

// Define the shape of data from the API
interface ApiInfluencerData {
  id: string;
  handle: string;
  platform: Platform;
  createdAt: string;
  CampaignWizard: {
    id: string;
    name: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
  };
}

// Enhanced influencer interface for the table
interface TableInfluencer {
  id: string;
  handle: string;
  platform: Platform;
  platformDisplay: string;
  platformIcon: string;
  status: InfluencerStatus;
  addedDate: string;
  mostRecentCampaign: {
    id: string;
    name: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  totalCampaigns: number;
  isVerified: boolean;
  engagement: string;
  followerCount: string;
  avatarUrl: string | null;
}

// Constants for display formatting
const STATUS_CONFIG = {
  ACTIVE: {
    display: 'Active',
    variant: 'default' as const,
    icon: 'faCircleCheckLight',
    className: 'badge-active', // This will use green from globals.css
  },
  INACTIVE: {
    display: 'Inactive',
    variant: 'secondary' as const,
    icon: 'faCircleXmarkLight',
    className: '',
  },
  PENDING: {
    display: 'Pending',
    variant: 'outline' as const,
    icon: 'faClockLight',
    className: '',
  },
  BLOCKED: {
    display: 'Blocked',
    variant: 'destructive' as const,
    icon: 'faCircleXmarkLight',
    className: '',
  },
} as const;

const PLATFORM_CONFIG = {
  INSTAGRAM: {
    display: 'Instagram',
    icon: 'brandsInstagram',
    color: 'text-pink-600',
  },
  YOUTUBE: {
    display: 'YouTube',
    icon: 'brandsYoutube',
    color: 'text-red-600',
  },
  TIKTOK: {
    display: 'TikTok',
    icon: 'brandsTiktok',
    color: 'text-gray-900',
  },
} as const;

type SortDirection = 'ascending' | 'descending';

const InfluencerListPage: React.FC = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { orgId, isLoaded: isAuthLoaded } = useAuth();
  const [influencers, setInfluencers] = useState<TableInfluencer[]>([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [influencersPerPage, setInfluencersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableInfluencer;
    direction: SortDirection;
  } | null>(null);

  const router = useRouter();
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false);

  // Toast helper functions
  const showSuccessToast = (message: string, iconId?: string) => {
    const finalIconId = iconId || 'faFloppyDiskLight';
    const successIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-success" />;
    toast.success(message, {
      duration: 3000,
      icon: successIcon,
    });
  };

  const showErrorToast = (message: string, iconId?: string) => {
    const finalIconId = iconId || 'faTriangleExclamationLight';
    const errorIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-destructive" />;
    toast.error(message, {
      duration: 5000,
      icon: errorIcon,
    });
  };

  // Transform API data to table format
  const transformInfluencerData = (apiData: ApiInfluencerData): TableInfluencer => {
    const platformConfig = PLATFORM_CONFIG[apiData.platform];

    // Use real data from InsightIQ API response
    const realData = apiData as any; // Cast to access additional fields from enriched API response

    return {
      id: apiData.id,
      handle: apiData.handle,
      platform: apiData.platform,
      platformDisplay: platformConfig.display,
      platformIcon: platformConfig.icon,
      status: 'ACTIVE' as InfluencerStatus, // Default to active, would be determined by business logic
      addedDate: apiData.createdAt,
      mostRecentCampaign: apiData.CampaignWizard,
      totalCampaigns: 1, // This would be calculated from all campaigns this influencer has been in
      isVerified: realData.isVerified || false, // Real verification status from InsightIQ
      engagement: realData.engagementRate
        ? `${(realData.engagementRate * 100).toFixed(1)}%`
        : '0.0%', // Real engagement rate
      followerCount: realData.followersCount
        ? `${Math.round(realData.followersCount / 1000)}K`
        : '0K', // Real follower count
      avatarUrl: realData.avatarUrl || null, // Real profile image from InsightIQ
    };
  };

  const fetchInfluencers = useCallback(async () => {
    setIsLoadingData(true);
    setError('');
    try {
      const response = await fetch('/api/influencers/selected-list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorDetails = `Failed to load influencers: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.message || errorDetails;
        } catch {
          /* Ignore JSON parsing error */
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized to fetch influencers.');
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      logger.info('API Response from /api/influencers/selected-list:', data);

      if (data.success && Array.isArray(data.data)) {
        const transformedInfluencers = data.data.map(transformInfluencerData);
        setInfluencers(transformedInfluencers);
        if (data.message && data.data.length === 0) {
          setError(data.message || 'No influencers have been selected yet.');
        }
      } else {
        const errorMsg = data.error || data.message || 'Invalid data format received from server.';
        logger.error('Invalid data format or error message from API:', data);
        setError(errorMsg);
        setInfluencers([]);
      }
    } catch (err) {
      logger.error('Error fetching influencers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load influencers');
      setInfluencers([]);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isUserLoaded && isAuthLoaded) {
      if (user && orgId) {
        fetchInfluencers();
      } else if (user && !orgId) {
        setIsLoadingData(false);
        setInfluencers([]);
        setError('Please select an active organization to view influencers.');
      } else if (!user) {
        setIsLoadingData(false);
        setInfluencers([]);
      }
    }
  }, [isUserLoaded, user, isAuthLoaded, orgId, fetchInfluencers]);

  // Filter influencers based on search and filters
  const filteredInfluencers = useMemo(() => {
    if (!influencers) return [];
    return influencers.filter(influencer => {
      if (!influencer) return false;
      const matchesSearch =
        influencer.handle?.toLowerCase()?.includes(search.toLowerCase()) ?? false;
      const matchesPlatform = !platformFilter || influencer.platform === platformFilter;
      const matchesStatus = !statusFilter || influencer.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [influencers, search, platformFilter, statusFilter]);

  // Sort influencers based on the active sort configuration
  const sortedInfluencers = useMemo(() => {
    if (!filteredInfluencers || filteredInfluencers.length === 0) return [];
    if (!sortConfig) return filteredInfluencers;

    return [...filteredInfluencers].sort((a, b) => {
      if (!a || !b) return 0;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (sortConfig.key === 'addedDate') {
        const aDate = new Date(aVal as string).getTime();
        const bDate = new Date(bVal as string).getTime();
        if (isNaN(aDate) && isNaN(bDate)) return 0;
        if (isNaN(aDate)) return 1;
        if (isNaN(bDate)) return -1;
        return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredInfluencers, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedInfluencers.length / influencersPerPage);
  const startIndex = (currentPage - 1) * influencersPerPage;
  const endIndex = startIndex + influencersPerPage;
  const currentInfluencers = sortedInfluencers.slice(startIndex, endIndex);

  const requestSort = (key: keyof TableInfluencer) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleViewInfluencer = (influencer: TableInfluencer) => {
    const queryParams = new URLSearchParams();
    queryParams.append('platform', influencer.platform);
    const destinationUrl = `/influencer-marketplace/${encodeURIComponent(influencer.handle)}?${queryParams.toString()}`;
    router.push(destinationUrl);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      logger.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setPlatformFilter('');
    setStatusFilter('');
    setCurrentPage(1);
    setIsFiltersSheetOpen(false);
  };

  // Loading state
  if (!isUserLoaded || !isAuthLoaded) {
    return <LoadingSkeleton />;
  }

  // Error state for missing org
  if (user && !orgId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Icon iconId="faUsersLight" className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Organization Required</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Please select an active organization to view your influencer list, or create one in
            Settings.
          </p>
          <Button
            onClick={() => router.push('/settings/team')}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Influencers</h1>
          <p className="text-muted-foreground mt-1">Influencers you've selected for campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/influencer-marketplace')}>
            <Icon iconId="faSearchLight" className="mr-2 h-4 w-4" />
            Find More Influencers
          </Button>
          <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Icon iconId="faFilterLight" className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 md:w-96" side="right">
              <SheetHeader className="mb-6">
                <SheetTitle>Filter Influencers</SheetTitle>
                <SheetDescription>Refine the list based on your criteria.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <input
                    type="text"
                    placeholder="Search by handle..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Platform</label>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All platforms</SelectItem>
                      <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                      <SelectItem value="YOUTUBE">YouTube</SelectItem>
                      <SelectItem value="TIKTOK">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 border-t">
                  <Button onClick={handleResetFilters} variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Influencers</p>
              <p className="text-2xl font-bold">{influencers.length}</p>
            </div>
            <Icon iconId="faUsersLight" className="h-8 w-8 text-accent" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {influencers.filter(i => i.status === 'ACTIVE').length}
              </p>
            </div>
            <Icon iconId="faCircleCheckLight" className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold text-blue-600">
                {influencers.filter(i => i.isVerified).length}
              </p>
            </div>
            <Icon iconId="faShieldLight" className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Engagement</p>
              <p className="text-2xl font-bold text-accent">
                {influencers.length > 0
                  ? `${(influencers.reduce((acc, i) => acc + parseFloat(i.engagement), 0) / influencers.length).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
            <Icon iconId="faChartLineLight" className="h-8 w-8 text-accent" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoadingData ? (
        <TableSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Icon iconId="faUsersLight" className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Influencers Found</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {error ||
              "You haven't selected any influencers yet. Start by finding influencers for your campaigns."}
          </p>
          <Button
            onClick={() => router.push('/influencer-marketplace')}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            <Icon iconId="faSearchLight" className="mr-2 h-4 w-4" />
            Find Influencers
          </Button>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedInfluencers.length)} of{' '}
              {sortedInfluencers.length} influencer{sortedInfluencers.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={influencersPerPage.toString()}
                onValueChange={value => {
                  setInfluencersPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead
                    className="cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => requestSort('handle')}
                  >
                    <div className="flex items-center gap-2">
                      Influencer
                      {sortConfig?.key === 'handle' && (
                        <Icon
                          iconId={
                            sortConfig.direction === 'ascending'
                              ? 'faArrowUpLight'
                              : 'faArrowDownLight'
                          }
                          className="h-3 w-3"
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => requestSort('platform')}
                  >
                    <div className="flex items-center gap-2">
                      Platform
                      {sortConfig?.key === 'platform' && (
                        <Icon
                          iconId={
                            sortConfig.direction === 'ascending'
                              ? 'faArrowUpLight'
                              : 'faArrowDownLight'
                          }
                          className="h-3 w-3"
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => requestSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortConfig?.key === 'status' && (
                        <Icon
                          iconId={
                            sortConfig.direction === 'ascending'
                              ? 'faArrowUpLight'
                              : 'faArrowDownLight'
                          }
                          className="h-3 w-3"
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Most Recent Campaign</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => requestSort('addedDate')}
                  >
                    <div className="flex items-center gap-2">
                      Added
                      {sortConfig?.key === 'addedDate' && (
                        <Icon
                          iconId={
                            sortConfig.direction === 'ascending'
                              ? 'faArrowUpLight'
                              : 'faArrowDownLight'
                          }
                          className="h-3 w-3"
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInfluencers.map(influencer => {
                  const statusConfig = STATUS_CONFIG[influencer.status];
                  const platformConfig = PLATFORM_CONFIG[influencer.platform];

                  return (
                    <TableRow key={influencer.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={influencer.avatarUrl || undefined}
                              alt={influencer.handle}
                            />
                            <AvatarFallback>
                              {influencer.handle.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">@{influencer.handle}</span>
                              {influencer.isVerified && (
                                <Icon
                                  iconId="faCircleCheckSolid"
                                  className="h-4 w-4 text-blue-500"
                                />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {influencer.followerCount} followers
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon
                            iconId={platformConfig.icon}
                            className={`h-4 w-4 ${platformConfig.color}`}
                          />
                          <span className="text-sm">{platformConfig.display}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusConfig.variant}
                          className={`gap-1 ${statusConfig.className}`}
                        >
                          <Icon iconId={statusConfig.icon} className="h-3 w-3" />
                          {statusConfig.display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {influencer.mostRecentCampaign ? (
                          <div>
                            <Link
                              href={`/campaigns/${influencer.mostRecentCampaign.id}`}
                              className="font-medium text-accent hover:underline"
                            >
                              {influencer.mostRecentCampaign.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {influencer.mostRecentCampaign.status} •{' '}
                              {formatDate(influencer.mostRecentCampaign.startDate || '')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No campaigns</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(influencer.addedDate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButtonAction
                            iconBaseName="faEye"
                            hoverColorClass="text-accent"
                            ariaLabel="View Profile"
                            onClick={() => handleViewInfluencer(influencer)}
                            className="h-8 w-8"
                          />
                          <IconButtonAction
                            iconBaseName="faCommentDots"
                            hoverColorClass="text-accent"
                            ariaLabel="Contact"
                            onClick={() => {
                              // Would implement contact functionality
                              showSuccessToast('Contact feature coming soon!');
                            }}
                            className="h-8 w-8"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <Icon iconId="faArrowLeftLight" className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <Icon iconId="faArrowRightLight" className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InfluencerListPage;
