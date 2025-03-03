"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { SurveyPreviewData, SurveyResponses, CreativeAsset } from '@/types/brandLift';
import PlatformSwitcher from './PlatformSwitcher';
import { KPI, CreativeAssetType } from '@prisma/client';
import { BrandLiftService } from '@/services/brandLiftService';
import SurveyOptionCard from './SurveyOptionCard';
import SurveyProgressBar from './SurveyProgressBar';
import CreativePreview from './CreativePreview';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Platform enum definition
enum Platform {
  Instagram = 'Instagram',
  TikTok = 'TikTok',
  YouTube = 'YouTube',
  Facebook = 'Facebook'
}

// Placeholder data function for development and testing
const placeholderSurveyData = (id: string): SurveyPreviewData => {
  return {
    id,
    campaignName: "Summer Campaign 2023",
    date: "2023-06-15",
    brandName: "EcoFriendly",
    brandLogo: "/images/brand-logo.png",
    platforms: [Platform.Instagram, Platform.TikTok],
    activePlatform: Platform.Instagram,
    adCreative: {
      id: "asset1",
      type: 'image' as CreativeAssetType,
      url: "/images/ad-creative.jpg",
      aspectRatio: "1:1"
    },
    adCaption: "Discover our new sustainable product line! #EcoFriendly #Sustainable",
    adHashtags: "#EcoFriendly #Sustainable #GreenLiving",
    adMusic: "Original Sound - EcoFriendly",
  questions: [
    {
        id: "q1",
        title: "Have you heard of EcoFriendly before?",
        type: "Single Choice",
        kpi: KPI.brandAwareness,
      options: [
          { id: "q1o1", text: "Yes, I know them well" },
          { id: "q1o2", text: "Yes, I've heard of them" },
          { id: "q1o3", text: "No, I've never heard of them" }
        ],
        required: true
      },
      {
        id: "q2",
        title: "Do you recall seeing an ad for EcoFriendly recently?",
        type: "Single Choice",
        kpi: KPI.adRecall,
      options: [
          { id: "q2o1", text: "Yes, definitely" },
          { id: "q2o2", text: "Yes, I think so" },
          { id: "q2o3", text: "No, I don't think so" },
          { id: "q2o4", text: "No, definitely not" }
        ],
        required: true
      }
    ]
  };
};

// Helper function for platform icons
const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case Platform.Instagram:
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
        </svg>
      );
    case Platform.TikTok:
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
        </svg>
      );
    case Platform.YouTube:
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
        </svg>
      );
  }
};

