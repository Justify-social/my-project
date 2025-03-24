////////////////////////////////////
// src/app/influencers/marketplace/page.tsx
////////////////////////////////////
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import InfluencerCard from "../../../components/Influencers/InfluencerCard";
import FilterPanel from "../../../components/Influencers/FilterPanel";
import { Influencer } from "../../../types/influencer";

// ---------------------------
// Custom Debounce Hook
// ---------------------------
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ---------------------------
// Error Boundary Component
// ---------------------------
class ErrorBoundary extends React.Component<
  {children: React.ReactNode;},
  {hasError: boolean;}>
{
  constructor(props: {children: React.ReactNode;}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600 font-work-sans" role="alert">
          Oops! Something went wrong. Please try again later.
        </div>);

    }
    return this.props.children;
  }
}

// ---------------------------
// Spinner Component
// ---------------------------
const Spinner: React.FC = () =>
<div className="flex justify-center items-center py-10 font-work-sans" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 font-work-sans"></div>
    <span className="sr-only font-work-sans">Loading...</span>
  </div>;


// ---------------------------
// API Response & Dummy Data
// ---------------------------
interface MarketplaceResponse {
  influencers: Influencer[];
  total: number;
}
const ITEMS_PER_PAGE = 12;

const dummyInfluencers: Influencer[] = [
{
  id: "dummy-1",
  name: "Olivia Bennett",
  bio: "Lifestyle & Travel influencer with a highly engaged audience.",
  avatar: "/profile-image.svg",
  dynamicScore: 92,
  tier: "Platinum",
  platform: "Instagram",
  featuredCampaignImage: "/images/campaigns/campaign1.jpg"
},
{
  id: "dummy-2",
  name: "John Smith",
  bio: "Tech reviewer and gadget enthusiast.",
  avatar: "/profile-image.svg",
  dynamicScore: 80,
  tier: "Silver",
  platform: "YouTube",
  featuredCampaignImage: "/images/campaigns/campaign2.jpg"
}];


// Local filter & sort for dummy data
function localFilterAndSort(
data: Influencer[],
f: {platform: string;tier: string;sortBy: string;})
{
  let filtered = data;
  if (f.platform) {
    filtered = filtered.filter(
      (inf) => inf.platform.toLowerCase() === f.platform.toLowerCase()
    );
  }
  if (f.tier) {
    filtered = filtered.filter(
      (inf) => inf.tier.toLowerCase() === f.tier.toLowerCase()
    );
  }
  switch (f.sortBy) {
    case "score-desc":
      filtered = filtered.sort((a, b) => b.dynamicScore - a.dynamicScore);
      break;
    case "score-asc":
      filtered = filtered.sort((a, b) => a.dynamicScore - b.dynamicScore);
      break;
    case "name-asc":
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }
  return filtered;
}

// ---------------------------
// Influencer Marketplace Page
// ---------------------------
const InfluencerMarketplacePage: React.FC = () => {
  const router = useRouter();

  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{platform: string;tier: string;sortBy: string;}>({
    platform: "",
    tier: "",
    sortBy: ""
  });
  const [page, setPage] = useState<number>(1);

  const debouncedFilters = useDebounce(filters, 300);
  const debouncedPage = useDebounce(page, 300);

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<MarketplaceResponse>("/api/influencers/marketplace", {
        params: {
          page: debouncedPage,
          itemsPerPage: ITEMS_PER_PAGE,
          platform: debouncedFilters.platform,
          tier: debouncedFilters.tier,
          sortBy: debouncedFilters.sortBy
        }
      });
      setInfluencers(response.data.influencers);
      setTotal(response.data.total);
    } catch (err) {
      const axiosErr = err as AxiosError;
      console.error("Error fetching influencers:", axiosErr);
      if (axiosErr.response && axiosErr.response.status === 404) {
        console.warn("API not found. Using dummy data...");
        const sorted = localFilterAndSort(dummyInfluencers, debouncedFilters);
        setInfluencers(sorted);
        setTotal(sorted.length);
      } else {
        setError("Unable to load influencers. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, debouncedPage]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const handleFilterChange = (newFilters: {platform: string;tier: string;sortBy: string;}) => {
    setFilters(newFilters);
    setPage(1);
  };
  const handleCardClick = (influencerId: string) => {
    router.push(`/influencers/marketplace/${influencerId}`);
  };
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-work-sans">
        <h1 className="text-3xl font-bold font-sora">Influencer Marketplace</h1>
        <div className="bg-white shadow p-4 rounded font-work-sans">
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} showSorting />
        </div>
        {loading ?
        <Spinner /> :
        error ?
        <div className="p-4 text-red-600 font-work-sans" role="alert">{error}</div> :
        influencers.length === 0 ?
        <div className="p-4 font-work-sans">No influencers found matching your criteria.</div> :

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 font-work-sans">
            {influencers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((inf) =>
          <div
            key={inf.id}
            onClick={() => handleCardClick(inf.id)}
            className="cursor-pointer bg-white shadow p-4 rounded hover:shadow-lg transition font-work-sans"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCardClick(inf.id);
            }}
            aria-label={`View details for ${inf.name}`}>

                <InfluencerCard influencer={inf} />
              </div>
          )}
          </div>
        }
        <div className="flex flex-col sm:flex-row items-center justify-between font-work-sans">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 font-work-sans"
            aria-label="Previous page">

            Previous
          </button>
          <div className="my-2 sm:my-0 font-work-sans" aria-live="polite">
            Page {page} of {totalPages || 1}
          </div>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages || 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 font-work-sans"
            aria-label="Next page">

            Next
          </button>
        </div>
      </div>
    </ErrorBoundary>);

};

export default InfluencerMarketplacePage;