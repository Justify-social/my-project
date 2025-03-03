"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRightIcon, ChevronDownIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Define types for our component
interface Reviewer {
  id: string;
  name: string;
  comment: string;
  questionId: string;
  timestamp: string;
  status: 'Resolved' | 'Need Action';
  avatar?: string;
}

interface SurveyOption {
  id: string;
  text: string;
  image?: string;
}

interface SurveyQuestion {
  id: string;
  title: string;
  kpi: string;
  kpiClass: string;
  options: SurveyOption[];
  expanded?: boolean;
}

interface Survey {
  id: string;
  name: string;
  status: string;
  questions: SurveyQuestion[];
  lastModified: string;
}

export default function SurveyApprovalContent() {
  const router = useRouter();
  
  // State for surveys and reviewers
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      name: 'Senior Travellers',
      status: 'Pending Approval',
      lastModified: '2024-07-21',
      questions: [
        {
          id: 'q1',
          title: 'How familiar are you with the brand shown in the clip?',
          kpi: 'Boost Brand Awareness',
          kpiClass: 'kpi-brand-awareness',
          expanded: true,
          options: [
            { id: 'q1o1', text: 'very familiar', image: '/images/survey/familiar1.jpg' },
            { id: 'q1o2', text: 'somewhat familiar', image: '/images/survey/familiar2.jpg' },
            { id: 'q1o3', text: 'not familiar at all', image: '/images/survey/familiar3.jpg' },
            { id: 'q1o4', text: 'none/other', image: '/images/survey/familiar4.jpg' },
          ]
        },
        {
          id: 'q2',
          title: 'What do you remember most from the short clip?',
          kpi: 'Maximise Ad Recall',
          kpiClass: 'kpi-ad-recall',
          expanded: false,
          options: [
            { id: 'q2o1', text: 'The product' },
            { id: 'q2o2', text: 'The people' },
            { id: 'q2o3', text: 'The scenery' },
            { id: 'q2o4', text: 'The music' },
            { id: 'q2o5', text: 'Nothing specific' },
          ]
        },
        {
          id: 'q3',
          title: 'How did the ad make you feel about the brand?',
          kpi: 'Boost Brand Awareness',
          kpiClass: 'kpi-brand-awareness',
          expanded: false,
          options: [
            { id: 'q3o1', text: 'Very positive' },
            { id: 'q3o2', text: 'Somewhat positive' },
            { id: 'q3o3', text: 'Neutral' },
            { id: 'q3o4', text: 'Somewhat negative' },
          ]
        },
        {
          id: 'q4',
          title: 'How likely are you to choose this brand over others based on the ad?',
          kpi: 'Grow Brand Preference',
          kpiClass: 'kpi-brand-preference',
          expanded: false,
          options: [
            { id: 'q4o1', text: 'Very likely' },
            { id: 'q4o2', text: 'Somewhat likely' },
            { id: 'q4o3', text: 'Neither likely nor unlikely' },
            { id: 'q4o4', text: 'Somewhat unlikely' },
            { id: 'q4o5', text: 'Very unlikely' },
          ]
        },
        {
          id: 'q5',
          title: 'What would be your next step after seeing this ad?',
          kpi: 'Motivate Action',
          kpiClass: 'kpi-action-intent',
          expanded: false,
          options: [
            { id: 'q5o1', text: 'Visit the website' },
            { id: 'q5o2', text: 'Search for more information' },
            { id: 'q5o3', text: 'Consider purchasing' },
          ]
        },
      ]
    },
  ]);
  
  const [reviewers, setReviewers] = useState<Reviewer[]>([
    {
      id: 'r1',
      name: 'Lucas Mitchell',
      comment: 'Could we consider adding a short animation of the logo for a more dynamic feel?',
      questionId: 'q1',
      timestamp: '3 hrs ago',
      status: 'Resolved',
      avatar: '/avatars/user1.jpg'
    },
    {
      id: 'r2',
      name: 'Ethan Carter',
      comment: 'How about including a GIF of the logo to make the page more engaging?',
      questionId: 'q1',
      timestamp: '2 hrs ago',
      status: 'Need Action',
      avatar: '/avatars/user2.jpg'
    },
    {
      id: 'r3',
      name: 'Ava Harris',
      comment: 'It might be cool to incorporate a logo animation here to grab attention.',
      questionId: 'q1',
      timestamp: '2 hrs ago',
      status: 'Need Action',
      avatar: '/avatars/user3.jpg'
    },
    {
      id: 'r4',
      name: 'Ava Harris',
      comment: 'Would it be possible to add a GIF of the logo to give this a modern touch?',
      questionId: 'q1',
      timestamp: '1 hrs ago',
      status: 'Need Action',
      avatar: '/avatars/user3.jpg'
    },
    {
      id: 'r5',
      name: 'Ava Harris',
      comment: 'How about a looped logo GIF to make the section stand out a bit more?',
      questionId: 'q1',
      timestamp: '1 hrs ago',
      status: 'Need Action',
      avatar: '/avatars/user3.jpg'
    },
  ]);
  
  // Selected option state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    setSurveys(surveys.map(survey => ({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === questionId ? { ...q, expanded: !q.expanded } : q
      )
    })));
  };
  
  // Handle option selection
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: optionId
    });
  };
  
  // Implement suggestion handler
  const implementSuggestion = (reviewerId: string) => {
    setReviewers(reviewers.map(r => 
      r.id === reviewerId ? { ...r, status: 'Resolved' as const } : r
    ));
  };
  
  const getStatusColor = (status: string) => {
    if (status === 'Resolved') return 'bg-green-100 text-green-800';
    if (status === 'Need Action') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-['Work_Sans']">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-['Sora'] text-[var(--primary-color)]">Survey Approval</h1>
            <div className="flex items-center text-sm text-[var(--secondary-color)] mt-1">
              <span>Senior Travellers</span>
              <span className="mx-2">|</span>
              <span>21 Jul 2024</span>
            </div>
          </div>
          <button 
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-[rgba(0,191,255,0.8)] transition-colors"
            onClick={() => console.log('Request formal sign-off')}
          >
            Request Formal Sign-Off
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Survey Content */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-[var(--divider-color)]">
              <h2 className="text-lg font-semibold font-['Sora'] text-[var(--primary-color)]">Collaborative Approval & Sign-Off</h2>
              <p className="text-sm text-[var(--secondary-color)]">Collaborative Review and Approval Process to Ensure Team Consensus and Final Sign-Off Before Completion</p>
            </div>
            
            {/* Survey Questions */}
            {surveys[0].questions.map((question) => (
              <div key={question.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden border border-[var(--divider-color)]">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center border-b border-[var(--divider-color)]"
                  onClick={() => toggleQuestion(question.id)}
                >
                  <div className="flex items-start">
                    <div className="text-[var(--accent-color)] mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--primary-color)]">{question.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`kpi-title text-sm text-[var(--accent-color)]`}>
                          <span className={`kpi-icon ${question.kpiClass}`}></span>
                          {question.kpi}
                        </span>
                        <span className="mx-2 text-sm text-gray-400">•</span>
                        <span className="text-sm text-[var(--secondary-color)]">{question.options.length} Options</span>
                      </div>
                    </div>
                  </div>
                  {question.expanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-[var(--secondary-color)]" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-[var(--secondary-color)]" />
                  )}
                </div>
                
                {question.expanded && (
                  <div className="p-4">
                    {question.id === 'q1' ? (
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          {question.options.map((option) => (
                            <div key={option.id} className="relative">
                              <div 
                                className={`border border-[var(--divider-color)] rounded-lg overflow-hidden cursor-pointer transition-all ${selectedOptions[question.id] === option.id ? 'ring-2 ring-[var(--accent-color)]' : 'hover:shadow-md'}`}
                                onClick={() => handleOptionSelect(question.id, option.id)}
                              >
                                <div className="h-32 relative">
                                  {option.image && (
                                    <div className="h-full w-full bg-gray-200 relative">
                                      {/* In a real implementation, use next/image for optimized images */}
                                      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(https://picsum.photos/200/300?random=${option.id})`}}></div>
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 border-t border-[var(--divider-color)]">
                                  <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-2 flex items-center justify-center ${selectedOptions[question.id] === option.id ? 'border-[var(--accent-color)]' : 'border-gray-300'}`}>
                                      {selectedOptions[question.id] === option.id && (
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]"></div>
                                      )}
                                    </div>
                                    <span className="text-sm text-[var(--primary-color)]">{option.text}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-[var(--secondary-color)] text-sm hover:bg-gray-200">
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-[var(--secondary-color)] text-sm hover:bg-gray-200">
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div 
                            key={option.id}
                            className={`p-3 border border-[var(--divider-color)] rounded-md flex items-center cursor-pointer ${selectedOptions[question.id] === option.id ? 'border-[var(--accent-color)] bg-[rgba(0,191,255,0.1)]' : 'hover:bg-gray-50'}`}
                            onClick={() => handleOptionSelect(question.id, option.id)}
                          >
                            <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${selectedOptions[question.id] === option.id ? 'border-[var(--accent-color)]' : 'border-gray-300'}`}>
                              {selectedOptions[question.id] === option.id && (
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]"></div>
                              )}
                            </div>
                            <span className="text-[var(--primary-color)]">{option.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            <button 
              className="w-full py-3 bg-[var(--accent-color)] text-white rounded-md hover:bg-[rgba(0,191,255,0.8)] transition-colors font-medium"
              onClick={() => console.log('Submit for data collection')}
            >
              Submit for Data Collection
            </button>
          </div>
          
          {/* Right Column - Reviewer Comments */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--divider-color)]">
              <h2 className="text-lg font-semibold font-['Sora'] text-[var(--primary-color)] mb-4">Comments from Reviewers</h2>
              
              <div className="space-y-6">
                {reviewers.map((reviewer) => (
                  <div key={reviewer.id} className="border-b border-[var(--divider-color)] pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                          {/* In a real implementation, use next/image for profile images */}
                          <div className="h-full w-full bg-cover bg-center" style={{backgroundImage: `url(https://i.pravatar.cc/150?u=${reviewer.id})`}}></div>
                        </div>
                        <span className="font-medium text-[var(--primary-color)]">{reviewer.name}</span>
                        <span className="mx-2 text-xs text-gray-400">•</span>
                        <span className="text-xs text-[var(--secondary-color)]">{reviewer.timestamp}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reviewer.status)}`}>
                        {reviewer.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-[var(--primary-color)]"><span className="font-medium text-[var(--secondary-color)]">Q2:</span> {reviewer.comment}</p>
                    </div>
                    
                    <div className="flex justify-end">
                      {reviewer.status === 'Need Action' ? (
                        <div className="flex space-x-2">
                          <button className="p-1" onClick={() => console.log('Edit comment')}>
                            <PencilIcon className="h-4 w-4 text-gray-400" />
                          </button>
                          <button 
                            className="px-3 py-1 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-700"
                            onClick={() => implementSuggestion(reviewer.id)}
                          >
                            Implement Suggestion
                          </button>
                        </div>
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 