export default function SurveyPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('id') || '1';
  
  const [survey, setSurvey] = useState<SurveyPreviewData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<SurveyResponses>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Instagram);
  
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await BrandLiftService.getInstance().getSurveyPreviewData(surveyId);
        setSurvey(data);
        
        // Initialize selected options for each question
        const initialResponses: SurveyResponses = {};
        data.questions.forEach(q => {
          initialResponses[q.id] = [];
        });
        setSelectedOptions(initialResponses);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading survey:', err);
        setError('Failed to load survey data. Please try again.');
        setLoading(false);
      }
    };
    
    loadSurvey();
  }, [surveyId]);
  
  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (!survey) return;
    
    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return;
    
    // For single choice, replace the array with just the selected option
    if (question.type === 'Single Choice') {
      setSelectedOptions(prev => ({
        ...prev,
        [questionId]: [optionId]
      }));
    } else {
      // For multiple choice, toggle the option
      setSelectedOptions(prev => {
        const currentOptions = [...(prev[questionId] || [])];
        
        if (currentOptions.includes(optionId)) {
          // If already selected, remove it
          return {
            ...prev,
            [questionId]: currentOptions.filter(id => id !== optionId)
          };
        } else {
          // If not selected, add it
          return {
            ...prev,
            [questionId]: [...currentOptions, optionId]
          };
        }
      });
    }
  };
  
  const handleNextQuestion = () => {
    if (!survey) return;
    
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSaveDraft = async () => {
    if (!survey) return;
    
    try {
      // Simulate saving the draft
      console.log('Saving draft responses:', selectedOptions);
      
      // In a real implementation, you would call an API here
      await BrandLiftService.getInstance().saveSurveyDraft(survey.id, selectedOptions);
      
      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft. Please try again.');
    }
  };
  
  const handlePlatformChange = async (platform: string) => {
    if (!survey || survey.activePlatform === platform) return;
    
    try {
      // Update active platform and reload survey data
      console.log(`Switching to platform: ${platform}`);
      
      // In a real implementation, you would call an API to get platform-specific data
      await BrandLiftService.getInstance().changeActivePlatform(survey.id, platform as any);
      
      // Reload survey data with the new platform
      const updatedSurvey = await BrandLiftService.getInstance().getSurveyPreviewData(survey.id);
      setSurvey(updatedSurvey);
    } catch (err) {
      console.error('Error changing platform:', err);
      toast.error('Failed to change platform. Please try again.');
    }
  };
  
  // Listen for platform change events from CreativePreview component
  useEffect(() => {
    const onPlatformChange = (event: CustomEvent) => {
      if (event.detail && event.detail.platform) {
        handlePlatformChange(event.detail.platform as string);
      }
    };
    
    window.addEventListener('platformChange', onPlatformChange as EventListener);
    
    return () => {
      window.removeEventListener('platformChange', onPlatformChange as EventListener);
    };
  }, []);
  
  // Inside the component, add a function to calculate estimated time remaining
  const calculateEstimatedTimeRemaining = () => {
    if (!survey) return 0;
    
    // Assume each question takes about 20 seconds to answer
    const secondsPerQuestion = 20;
    const remainingQuestions = survey.questions.length - (currentQuestionIndex + 1);
    const remainingSeconds = remainingQuestions * secondsPerQuestion;
    
    // Convert to minutes and round up
    return Math.ceil(remainingSeconds / 60);
  };
  
  // Handle sharing the survey for initial review
  const handleShareSurvey = async () => {
    if (!survey) return;
    
    setIsSubmitting(true);
    try {
      // In a real implementation, this would send the survey to reviewers
      // For now, we'll just show a success toast
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Survey shared successfully for review!');
      
      // You might navigate to a confirmation page or dashboard
      // router.push('/campaigns/dashboard');
    } catch (err) {
      console.error('Error sharing survey:', err);
      toast.error('Failed to share survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!survey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mt-4">
        <p>No survey data available.</p>
      </div>
    );
  }
  
  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  return (
    <div className="flex h-screen w-full">
      {/* Phone column - takes up 1/3 of the screen with white background */}
      <div className="w-1/3 bg-white flex flex-col items-center pt-4 relative">
        {/* Phone mockup - positioned higher in the container with minimal top margin */}
        <div className="relative pt-2">
          {/* Platform selector buttons stacked vertically, attached to the right side just below the top corner */}
          <div className="absolute top-[52px] -right-[3rem] z-10">
            <div className="flex flex-col space-y-2">
              {survey?.platforms?.map((platformName: string) => (
                <button 
                  key={platformName}
                  className={`flex items-center justify-center p-2 rounded-full w-10 h-10 shadow-md 
                    transition-all duration-200 border
                    ${survey?.activePlatform === platformName ? 
                      platformName === 'Instagram' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 text-white border-transparent scale-110' :
                      platformName === 'TikTok' ? 'bg-black text-white border-transparent scale-110' :
                      platformName === 'YouTube' ? 'bg-red-600 text-white border-transparent scale-110' :
                      'bg-blue-600 text-white border-transparent scale-110' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:scale-105 hover:shadow-lg hover:border-gray-300'}`}
                  onClick={() => {
                    // Cast string to Platform enum safely
                    if (platformName === 'Instagram' || 
                        platformName === 'TikTok' || 
                        platformName === 'YouTube' || 
                        platformName === 'Facebook') {
                      handlePlatformChange(platformName as any);
                    }
                  }}
                  title={platformName}
                >
                  {platformName === 'Instagram' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                    </svg>
                  )}
                  {platformName === 'TikTok' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                    </svg>
                  )}
                  {platformName === 'YouTube' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <CreativePreview
            platform={survey?.activePlatform || 'Instagram'}
            brandName={survey?.brandName || 'Brand Name'}
            brandLogo={survey?.brandLogo}
            creative={survey?.adCreative || {
              id: 'fallback-asset',
              type: 'image' as CreativeAssetType,
              url: 'https://placehold.co/600x800/F0F0F0/CCCCCC?text=No+Creative+Asset',
              aspectRatio: '1:1'
            }}
            caption={survey?.adCaption || ''}
            hashtags={survey?.adHashtags || ''}
            music={survey?.adMusic}
          />
        </div>
      </div>

      {/* Survey content column - takes up 2/3 of the screen, no scrolling */}
      <div className="w-2/3 p-8">
        {/* Header with campaign info - only above survey content */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="text-lg font-medium text-gray-700">{survey?.campaignName || 'Campaign Name'}</div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-2"></div>
            <div className="text-sm text-gray-500">{survey?.date || ''}</div>
          </div>
        </div>
    
        {/* Survey content in a card */}
        <div className="bg-white rounded-lg shadow-md overflow-auto flex-1">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Review & Share Your Survey
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Easily Review and Share Your Survey to Gather Meaningful Insights and Feedback
            </p>
          </div>

          {/* Survey question content */}
          <div className="p-6">
            {/* Question navigation */}
            <div className="mb-6">
              <div className="relative flex items-center">
                <button 
                  className="absolute flex items-center text-gray-500 hover:text-gray-700" 
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="mx-auto flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">~{calculateEstimatedTimeRemaining()} min remaining</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {survey?.questions.length}</span>
              <span className="text-sm text-gray-500">KPI: {currentQuestion?.kpi}</span>
            </div>
            
            <h3 className="text-xl font-medium text-gray-800 mb-6">
              {currentQuestion?.title}
            </h3>
            
            {/* Answer options */}
            <div className="space-y-3 mb-8">
              {currentQuestion?.options?.map((option) => (
                <button
                  key={option.id}
                  className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 
                    ${selectedOptions[currentQuestion?.id || '']?.includes(option.id) 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => handleOptionSelect(currentQuestion?.id || '', option.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 flex items-center justify-center rounded-full border mr-3
                      ${selectedOptions[currentQuestion?.id || '']?.includes(option.id)
                        ? 'border-green-500' 
                        : 'border-gray-300'}`}
                    >
                      {selectedOptions[currentQuestion?.id || '']?.includes(option.id) && (
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center min-w-[120px]"
                onClick={isLastQuestion ? handleShareSurvey : handleNextQuestion}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sharing...
                  </>
                ) : isLastQuestion ? 'Share Survey for Initial Review' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 