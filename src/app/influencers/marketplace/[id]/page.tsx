"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Influencer } from "../../../../types/influencer";
import TransparencyPanel from "../../../../components/Influencers/TransparencyPanel";

// -------------------------------------------------------------------
// 1. Error Boundary for Unexpected Crashes
// -------------------------------------------------------------------
class ErrorBoundary extends React.Component<{children: React.ReactNode;}, {hasError: boolean;}> {
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

// -------------------------------------------------------------------
// 2. Spinner for Loading States
// -------------------------------------------------------------------
const Spinner: React.FC = () =>
<div className="flex justify-center items-center py-8 font-work-sans" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 font-work-sans"></div>
    <span className="sr-only font-work-sans">Loading...</span>
  </div>;


// -------------------------------------------------------------------
// 3. Extended Influencer Interface
// -------------------------------------------------------------------
interface InfluencerDetail extends Influencer {
  profileImage?: string;
  justifyScore?: number; // Alternative naming for dynamicScore
  engagementRate?: number;
  tier?: string;
  audienceMatch?: string;
  bio?: string;
  recentCampaigns?: {
    id: string;
    image: string;
    title: string;
  }[];
  breakdown?: {
    engagement: number; // Weighted contribution to the Justify Score
    sentiment: number;
    audienceAlignment: number;
    historical: number;
  };
  // Additional sections for deeper data
  socialStats?: {
    followers: number;
    following: number;
    totalPosts: number;
  };
  reviews?: {
    brandName: string;
    rating: number;
    comment: string;
  }[];
  brandSafetyRating?: number; // e.g. 0-100
}

// -------------------------------------------------------------------
// 4. Dummy Data as a Fallback
// -------------------------------------------------------------------
const sampleInfluencerDetail: InfluencerDetail = {
  id: "1",
  name: "Olivia Bennett",
  profileImage: "/images/influencers/olivia.jpg",
  justifyScore: 92,
  tier: "Platinum",
  audienceMatch: "High",
  platform: "Instagram",
  engagementRate: 4.8,
  bio: "Olivia is a top influencer in lifestyle and travel, known for her high engagement and authentic content.",
  recentCampaigns: [
  {
    id: "c1",
    image: "/images/campaigns/campaign1.jpg",
    title: "Summer Travel Campaign"
  },
  {
    id: "c2",
    image: "/images/campaigns/campaign2.jpg",
    title: "Eco-Friendly Living"
  }],

  breakdown: {
    engagement: 40,
    sentiment: 30,
    audienceAlignment: 15,
    historical: 7
  },
  socialStats: {
    followers: 450000,
    following: 120,
    totalPosts: 789
  },
  reviews: [
  {
    brandName: "GreenEarth",
    rating: 5,
    comment: "Amazing collaboration! She truly connected with our eco-friendly message."
  },
  {
    brandName: "SunnyVacations",
    rating: 4,
    comment: "Delivered great content. Engagement was high. Slight delay on final deliverable."
  }],

  brandSafetyRating: 88
};

// -------------------------------------------------------------------
// 5. Influencer Detail Page Component
// -------------------------------------------------------------------
const InfluencerDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const influencerId = params.id as string;

