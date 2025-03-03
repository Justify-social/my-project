"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Placeholder data for development while API is being built
const placeholderSurveyData = (id: string) => ({
  id,
  title: "Brand Awareness Survey",
  campaignName: "Senior Travellers",
  date: "21 Jul 2024",
  description: "Help us understand your familiarity with our brand",
  platforms: ["Instagram", "TikTok"],
  activePlatform: "TikTok",
  brandName: "TravelPlus",
  brandLogo: "https://placehold.co/400x400/e2e8f0/1e293b?text=T%2B",
  adCreative: "https://placehold.co/1080x1920/0f172a/f8fafc?text=Travel+Video",
  adCaption: "Experience luxury travel like never before",
  adHashtags: "#travel #seniortravel #luxurytravel",
  adMusic: "Wanderlust • Travel Beats",
  questions: [
    {
      id: '1',
      title: 'How familiar are you with the brand shown in the clip?',
      type: 'Single Choice',
      kpi: 'Brand Awareness',
      options: [
        { id: '1-1', text: 'very familiar', image: 'https://placehold.co/400x300/e9edc9/1d3557?text=Person+Smiling' },
        { id: '1-2', text: 'somewhat familiar', image: 'https://placehold.co/400x300/fefae0/1d3557?text=Cat+Face' },
        { id: '1-3', text: 'not familiar at all', image: 'https://placehold.co/400x300/e9c46a/1d3557?text=I%27M+NOT+FAMILIAR' },
        { id: '1-4', text: 'none/other', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=%3F' },
      ]
    },
    {
      id: '2',
      title: 'Which of our advertisements do you recall seeing?',
      type: 'Multiple Choice',
      kpi: 'Ad Recall',
      options: [
        { id: '2-1', text: 'Product billboard', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=Billboard' },
        { id: '2-2', text: 'Social media ad', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=Social+Media' },
        { id: '2-3', text: 'TV commercial', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=TV+Commercial' },
        { id: '2-4', text: 'None of the above', image: null },
      ]
    }
  ]
});

// Updated to fetch real data from the database with fallback
const getSurveyData = async (id: string) => {
  try {
    // Try to get data from the API
    const response = await axios.get(`/api/brand-lift/surveys/${id}`);
    return response.data;
  } catch (error: any) {
    // Check if it's a 404 error (API endpoint not found)
    if (error.response && error.response.status === 404) {
      console.warn('API endpoint not available yet, using placeholder data');
      // Return placeholder data for development
      return placeholderSurveyData(id);
    }
    
    // For any other error, throw it to be handled by the component
    console.error('Error fetching survey data:', error);
    throw error;
  }
};

export default function SurveyPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('id') || '1';
  
  const [survey, setSurvey] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string[]}>({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSurveyData(surveyId);
        setSurvey(data);
        
        // Initialize selected options for each question
        const initialOptions: {[key: string]: string[]} = {};
        data.questions.forEach((q: any) => {
          initialOptions[q.id] = [];
        });
        setSelectedOptions(initialOptions);
      } catch (error) {
        console.error('Failed to load survey data:', error);
        setError('Unable to load survey data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSurvey();
  }, [surveyId]);
  
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions(prev => {
      const currentQuestion = survey.questions.find((q: any) => q.id === questionId);
      
      if (currentQuestion.type === 'Single Choice') {
        // For single choice, replace any existing selection
        return { ...prev, [questionId]: [optionId] };
      } else {
        // For multiple choice, toggle the selection
        const currentSelections = prev[questionId] || [];
        if (currentSelections.includes(optionId)) {
          return { ...prev, [questionId]: currentSelections.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentSelections, optionId] };
        }
      }
    });
  };

  const handleShareSurvey = async () => {
    try {
      // API call to share the survey
      try {
        await axios.post(`/api/brand-lift/surveys/${surveyId}/share`, {
          selectedOptions
        });
        // Show success message or redirect
        alert('Survey shared for initial review');
      } catch (error: any) {
        // If the API endpoint doesn't exist yet, show mock success
        if (error.response && error.response.status === 404) {
          console.warn('Share API not available yet, showing mock success');
          alert('Survey shared for initial review (Development mode)');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error sharing survey:', error);
      alert('Failed to share survey. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!survey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No survey data found</div>
      </div>
    );
  }
  
  const currentQuestion = survey.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-4 max-h-screen overflow-hidden flex flex-col">
      {/* Header - made more compact */}
      <div className="mb-4">
        <h1 className="text-xl font-bold font-sora">Preview & Submit</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{survey.campaignName}</span>
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
          <span className="text-sm text-gray-600">{survey.date}</span>
        </div>
      </div>
      
      {/* Main content - with flex-1 to take available space */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Device preview column - made more compact */}
        <div className="w-full lg:w-5/12 flex flex-col h-full">
          {/* Device frame - height adjusted */}
          <div className="border-4 border-gray-800 rounded-3xl overflow-hidden w-full max-w-[300px] h-[530px] bg-black mx-auto">
            {/* Status bar */}
            <div className="relative h-8 bg-black flex items-center px-5">
              <div className="absolute left-5 text-white text-xs">9:41</div>
              <div className="flex justify-end items-center space-x-1 absolute right-5 opacity-80">
                <div className="w-4 h-1 bg-white"></div>
                <div className="w-4 h-1 bg-white"></div>
                <div className="w-4 h-1 bg-white"></div>
              </div>
            </div>
            
            {/* App UI - adjusted heights */}
            <div className="h-[calc(100%-32px)] bg-[#121621] relative">
              {/* TikTok header */}
              <div className="h-10 flex items-center justify-between px-4 text-white">
                <div className="w-6 h-6"></div>
                <div className="flex space-x-6">
                  <span className="opacity-70 text-sm">Following</span>
                  <span className="font-medium text-sm border-b-2 border-white pb-1">For you</span>
                </div>
                <div className="w-6 h-6 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
              
              {/* TikTok content - adjusted heights */}
              <div className="w-full h-[calc(100%-40px)] bg-[#121621] relative">
                {survey.adCreative && (
                  <div className="w-full h-full overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full relative flex items-center justify-center">
                      <img 
                        src={survey.adCreative} 
                        alt={`${survey.campaignName} creative`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                        Travel Video
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Right-side interaction buttons - spacing adjusted */}
                <div className="absolute right-3 bottom-28 flex flex-col items-center space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full overflow-hidden">
                      {survey.brandLogo && (
                        <img 
                          src={survey.brandLogo}
                          alt={survey.brandName || "Brand logo"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <span className="text-white text-xs mt-1">250.5K</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10.5v2.25m0-4.5v2.25m0-4.5v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <span className="text-white text-xs mt-1">100K</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs mt-1">89K</span>
                  </div>
                  
                  <div className="flex flex-col items-center relative">
                    <div className="w-8 h-8 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs mt-1">132.5K</span>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px]">J</span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom left info - spacing adjusted */}
                <div className="absolute bottom-12 left-3 z-10 text-white">
                  <div className="font-medium text-sm mb-1">{survey.brandName || "Brand Name"}</div>
                  <div className="text-xs mb-1">{survey.adCaption || "Ad caption"} 👋</div>
                  <div className="text-xs mb-2">{survey.adHashtags || "#brandlift #ad"}</div>
                  <div className="flex items-center text-xs opacity-70">
                    <span className="mr-1 opacity-70">🔤</span>
                    <span>Show translation</span>
                  </div>
                  <div className="flex items-center text-xs opacity-70">
                    <span className="mr-1 opacity-70">🎵</span>
                    <span>{survey.adMusic || "Song name • song artist"}</span>
                  </div>
                </div>
                
                {/* Bottom navigation */}
                <div className="absolute bottom-0 left-0 right-0 h-10 flex justify-between items-center px-5 text-white bg-black bg-opacity-90">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="text-[8px] mt-0.5">Home</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.479m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="text-[8px] mt-0.5">Friends</span>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-[#25CCF7] flex items-center justify-center text-white text-xl -mt-3">+</div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-[8px] mt-0.5">Inbox</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[8px] mt-0.5">Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Platform selection - more compact */}
          <div className="flex justify-center mt-3 space-x-4">
            <div 
              className={`w-10 h-10 rounded-lg ${survey.activePlatform === 'Instagram' ? 'bg-[#C13584]' : 'bg-gray-200'} flex items-center justify-center cursor-pointer`}
              onClick={() => {
                if (survey.platforms.includes('Instagram')) {
                  setSurvey({...survey, activePlatform: 'Instagram'});
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" fill={survey.activePlatform === 'Instagram' ? 'white' : '#4A5568'}/>
              </svg>
            </div>
            
            <div 
              className={`w-10 h-10 rounded-lg ${survey.activePlatform === 'TikTok' ? 'bg-[#25CCF7]' : 'bg-gray-200'} flex items-center justify-center cursor-pointer`}
              onClick={() => {
                if (survey.platforms.includes('TikTok')) {
                  setSurvey({...survey, activePlatform: 'TikTok'});
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M19.589 6.686C19.3066 6.6282 19.0344 6.5186 18.7834 6.36L18.79 6.356C18.502 6.173 18.248 5.94 18.04 5.663C17.1005 4.56283 16.6346 3.15437 16.748 1.734H14.011V11.826C14.0093 12.0773 13.9284 12.3214 13.7786 12.5224C13.6287 12.7234 13.4177 12.8709 13.1775 12.9434C12.9372 13.0159 12.6804 13.0096 12.4448 12.9254C12.2093 12.8412 12.0078 12.683 11.871 12.476C11.5902 12.089 11.4792 11.5925 11.5644 11.1106C11.6496 10.6287 11.9242 10.2018 12.325 9.92C12.745 9.62 13.25 9.5 13.75 9.5V6.748C12.447 6.754 11.179 7.183 10.1518 7.9681C9.12465 8.7532 8.3946 9.85372 8.075 11.0946C7.75539 12.3355 7.86312 13.6473 8.38204 14.8149C8.90095 15.9825 9.80134 16.9403 10.9497 17.5387C12.0981 18.1371 13.4174 18.3445 14.7048 18.1316C15.9921 17.9188 17.1752 17.2969 18.0644 16.3565C18.9536 15.4161 19.5022 14.2051 19.6231 12.9131C19.744 11.6212 19.4306 10.3267 18.737 9.234C18.737 9.234 18.787 9.315 18.826 9.395V9.367C18.8426 9.40772 18.8591 9.44157 18.875 9.476V9.436C18.9684 9.67439 19.0514 9.91816 19.124 10.166V6.686H19.589ZM17.92 7.67C17.9206 7.67166 17.9213 7.6733 17.922 7.675L17.92 7.67Z" fill={survey.activePlatform === 'TikTok' ? 'white' : '#4A5568'}/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Survey preview column - adjusted for better vertical space */}
        <div className="w-full lg:w-7/12 flex flex-col h-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col h-full">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Review & Share Your Survey</h2>
              <p className="text-xs text-gray-600">
                Easily Review and Share Your Survey to Gather Meaningful Insights and Feedback
              </p>
            </div>
            
            {/* Question content - made more compact */}
            <div className="mb-4 flex-1 overflow-auto">
              <div className="flex items-center mb-3">
                <h3 className="font-medium text-sm">{currentQuestion.title}</h3>
                <ChevronRightIcon className="h-4 w-4 ml-1 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option: any, index: number) => (
                  <div key={option.id} className="flex flex-col">
                    {option.image && (
                      <div className="rounded-lg overflow-hidden mb-2 h-[120px]">
                        <img 
                          src={option.image} 
                          alt={option.text} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={option.id}
                        name={`question-${currentQuestion.id}`}
                        checked={selectedOptions[currentQuestion.id]?.includes(option.id)}
                        onChange={() => handleOptionSelect(currentQuestion.id, option.id)}
                        className="mr-2 h-4 w-4 text-blue-500"
                      />
                      <label htmlFor={option.id} className="text-sm">{option.text}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Question navigation integrated into card */}
            {survey.questions.length > 1 && (
              <div className="flex justify-center mb-4">
                {survey.questions.map((question: any, index: number) => (
                  <div 
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-2.5 h-2.5 mx-1 rounded-full cursor-pointer ${
                      index === currentQuestionIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
            
            <button 
              onClick={handleShareSurvey}
              className="w-full bg-[#00BFFF] text-white py-2.5 rounded-md font-medium hover:bg-blue-500 transition-colors"
            >
              Share Survey for Initial Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 