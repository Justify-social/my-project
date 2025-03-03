"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { SurveyPreviewData, SurveyResponses, CreativeAsset } from '@/types/brandLift';
import PlatformSwitcher from './PlatformSwitcher';
import { Platform, KPI, CreativeAssetType } from '@prisma/client';
import { BrandLiftService } from '@/services/brandLiftService';
import SurveyOptionCard from './SurveyOptionCard';
import SurveyProgressBar from './SurveyProgressBar';
import CreativePreview from './CreativePreview';
import { motion } from 'framer-motion';

// Use string value instead of enum reference to avoid potential issues
const imageType = 'image' as CreativeAssetType;
const videoType = 'video' as CreativeAssetType;

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
      type: imageType,
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

export default function SurveyPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('id') || '1';
  
  const [survey, setSurvey] = useState<SurveyPreviewData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<SurveyResponses>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        const currentSelections = prev[questionId] || [];
        const isAlreadySelected = currentSelections.includes(optionId);
        
        if (isAlreadySelected) {
          return {
            ...prev,
            [questionId]: currentSelections.filter(id => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentSelections, optionId]
          };
        }
      });
    }
  };
  
  const handleNextQuestion = () => {
    if (!survey) return;
    
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSaveDraft = async () => {
    if (!survey) return;
    
    try {
      await BrandLiftService.getInstance().saveSurveyDraft(surveyId, selectedOptions);
      alert('Survey draft saved successfully!');
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft. Please try again.');
    }
  };
  
  const handlePlatformChange = async (platform: Platform) => {
    if (!survey || survey.activePlatform === platform) return;
    
    try {
      setLoading(true);
      const updatedSurvey = await BrandLiftService.getInstance().changeActivePlatform(surveyId, platform);
      setSurvey(updatedSurvey);
      setLoading(false);
    } catch (err) {
      console.error('Error changing platform:', err);
      setError('Failed to change platform. Please try again.');
      setLoading(false);
    }
  };
  
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{survey.campaignName} - Preview</h1>
        <button 
          onClick={() => alert('Share for review functionality will be implemented here')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          Share for Review
          <ChevronRightIcon className="h-5 w-5 ml-1" />
        </button>
      </div>
      
      {survey.platforms.length > 1 && (
        <div className="mb-6">
          <PlatformSwitcher 
            platforms={survey.platforms}
            activePlatform={survey.activePlatform}
            campaignId={survey.id}
            onPlatformChange={handlePlatformChange}
          />
                  </div>
                )}
                
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Creative Preview */}
        <CreativePreview
          platform={survey.activePlatform}
          brandName={survey.brandName || 'Brand Name'}
          brandLogo={survey.brandLogo}
          creative={survey.adCreative || {
            id: 'fallback-asset',
            type: imageType,
            url: 'https://placehold.co/600x800/F0F0F0/CCCCCC?text=No+Creative+Asset',
            aspectRatio: '1:1'
          }}
          caption={survey.adCaption || ''}
          hashtags={survey.adHashtags || ''}
          music={survey.adMusic}
        />
        
        {/* Survey Questions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Survey Questions</h2>
            
            <SurveyProgressBar
              currentStep={currentQuestionIndex}
              totalSteps={survey.questions.length}
              onStepClick={(step) => setCurrentQuestionIndex(step)}
              estimatedTimeRemaining={calculateEstimatedTimeRemaining()}
            />
            
            <div className="mb-4 flex justify-between text-sm text-gray-500">
              <span>Question {currentQuestionIndex + 1} of {survey.questions.length}</span>
              <span>KPI: {currentQuestion.kpi}</span>
            </div>
            
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={currentQuestion.id}
            >
              <h3 className="text-lg font-medium mb-3">{currentQuestion.title}</h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map(option => (
                  <SurveyOptionCard
                    key={option.id}
                        id={option.id}
                    text={option.text}
                    image={option.image}
                    isSelected={selectedOptions[currentQuestion.id]?.includes(option.id)}
                    onSelect={() => handleOptionSelect(currentQuestion.id, option.id)}
                    selectionType={currentQuestion.type === 'Single Choice' ? 'single' : 'multiple'}
                  />
                ))}
              </div>
            </motion.div>
            
            <div className="flex justify-between">
              <motion.button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-md ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={currentQuestionIndex !== 0 ? { scale: 1.05 } : {}}
                whileTap={currentQuestionIndex !== 0 ? { scale: 0.95 } : {}}
              >
                Previous
              </motion.button>
              
              <motion.button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Draft
              </motion.button>
              
              <motion.button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === survey.questions.length - 1}
                className={`px-4 py-2 rounded-md ${
                  currentQuestionIndex === survey.questions.length - 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                whileHover={currentQuestionIndex !== survey.questions.length - 1 ? { scale: 1.05 } : {}}
                whileTap={currentQuestionIndex !== survey.questions.length - 1 ? { scale: 0.95 } : {}}
              >
                Next
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 