  const [influencer, setInfluencer] = useState<InfluencerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------
  // Fetch Influencer Data (API or Dummy Fallback)
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchInfluencerDetail = async () => {
      try {
        // Uncomment & adjust once your API is ready:
        // const response = await axios.get<InfluencerDetail>(`/api/influencers/${influencerId}`);
        // setInfluencer(response.data);

        // For now, fallback to sample data:
        setInfluencer(sampleInfluencerDetail);
      } catch (err) {
        const axiosErr = err as AxiosError;
        console.error("Error fetching influencer detail:", axiosErr);
        setError("Failed to load influencer details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencerDetail();
  }, [influencerId]);

  // -------------------------------------------------------------------
  // Layout: Handle Loading & Errors
  // -------------------------------------------------------------------
  if (loading) {
    return <Spinner />;
  }
  if (error || !influencer) {
    return (
      <div className="p-4 text-red-600 font-work-sans">
        {error || "Influencer not found. Please check again."}
      </div>);

  }

  // -------------------------------------------------------------------
  // Helper: Render star rating or similar
  // -------------------------------------------------------------------
  const renderRatingStars = (rating: number) => {
    const totalStars = 5;
    const filledStars = Math.min(rating, totalStars);
    const emptyStars = totalStars - filledStars;
    return (
      <div className="inline-block font-work-sans">
        {"★".repeat(filledStars)}
        <span className="text-gray-400 font-work-sans">{"★".repeat(emptyStars)}</span>
      </div>);

  };

  // -------------------------------------------------------------------
  // UI Return
  // -------------------------------------------------------------------
  return (
    <ErrorBoundary>
      <div className="max-w-5xl mx-auto px-4 py-6 font-work-sans">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition font-work-sans">

          &larr; Back to Marketplace
        </button>

        {/* Top Section: Profile + Basic Info */}
        <div className="flex flex-col md:flex-row gap-6 bg-white p-4 rounded shadow font-work-sans">
          {/* Influencer Image */}
          <img
            src={influencer.profileImage}
            alt={`${influencer.name}'s profile`}
            className="w-full md:w-1/3 object-cover rounded" />


          {/* Influencer Info */}
          <div className="flex-1 flex flex-col justify-between font-work-sans">
            <div className="font-work-sans">
              <h1 className="text-3xl font-bold font-sora">{influencer.name}</h1>
              {influencer.bio && <p className="mt-2 text-gray-700 font-work-sans">{influencer.bio}</p>}

              <div className="mt-4 space-y-2 font-work-sans">
                <div className="font-work-sans">
                  <span className="font-semibold font-work-sans">Platform:</span> {influencer.platform}
                </div>
                <div className="font-work-sans">
                  <span className="font-semibold font-work-sans">Engagement Rate:</span>{" "}
                  {influencer.engagementRate?.toFixed(1)}%
                </div>
                <div className="font-work-sans">
                  <span className="font-semibold font-work-sans">Dynamic Justify Score:</span>{" "}
                  {influencer.justifyScore}{" "}
                  {influencer.tier &&
                  <span className="text-sm text-gray-500 font-work-sans">({influencer.tier})</span>
                  }
                </div>
                {typeof influencer.brandSafetyRating === "number" &&
                <div className="font-work-sans">
                    <span className="font-semibold font-work-sans">Brand Safety Rating:</span>{" "}
                    {influencer.brandSafetyRating} / 100
                  </div>
                }
              </div>
            </div>

            {/* Optional: Social Stats */}
            {influencer.socialStats &&
            <div className="mt-6 bg-gray-50 p-3 rounded font-work-sans">
                <h2 className="font-semibold mb-2 font-sora">Social Stats</h2>
                <div className="flex space-x-6 font-work-sans">
                  <div className="font-work-sans">
                    <span className="font-bold font-work-sans">{influencer.socialStats.followers}</span>{" "}
                    <span className="text-sm text-gray-500 font-work-sans">Followers</span>
                  </div>
                  <div className="font-work-sans">
                    <span className="font-bold font-work-sans">{influencer.socialStats.following}</span>{" "}
                    <span className="text-sm text-gray-500 font-work-sans">Following</span>
                  </div>
                  <div className="font-work-sans">
                    <span className="font-bold font-work-sans">{influencer.socialStats.totalPosts}</span>{" "}
                    <span className="text-sm text-gray-500 font-work-sans">Posts</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        {/* Transparency / Breakdown Panel */}
        <div className="mt-6 bg-white p-4 rounded shadow font-work-sans">
          <TransparencyPanel
            justifyScore={influencer.justifyScore || 0}
            breakdown={influencer.breakdown || { engagement: 0, sentiment: 0, audienceAlignment: 0, historical: 0 }} />

        </div>

        {/* Recent Campaigns */}
        {influencer.recentCampaigns && influencer.recentCampaigns.length > 0 &&
        <div className="mt-8 bg-white p-4 rounded shadow font-work-sans">
            <h2 className="text-2xl font-bold mb-4 font-sora">Recent Campaigns</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-work-sans">
              {influencer.recentCampaigns.map((campaign) =>
            <div key={campaign.id} className="border rounded p-2 hover:shadow transition font-work-sans">
                  <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-32 object-cover rounded mb-2" />

                  <p className="font-semibold text-sm sm:text-base font-work-sans">{campaign.title}</p>
                </div>
            )}
            </div>
          </div>
        }

        {/* Peer Reviews Section */}
        {influencer.reviews && influencer.reviews.length > 0 &&
        <div className="mt-8 bg-white p-4 rounded shadow font-work-sans">
            <h2 className="text-2xl font-bold mb-4 font-sora">Peer Reviews</h2>
            <ul className="space-y-4 font-work-sans">
              {influencer.reviews.map((review, index) =>
            <li key={index} className="border-b pb-4 last:border-none last:pb-0 font-work-sans">
                  <div className="flex justify-between items-center font-work-sans">
                    <p className="font-semibold font-work-sans">{review.brandName}</p>
                    <div className="font-work-sans">{renderRatingStars(review.rating)}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-work-sans">{review.comment}</p>
                </li>
            )}
            </ul>
          </div>
        }

        {/* CTA: Collaboration / Contact */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end font-work-sans">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-work-sans"
            onClick={() => alert("Initiate contact or negotiation flow...")}>

            Contact Influencer
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-work-sans"
            onClick={() => alert("Add influencer to your campaign...")}>

            Add to Campaign
          </button>
        </div>
      </div>
    </ErrorBoundary>);

};

export default InfluencerDetailPage;