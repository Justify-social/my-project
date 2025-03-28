"use client";

import React, { useState, useEffect } from "react";
import HTMLInputElement from '../../../../../../components/ui/radio/types/index';
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/forms/form-controls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {  Card  } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Icon } from '@/components/ui/icons';
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { mockInfluencerService } from "@/services/influencer/mock-service";
import { Influencer } from "@/types/influencer";
import Link from "next/link";
import { formatFollowerCount } from "@/utils/string/utils";

interface SelectedInfluencer {
  influencer: Influencer;
  budget: number;
  notes: string;
}

export default function CampaignInfluencersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [selectedInfluencers, setSelectedInfluencers] = useState<SelectedInfluencer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState("");
  
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 4;

  // Load influencers on mount
  useEffect(() => {
    const loadInfluencers = async () => {
      setIsLoading(true);
      try {
        const data = await mockInfluencerService.getInfluencers();
        setInfluencers(data);
        setFilteredInfluencers(data);
      } catch (error) {
        console.error("Error loading influencers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInfluencers();
  }, []);

  // Filter influencers based on search term and filters
  useEffect(() => {
    setIsSearching(true);
    
    const filtered = influencers.filter((influencer) => {
      // Text search
      const searchMatch = !searchTerm || 
        influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.bio.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Platform filter
      const platformMatch = !platformFilter || influencer.platform === platformFilter;
      
      // Tier filter
      const tierMatch = !tierFilter || influencer.tier === tierFilter;
      
      // Min score filter
      const scoreMatch = !minScoreFilter || 
        influencer.justifyMetrics.justifyScore >= parseInt(minScoreFilter);
      
      return searchMatch && platformMatch && tierMatch && scoreMatch;
    });
    
    setFilteredInfluencers(filtered);
    setIsSearching(false);
  }, [searchTerm, platformFilter, tierFilter, minScoreFilter, influencers]);

  // Handle selecting an influencer
  const handleSelectInfluencer = (influencer: Influencer) => {
    if (selectedInfluencers.some(item => item.influencer.id === influencer.id)) {
      return; // Already selected
    }
    
    setSelectedInfluencers(prev => [
      ...prev,
      {
        influencer,
        budget: 0,
        notes: ""
      }
    ]);
  };

  // Handle removing an influencer
  const handleRemoveInfluencer = (id: string) => {
    setSelectedInfluencers(prev => prev.filter(item => item.influencer.id !== id));
  };

  // Handle budget change
  const handleBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const value = e.target.value;
    const budget = value === "" ? 0 : parseInt(value);
    
    if (!isNaN(budget)) {
      setSelectedInfluencers(prev => 
        prev.map(item => 
          item.influencer.id === id 
            ? { ...item, budget } 
            : item
        )
      );
    }
  };

  // Handle notes change
  const handleNotesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const notes = e.target.value;
    
    setSelectedInfluencers(prev => 
      prev.map(item => 
        item.influencer.id === id 
          ? { ...item, notes } 
          : item
      )
    );
  };

  // Next step handler
  const handleNextStep = async () => {
    // Validate at least one selected influencer
    if (selectedInfluencers.length === 0) {
      alert("Please select at least one influencer for your campaign");
      return;
    }

    setIsLoading(true);
    try {
      // For prototype, we're just moving to the next step
      // In a real implementation, we would save the selections to an API
      router.push("/influencer-marketplace/campaigns/create/review");
    } catch (error) {
      console.error("Error saving influencer selections: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Back to previous step
  const handlePreviousStep = () => {
    router.push("/influencer-marketplace/campaigns/create/content");
  };

  // Calculate total budget allocated
  const totalBudget = selectedInfluencers.reduce(
    (sum, item) => sum + item.budget, 
    0
  );

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/influencer-marketplace/campaigns" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Icon name="faArrowLeft" className="mr-2 w-4 h-4" solid={false} />
            Back to Campaigns
          </Link>
        </div>
        <h1 className="text-2xl font-bold font-sora mb-2">Create New Campaign</h1>
        <p className="text-gray-600 font-work-sans">
          Step 3: Select influencers for your campaign
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                  idx + 1 === currentStep
                    ? "bg-blue-600 text-white"
                    : idx + 1 < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {idx + 1 < currentStep ? (
                  <Icon name="faCheck" solid={false} />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < totalSteps - 1 && (
                <div
                  className={`h-1 w-16 sm:w-24 md:w-32 ${
                    idx + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-3xl mt-2 text-sm font-work-sans">
          <div className="text-center">Basic Info</div>
          <div className="text-center">Content</div>
          <div className="text-center">Influencers</div>
          <div className="text-center">Review</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and filters */}
        <div className="lg:col-span-1">
          <Card className="p-6 mb-6 sticky top-6 font-work-sans">
            <h2 className="text-xl font-bold mb-4 font-sora">Find Influencers</h2>
            
            <FormField
              label="Search"
              id="search"
              helperText="Search by name, username, or bio"
              startIcon={<Icon name="faSearch" className="h-5 w-5 text-gray-400" solid={false} />}
            >
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search influencers..."
              />
            </FormField>
            
            <h3 className="font-medium text-lg mt-4 mb-2 font-sora">Filters</h3>
            
            <FormField
              label="Platform"
              id="platform"
              helperText="Filter by social media platform"
            >
              <Select
                id="platform"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitter">Twitter</option>
              </Select>
            </FormField>
            
            <FormField
              label="Tier"
              id="tier"
              helperText="Filter by influencer tier"
            >
              <Select
                id="tier"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <option value="">All Tiers</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
              </Select>
            </FormField>
            
            <FormField
              label="Minimum Justify Score"
              id="min-score"
              helperText="Filter by minimum score"
            >
              <Select
                id="min-score"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(e.target.value)}
              >
                <option value="">Any Score</option>
                <option value="90">90+</option>
                <option value="80">80+</option>
                <option value="70">70+</option>
                <option value="60">60+</option>
              </Select>
            </FormField>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                {filteredInfluencers.length} influencers found
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setPlatformFilter("");
                  setTierFilter("");
                  setMinScoreFilter("");
                }}
                leftIcon={<Icon name="faFilterCircleXmark" className="h-4 w-4" solid={false} />}
                className="text-sm"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {/* Selected influencers */}
          {selectedInfluencers.length > 0 && (
            <Card className="p-6 mb-6 font-work-sans">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold font-sora">Selected Influencers</h2>
                <p className="text-gray-600">
                  Total Budget: <span className="font-medium">${totalBudget.toLocaleString()}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                {selectedInfluencers.map((item) => (
                  <div 
                    key={item.influencer.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-wrap md:flex-nowrap items-start gap-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.influencer.avatar}
                          alt={item.influencer.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.influencer.name}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {item.influencer.username}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.influencer.platform}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              item.influencer.tier === 'Gold' 
                                ? 'bg-yellow-50 text-yellow-800 border-yellow-300' 
                                : item.influencer.tier === 'Silver'
                                ? 'bg-gray-50 text-gray-800 border-gray-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {item.influencer.tier}
                          </Badge>
                          <div className="text-xs flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                            <Icon name="faChartLine" className="w-3 h-3 mr-1" solid={false} />
                            Score: {item.influencer.justifyMetrics.justifyScore}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <FormField
                            label="Budget Allocation ($)"
                            id={`budget-${item.influencer.id}`}
                            helperText="Amount allocated to this influencer"
                          >
                            <Input
                              id={`budget-${item.influencer.id}`}
                              type="number"
                              value={item.budget || ""}
                              onChange={(e) => handleBudgetChange(e, item.influencer.id)}
                              placeholder="0"
                              min="0"
                            />
                          </FormField>
                          
                          <FormField
                            label="Notes"
                            id={`notes-${item.influencer.id}`}
                            helperText="Special instructions or notes"
                          >
                            <Input
                              id={`notes-${item.influencer.id}`}
                              value={item.notes}
                              onChange={(e) => handleNotesChange(e, item.influencer.id)}
                              placeholder="Add notes..."
                            />
                          </FormField>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveInfluencer(item.influencer.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label={`Remove ${item.influencer.name}`}
                      >
                        <Icon name="faCircleXmark" className="w-5 h-5" solid={false} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Influencer results */}
          <Card className="p-6 mb-6 font-work-sans">
            <h2 className="text-xl font-bold mb-4 font-sora">
              Available Influencers
            </h2>
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading influencers...</p>
              </div>
            ) : filteredInfluencers.length === 0 ? (
              <div className="text-center py-10">
                <Icon name="faSearch" className="h-10 w-10 text-gray-400 mx-auto mb-3" solid={false} />
                <p className="text-gray-600 mb-1">No influencers found matching your criteria.</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInfluencers.map((influencer) => {
                  const isSelected = selectedInfluencers.some(
                    item => item.influencer.id === influencer.id
                  );
                  
                  return (
                    <div 
                      key={influencer.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Image
                          src={influencer.avatar}
                          alt={influencer.name}
                          width={56}
                          height={56}
                          className="rounded-full object-cover"
                        />
                        
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {influencer.name}
                            </h3>
                            <span className="text-gray-500">
                              {influencer.username}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {influencer.platform}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                influencer.tier === 'Gold' 
                                  ? 'bg-yellow-50 text-yellow-800 border-yellow-300' 
                                  : influencer.tier === 'Silver'
                                  ? 'bg-gray-50 text-gray-800 border-gray-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {influencer.tier}
                            </Badge>
                            <div className="text-xs flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                              <Icon name="faChartLine" className="w-3 h-3 mr-1" solid={false} />
                              Score: {influencer.justifyMetrics.justifyScore}
                            </div>
                            <div className="text-xs flex items-center px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                              <Icon name="faUser" className="w-3 h-3 mr-1" solid={false} />
                              {formatFollowerCount(influencer.followers)}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {influencer.bio}
                          </p>
                        </div>
                        
                        <Button
                          variant={isSelected ? "outline" : "primary"}
                          size="sm"
                          onClick={() => {
                            if (!isSelected) handleSelectInfluencer(influencer);
                          }}
                          disabled={isSelected}
                          className={isSelected ? "cursor-default" : ""}
                        >
                          {isSelected ? (
                            <span className="flex items-center">
                              <Icon name="faCheck" className="w-4 h-4 mr-1" solid={false} />
                              Selected
                            </span>
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          leftIcon={<Icon name="faArrowLeft" solid={false} />}
          disabled={isLoading}
        >
          Back: Content Requirements
        </Button>
        <Button
          onClick={handleNextStep}
          rightIcon={<Icon name="faArrowRight" solid={false} />}
          loading={isLoading}
        >
          Next: Review & Launch
        </Button>
      </div>
    </div>
  );
} 