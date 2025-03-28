
// Semi-static content - longer cache time
export const revalidate = 3600; // Revalidate every hour
export const fetchCache = 'force-cache'; // Use cache but revalidate according to the revalidate option

// Data fetching optimization
export const dynamic = 'force-dynamic'; // Force dynamic rendering
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Icon, ButtonIcon, StaticIcon } from '@/components/ui/icons';
import { CustomTabs, CustomTabList, CustomTab, CustomTabPanels, CustomTabPanel } from '@/components/ui/custom-tabs';
import MarketplaceList from '@/components/features/campaigns/influencers/MarketplaceList';
import AdvancedSearch from '@/components/features/campaigns/influencers/AdvancedSearch';
import { mockInfluencerService } from '@/services/influencer/mock-service';
import { Influencer, InfluencerFilters } from '@/types/influencer';

export default function InfluencerMarketplace() {
  const router = useRouter();
  
  // State for influencers and UI
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<InfluencerFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Pagination constants
  const itemsPerPage = 9;
  const totalPages = Math.ceil(influencers.length / itemsPerPage);
  
  // Load influencers based on filters and search query
  const loadInfluencers = async (query = searchQuery, filterOptions = filters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data;
      if (query) {
        data = await mockInfluencerService.searchInfluencers(query, filterOptions);
      } else {
        data = await mockInfluencerService.getInfluencers(filterOptions);
      }
      
      setInfluencers(data);
      setCurrentPage(1); // Reset to first page on new search
    } catch (err) {
      console.error('Error loading influencers:', err);
      setError('Failed to load influencers');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadInfluencers();
  }, []);
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInfluencers(searchQuery, filters);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: InfluencerFilters) => {
    setFilters(newFilters);
    loadInfluencers(searchQuery, newFilters);
  };
  
  // Handle influencer selection
  const handleInfluencerSelect = (influencer: Influencer) => {
    router.push(`/influencer-marketplace/${influencer.id}`);
  };
  
  // Get current page of influencers
  const getCurrentPageInfluencers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return influencers.slice(startIndex, endIndex);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#333333]">Influencer Marketplace</h1>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode('grid')}
              className={`group ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <ButtonIcon name="faGripLight" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode('list')}
              className={`group ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <ButtonIcon name="faListLight" />
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <form onSubmit={handleSearchSubmit} className="flex">
              <Input
                type="text"
                placeholder="Search influencers by name, platform, or niche..."
                className="flex-1 border-[#D1D5DB] focus:border-[#3182CE] focus:ring-[#3182CE]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="ml-2 group">
                <ButtonIcon name="faSearchLight" className="mr-2" />
                Search
              </Button>
            </form>
          </div>
          
          <div className="w-full md:w-1/3 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="w-full md:w-auto group"
            >
              <ButtonIcon name="faFilterLight" className="mr-2" />
              {showAdvancedSearch ? 'Hide Filters' : 'Advanced Filters'}
            </Button>
          </div>
        </div>
        
        {/* Advanced Search (conditionally shown) */}
        {showAdvancedSearch && (
          <Card className="p-4 border-[#D1D5DB]">
            <AdvancedSearch
              initialFilters={filters}
              onSubmit={handleFilterChange}
            />
          </Card>
        )}
        
        {/* Influencer List */}
        <div>
          <MarketplaceList
            influencers={getCurrentPageInfluencers()}
            isLoading={isLoading}
            error={error}
            viewMode={viewMode}
            onInfluencerSelect={handleInfluencerSelect}
          />
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && !error && influencers.length > 0 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                disabled={currentPage === 1}
                className="group"
              >
                <ButtonIcon name="faChevronLeftLight" />
              </Button>
              
              {Array.from({ length: totalPages }).map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(index + 1)}
                  className="group"
                >
                  {index + 1}
                </Button>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="group"
              >
                <ButtonIcon name="faChevronRightLight" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Educational Section */}
        <Card className="mt-8 border-[#D1D5DB]">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-[#333333]">Understanding Influencer Metrics</h2>
            
            <CustomTabs>
              <CustomTabList>
                <CustomTab>Justify Score</CustomTab>
                <CustomTab>Influencer Tiers</CustomTab>
                <CustomTab>Brand Safety</CustomTab>
              </CustomTabList>
              
              <CustomTabPanels>
                <CustomTabPanel>
                  <div className="py-4">
                    <p className="mb-4 text-[#333333]">
                      The Justify Score is our proprietary scoring system that evaluates influencers based on multiple factors:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-[#4A5568]">
                      <li>Audience authenticity and engagement quality</li>
                      <li>Content relevance and performance</li>
                      <li>Brand safety and compliance history</li>
                      <li>Overall value and ROI potential</li>
                    </ul>
                    <p className="mt-4 text-sm text-[#4A5568]">
                      Scores range from 0-100, with higher scores indicating better performance and potential value.
                    </p>
                  </div>
                </CustomTabPanel>
                
                <CustomTabPanel>
                  <div className="py-4">
                    <p className="mb-4 text-[#333333]">
                      We categorize influencers into three tiers based on their overall quality and performance:
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">Gold</div>
                        <div className="ml-3 text-[#4A5568]">
                          <p>Top-performing influencers with exceptional engagement, authentic audiences, and consistent results.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="px-2 py-1 rounded bg-gray-100 text-gray-800 font-medium">Silver</div>
                        <div className="ml-3 text-[#4A5568]">
                          <p>Strong performers with good metrics and proven success in brand partnerships.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-medium">Bronze</div>
                        <div className="ml-3 text-[#4A5568]">
                          <p>Solid influencers who meet our quality standards but may have more limited reach or specific niches.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CustomTabPanel>
                
                <CustomTabPanel>
                  <div className="py-4">
                    <p className="mb-4 text-[#333333]">
                      Brand safety is critical when selecting influencers. Our platform evaluates:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-[#4A5568]">
                      <li>Content policy compliance and moderation</li>
                      <li>Disclosure practices for sponsored content</li>
                      <li>Authenticity verification and audience quality</li>
                      <li>Historical performance and brand alignment</li>
                    </ul>
                    <p className="mt-4 text-sm text-[#4A5568]">
                      Our risk scoring system helps you identify influencers with the right safety profile for your brand.
                    </p>
                  </div>
                </CustomTabPanel>
              </CustomTabPanels>
            </CustomTabs>
          </div>
        </Card>
      </div>
    </div>
  );
} 