"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@/components/ui/icon';
import { toast } from 'react-hot-toast';

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
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('id') || '1';
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [activeTab, setActiveTab] = useState<string>("survey");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // State for surveys and reviewers
  const [surveys, setSurveys] = useState<Survey[]>([{
    id: '1',
    name: 'Senior Travellers',
    status: 'Pending Approval',
    lastModified: '2024-07-21',
    questions: [{
      id: 'q1',
      title: 'How familiar are you with the brand shown in the clip?',
      kpi: 'Boost Brand Awareness',
      kpiClass: 'kpi-brand-awareness',
      expanded: true,
      options: [{
        id: 'q1o1',
        text: 'very familiar',
        image: '/images/survey/familiar1.jpg'
      }, {
        id: 'q1o2',
        text: 'somewhat familiar',
        image: '/images/survey/familiar2.jpg'
      }, {
        id: 'q1o3',
        text: 'not familiar at all',
        image: '/images/survey/familiar3.jpg'
      }, {
        id: 'q1o4',
        text: 'none/other',
        image: '/images/survey/familiar4.jpg'
      }]
    }, {
      id: 'q2',
      title: 'What do you remember most from the short clip?',
      kpi: 'Maximise Ad Recall',
      kpiClass: 'kpi-ad-recall',
      expanded: false,
      options: [{
        id: 'q2o1',
        text: 'The product'
      }, {
        id: 'q2o2',
        text: 'The people'
      }, {
        id: 'q2o3',
        text: 'The scenery'
      }, {
        id: 'q2o4',
        text: 'The music'
      }, {
        id: 'q2o5',
        text: 'Nothing specific'
      }]
    }, {
      id: 'q3',
      title: 'How did the ad make you feel about the brand?',
      kpi: 'Boost Brand Awareness',
      kpiClass: 'kpi-brand-awareness',
      expanded: false,
      options: [{
        id: 'q3o1',
        text: 'Very positive'
      }, {
        id: 'q3o2',
        text: 'Somewhat positive'
      }, {
        id: 'q3o3',
        text: 'Neutral'
      }, {
        id: 'q3o4',
        text: 'Somewhat negative'
      }]
    }, {
      id: 'q4',
      title: 'How likely are you to choose this brand over others based on the ad?',
      kpi: 'Grow Brand Preference',
      kpiClass: 'kpi-brand-preference',
      expanded: false,
      options: [{
        id: 'q4o1',
        text: 'Very likely'
      }, {
        id: 'q4o2',
        text: 'Somewhat likely'
      }, {
        id: 'q4o3',
        text: 'Neither likely nor unlikely'
      }, {
        id: 'q4o4',
        text: 'Somewhat unlikely'
      }, {
        id: 'q4o5',
        text: 'Very unlikely'
      }]
    }, {
      id: 'q5',
      title: 'What would be your next step after seeing this ad?',
      kpi: 'Motivate Action',
      kpiClass: 'kpi-action-intent',
      expanded: false,
      options: [{
        id: 'q5o1',
        text: 'Visit the website'
      }, {
        id: 'q5o2',
        text: 'Search for more information'
      }, {
        id: 'q5o3',
        text: 'Consider purchasing'
      }]
    }]
  }]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([{
    id: 'r1',
    name: 'Lucas Mitchell',
    comment: 'Could we consider adding a short animation of the logo for a more dynamic feel?',
    questionId: 'q1',
    timestamp: '3 hrs ago',
    status: 'Resolved',
    avatar: '/avatars/user1.jpg'
  }, {
    id: 'r2',
    name: 'Ethan Carter',
    comment: 'How about including a GIF of the logo to make the page more engaging?',
    questionId: 'q1',
    timestamp: '2 hrs ago',
    status: 'Need Action',
    avatar: '/avatars/user2.jpg'
  }, {
    id: 'r3',
    name: 'Ava Harris',
    comment: 'It might be cool to incorporate a logo animation here to grab attention.',
    questionId: 'q1',
    timestamp: '2 hrs ago',
    status: 'Need Action',
    avatar: '/avatars/user3.jpg'
  }, {
    id: 'r4',
    name: 'Ava Harris',
    comment: 'Would it be possible to add a GIF of the logo to give this a modern touch?',
    questionId: 'q1',
    timestamp: '1 hrs ago',
    status: 'Need Action',
    avatar: '/avatars/user3.jpg'
  }, {
    id: 'r5',
    name: 'Ava Harris',
    comment: 'How about a looped logo GIF to make the section stand out a bit more?',
    questionId: 'q1',
    timestamp: '1 hrs ago',
    status: 'Need Action',
    avatar: '/avatars/user3.jpg'
  }]);

  // Selected option state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    setSurveys(surveys.map((survey) => ({
      ...survey,
      questions: survey.questions.map((q) => q.id === questionId ? {
        ...q,
        expanded: !q.expanded
      } : q)
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
    setReviewers(reviewers.map((r) => r.id === reviewerId ? {
      ...r,
      status: 'Resolved' as const
    } : r));
  };
  const getStatusColor = (status: string) => {
    if (status === 'Resolved') return 'bg-green-100 text-green-800';
    if (status === 'Need Action') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };
  return <div className="min-h-screen bg-white p-4 md:p-8 font-['Work_Sans'] font-work-sans">
      <div className="max-w-7xl mx-auto font-work-sans">
        <div className="mb-4 flex justify-between items-center font-work-sans">
          <div className="font-work-sans">
            <h1 className="text-2xl font-bold font-['Sora'] text-[var(--primary-color)] font-sora">Survey Approval</h1>
            <div className="flex items-center text-sm text-[var(--secondary-color)] mt-1 font-work-sans">
              <span className="font-work-sans">Senior Travellers</span>
              <span className="mx-2 font-work-sans">|</span>
              <span className="font-work-sans">21 Jul 2024</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-[rgba(0,191,255,0.8)] transition-colors font-work-sans" onClick={() => console.log('Request formal sign-off')}>

            Request Formal Sign-Off
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-work-sans">
          {/* Left Column - Survey Content */}
          <div className="lg:col-span-2 font-work-sans">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-[var(--divider-color)] font-work-sans">
              <h2 className="text-lg font-semibold font-['Sora'] text-[var(--primary-color)] font-sora">Collaborative Approval & Sign-Off</h2>
              <p className="text-sm text-[var(--secondary-color)] font-work-sans">Collaborative Review and Approval Process to Ensure Team Consensus and Final Sign-Off Before Completion</p>
            </div>
            
            {/* Survey Questions */}
            {surveys[0].questions.map((question) => <div key={question.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden border border-[var(--divider-color)] font-work-sans">
                <div className="p-4 cursor-pointer flex justify-between items-center border-b border-[var(--divider-color)] font-work-sans" onClick={() => toggleQuestion(question.id)}>

                  <div className="flex items-start font-work-sans">
                    <div className="text-[var(--accent-color)] mr-4 font-work-sans">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="font-work-sans">
                      <h3 className="font-medium text-[var(--primary-color)] font-sora">{question.title}</h3>
                      <div className="flex items-center mt-1 font-work-sans">
                        <span className={`kpi-title text-sm text-[var(--accent-color)] font-sora`}>
                          <span className={`kpi-icon ${question.kpiClass} font-work-sans`}></span>
                          {question.kpi}
                        </span>
                        <span className="mx-2 text-sm text-gray-400 font-work-sans">•</span>
                        <span className="text-sm text-[var(--secondary-color)] font-work-sans">{question.options.length} Options</span>
                      </div>
                    </div>
                  </div>
                  {question.expanded ? <Icon name="faChevronDown" className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" solid={false} /> : <Icon name="faChevronRight" className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" solid={false} />}
                </div>
                
                {question.expanded && <div className="p-4 font-work-sans">
                    {question.id === 'q1' ? <div className="font-work-sans">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 font-work-sans">
                          {question.options.map((option) => <div key={option.id} className="relative font-work-sans">
                              <div className={`border border-[var(--divider-color)] rounded-lg overflow-hidden cursor-pointer transition-all ${selectedOptions[question.id] === option.id ? 'ring-2 ring-[var(--accent-color)]' : 'hover:shadow-md'} font-work-sans`} onClick={() => handleOptionSelect(question.id, option.id)}>

                                <div className="h-32 relative font-work-sans">
                                  {option.image && <div className="h-full w-full bg-gray-200 relative font-work-sans">
                                      {/* In a real implementation, use next/image for optimized images */}
                                      <div className="absolute inset-0 bg-cover bg-center font-work-sans" style={{
                            backgroundImage: `url(https://picsum.photos/200/300?random=${option.id})`
                          }}></div>
                                    </div>}
                                </div>
                                <div className="p-2 border-t border-[var(--divider-color)] font-work-sans">
                                  <div className="flex items-center font-work-sans">
                                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-2 flex items-center justify-center ${selectedOptions[question.id] === option.id ? 'border-[var(--accent-color)]' : 'border-gray-300'} font-work-sans`}>
                                      {selectedOptions[question.id] === option.id && <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] font-work-sans"></div>}
                                    </div>
                                    <span className="text-sm text-[var(--primary-color)] font-work-sans">{option.text}</span>
                                  </div>
                                </div>
                              </div>
                            </div>)}
                        </div>
                        <div className="flex justify-end space-x-2 mt-4 font-work-sans">
                          <button className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-[var(--secondary-color)] text-sm hover:bg-gray-200 font-work-sans">
                            <Icon name="faEdit" className="h-4 w-4 mr-1" solid={false} />
                            Edit
                          </button>
                          <button className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-[var(--secondary-color)] text-sm hover:bg-gray-200 font-work-sans">
                            <Icon name="faTrash" className="h-4 w-4 mr-1" solid={false} />
                            Delete
                          </button>
                        </div>
                      </div> : <div className="space-y-2 font-work-sans">
                        {question.options.map((option) => <div key={option.id} className={`p-3 border border-[var(--divider-color)] rounded-md flex items-center cursor-pointer ${selectedOptions[question.id] === option.id ? 'border-[var(--accent-color)] bg-[rgba(0,191,255,0.1)]' : 'hover:bg-gray-50'} font-work-sans`} onClick={() => handleOptionSelect(question.id, option.id)}>

                            <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${selectedOptions[question.id] === option.id ? 'border-[var(--accent-color)]' : 'border-gray-300'} font-work-sans`}>
                              {selectedOptions[question.id] === option.id && <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] font-work-sans"></div>}
                            </div>
                            <span className="text-[var(--primary-color)] font-work-sans">{option.text}</span>
                          </div>)}
                      </div>}
                  </div>}
              </div>)}
            
            <button className="w-full py-3 bg-[var(--accent-color)] text-white rounded-md hover:bg-[rgba(0,191,255,0.8)] transition-colors font-medium font-work-sans" onClick={() => {
            // Show success message
            toast.success('Survey submitted for data collection!');
            // Redirect to the progress page with the same ID
            router.push(`/brand-lift/progress?id=${surveyId}`);
          }}>

              Submit for Data Collection
            </button>
          </div>
          
          {/* Right Column - Reviewer Comments */}
          <div className="lg:col-span-1 font-work-sans">
            <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--divider-color)] font-work-sans">
              <h2 className="text-lg font-semibold font-['Sora'] text-[var(--primary-color)] mb-4 font-sora">Comments from Reviewers</h2>
              
              <div className="space-y-6 font-work-sans">
                {reviewers.map((reviewer) => <div key={reviewer.id} className="border-b border-[var(--divider-color)] pb-4 last:border-b-0 last:pb-0 font-work-sans">
                    <div className="flex items-center justify-between mb-2 font-work-sans">
                      <div className="flex items-center font-work-sans">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden font-work-sans">
                          {/* In a real implementation, use next/image for profile images */}
                          <div className="h-full w-full bg-cover bg-center font-work-sans" style={{
                        backgroundImage: `url(https://i.pravatar.cc/150?u=${reviewer.id})`
                      }}></div>
                        </div>
                        <span className="font-medium text-[var(--primary-color)] font-work-sans">{reviewer.name}</span>
                        <span className="mx-2 text-xs text-gray-400 font-work-sans">•</span>
                        <span className="text-xs text-[var(--secondary-color)] font-work-sans">{reviewer.timestamp}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reviewer.status)} font-work-sans`}>
                        {reviewer.status}
                      </span>
                    </div>
                    
                    <div className="mb-3 font-work-sans">
                      <p className="text-sm text-[var(--primary-color)] font-work-sans"><span className="font-medium text-[var(--secondary-color)] font-work-sans">Q2:</span> {reviewer.comment}</p>
                    </div>
                    
                    <div className="flex justify-end font-work-sans">
                      {reviewer.status === 'Need Action' ? <div className="flex space-x-2 font-work-sans">
                          <button className="p-1 font-work-sans" onClick={() => console.log('Edit comment')}>
                            <Icon name="faEdit" className="h-4 w-4 text-gray-400 font-work-sans" solid={false} />
                          </button>
                          <button className="px-3 py-1 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-700 font-work-sans" onClick={() => implementSuggestion(reviewer.id)}>

                            Implement Suggestion
                          </button>
                        </div> : <div className="flex items-center text-sm font-work-sans">
                          <Icon name="faCircleCheck" className="h-5 w-5 text-green-500 font-work-sans" solid={false} />
                          <span className="ml-1.5 font-work-sans">All reviewers approved</span>
                        </div>}
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}