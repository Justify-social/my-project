"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Question {
  id: string;
  title: string;
  type: 'Multiple Choice' | 'Single Choice';
  kpi: string;
  options: Array<{
    id: string;
    text: string;
    image?: string | null;
  }>;
}

interface QuestionOption {
  id: string;
  text: string;
  image?: string | null;
}

interface GiphyResult {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
    };
  };
}

export default function SurveyDesignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');

  // Sample questions based on Figma design
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      title: 'How would you rate our brand awareness campaign?',
      type: 'Multiple Choice',
      kpi: 'Brand Awareness',
      options: [
        { id: '1-1', text: 'Very Effective', image: '/samples/sample1.jpg' },
        { id: '1-2', text: 'Somewhat Effective', image: '/samples/sample2.jpg' },
        { id: '1-3', text: 'Not Effective', image: null },
      ]
    },
    {
      id: '2',
      title: 'Which of our advertisements do you recall seeing?',
      type: 'Multiple Choice',
      kpi: 'Ad Recall',
      options: [
        { id: '2-1', text: 'Product Billboard', image: '/samples/sample3.jpg' },
        { id: '2-2', text: 'Social Media Ad', image: '/samples/sample2.jpg' },
        { id: '2-3', text: 'TV Commercial', image: '/samples/sample1.jpg' },
        { id: '2-4', text: 'None of the above', image: null },
      ]
    },
    {
      id: '3',
      title: 'How did the ad make you feel about the brand?',
      type: 'Single Choice',
      kpi: 'Boost Brand Awareness',
      options: [
        { id: '3-1', text: 'Very positive' },
        { id: '3-2', text: 'Somewhat positive' },
        { id: '3-3', text: 'Neutral' },
        { id: '3-4', text: 'Somewhat negative' },
        { id: '3-5', text: 'Very negative' },
      ]
    },
    {
      id: '4',
      title: 'How likely are you to choose this brand over others based on the ad?',
      type: 'Single Choice',
      kpi: 'Grow Brand Preference',
      options: [
        { id: '4-1', text: 'Very likely' },
        { id: '4-2', text: 'Somewhat likely' },
        { id: '4-3', text: 'Neutral' },
        { id: '4-4', text: 'Somewhat unlikely' },
        { id: '4-5', text: 'Very unlikely' },
      ]
    },
    {
      id: '5',
      title: 'What would be your next step after seeing this ad?',
      type: 'Single Choice',
      kpi: 'Motivate Action',
      options: [
        { id: '5-1', text: 'Look up more information about the product' },
        { id: '5-2', text: 'Visit the brand website' },
        { id: '5-3', text: 'Follow the brand on social media' },
        { id: '5-4', text: 'Consider purchasing the product' },
        { id: '5-5', text: 'Nothing/continue browsing' },
      ]
    }
  ]);

  const [newQuestion, setNewQuestion] = useState({
    title: '',
    type: 'Multiple Choice' as 'Multiple Choice' | 'Single Choice',
    options: [{ id: '1', text: '', image: null as string | null }]
  });
  
  const [questionKpi, setQuestionKpi] = useState('Boost Brand Awareness');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [giphySearchTerm, setGiphySearchTerm] = useState('');
  const [giphyResults, setGiphyResults] = useState<GiphyResult[]>([]);
  const [showGiphyModal, setShowGiphyModal] = useState(false);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  
  // Add a new option to the question
  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [
        ...newQuestion.options,
        { id: (newQuestion.options.length + 1).toString(), text: '', image: null as string | null }
      ]
    });
  };
  
  // Remove an option from the question
  const removeOption = (id: string) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter(option => option.id !== id)
    });
  };
  
  // Update option text
  const updateOptionText = (id: string, text: string) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.map(option => 
        option.id === id ? { ...option, text } : option
      )
    });
  };
  
  // Open Giphy modal for an option
  const openGiphyModal = (index: number) => {
    setCurrentOptionIndex(index);
    setShowGiphyModal(true);
    if (giphyResults.length === 0) {
      searchGiphy('happy'); // Default search to show some initial results
    }
  };
  
  // Search Giphy API
  const searchGiphy = async (term: string) => {
    if (!term.trim()) return;
    
    setIsSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(term)}&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch GIFs');
      }
      
      const data = await response.json();
      setGiphyResults(data.data);
    } catch (error) {
      console.error('Error searching Giphy:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Select a GIF for the current option
  const selectGif = (gifUrl: string) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.map((option, index) => 
        index === currentOptionIndex ? { ...option, image: gifUrl } : option
      )
    });
    setShowGiphyModal(false);
  };
  
  const handlePreview = () => {
    router.push(`/brand-lift/survey-preview?id=${campaignId}`);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.title) {
      alert('Please add a question title');
      return;
    }
    
    if (newQuestion.options.length < 2) {
      alert('Please add at least two answer options');
      return;
    }
    
    const newQuestionWithId = {
      id: (questions.length + 1).toString(),
      title: newQuestion.title,
      type: newQuestion.type,
      kpi: questionKpi,
      options: newQuestion.options.map(option => ({
        id: option.id,
        text: option.text || 'Option',
        image: option.image
      }))
    };
    
    setQuestions([...questions, newQuestionWithId]);
    
    // Reset form
    setNewQuestion({
      title: '',
      type: 'Multiple Choice',
      options: [{ id: '1', text: '', image: null as string | null }]
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-[var(--background-color)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Sora'] text-[var(--primary-color)]">Brand Lift</h1>
        <p className="mt-2 text-[var(--secondary-color)] font-['Work_Sans']">
          Design your survey questions to measure brand lift metrics
        </p>
      </div>

      {/* Question Builder */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 font-['Sora'] text-[var(--primary-color)]">Question Builder</h2>
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[var(--secondary-color)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="text" 
              className="w-full pl-10 p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)]" 
              placeholder="Search a design question"
            />
          </div>
          
          {/* Question Title */}
          <div className="mb-4">
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)]">Question Title</label>
              <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)]">Question type</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <input 
                  type="text" 
                  className="w-full p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)]" 
                  placeholder="Type the question title here"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                />
              </div>
              <div>
                <div className="relative">
                  <select 
                    className="w-full p-2 border border-[var(--divider-color)] rounded-md appearance-none font-['Work_Sans'] text-[var(--primary-color)]"
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as 'Multiple Choice' | 'Single Choice'})}
                  >
                    <option>Multiple Choice</option>
                    <option>Single Choice</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-[var(--secondary-color)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)]">Answer Options</label>
            {newQuestion.options.map((option, index) => (
              <div key={option.id} className="mb-3">
                <div className="flex mb-2">
                  <input 
                    type="text" 
                    className="flex-grow p-2 border border-[var(--divider-color)] rounded-l-md font-['Work_Sans'] text-[var(--primary-color)]" 
                    placeholder="Type your answer"
                    value={option.text}
                    onChange={(e) => updateOptionText(option.id, e.target.value)}
                  />
                  <button 
                    className="bg-gray-200 text-[var(--secondary-color)] px-4 py-2 border-t border-r border-b border-[var(--divider-color)] hover:bg-gray-300 flex items-center justify-center"
                    onClick={() => openGiphyModal(index)}
                  >
                    <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                    </svg>
                    Add Image/GIF
                  </button>
                  <button 
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-r-md hover:bg-red-200 flex items-center justify-center border-t border-r border-b border-[var(--divider-color)]"
                    onClick={() => removeOption(option.id)}
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {option.image && (
                  <div className="relative w-24 h-24 mb-2">
                    <Image 
                      src={option.image} 
                      alt={option.text || 'Answer option'} 
                      width={96}
                      height={96}
                      className="rounded-md object-cover w-full h-full"
                    />
                    <button 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={() => updateOptionText(option.id, option.text)}
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button 
              className="px-4 py-2 border border-[var(--divider-color)] rounded-md text-[var(--primary-color)] font-medium font-['Work_Sans'] hover:bg-gray-50 mt-2 flex items-center"
              onClick={addOption}
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Option
            </button>
          </div>

          {/* Predicted KPI */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)]">Predicted KPI</label>
            <select 
              className="w-full p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)]"
              value={questionKpi}
              onChange={(e) => setQuestionKpi(e.target.value)}
            >
              <option>Boost Brand Awareness</option>
              <option>Maximize Ad Recall</option>
              <option>Grow Brand Preference</option>
              <option>Motivate Action</option>
            </select>
          </div>

          {/* Settings */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 font-['Work_Sans'] text-[var(--primary-color)]">Settings</label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)]" />
                <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans']">Randomize</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)]" />
                <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans']">Non-forced choice</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button className="flex-1 py-2 bg-red-500 text-white rounded-md font-medium font-['Work_Sans'] hover:bg-red-600 transition-colors flex items-center justify-center">
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear Form
            </button>
            <button 
              onClick={handleAddQuestion}
              className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              Add question
            </button>
          </div>
        </div>
      </div>

      {/* Configure Your Survey */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 font-['Sora'] text-[var(--primary-color)]">Configure Your Survey</h2>
        <div className="mb-4">
          <h3 className="text-md font-medium font-['Work_Sans'] text-[var(--primary-color)]">Recommended survey questions</h3>
          <p className="text-sm text-[var(--secondary-color)] font-['Work_Sans']">
            These recommended questions are designed to help you assess the ad's impact on key metrics: <span className="font-medium">Boost Brand Awareness, Maximize Ad Recall, Grow Brand Preference, and Motivate Action</span>.
          </p>
        </div>
        
        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="border border-[var(--divider-color)] rounded-lg overflow-hidden">
              <div className="flex items-center p-4 border-b border-[var(--divider-color)] bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center">
                    <button className="mr-4 text-[var(--secondary-color)]">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button className="mr-4 text-[var(--secondary-color)]">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div>
                      <div className="text-sm text-[var(--accent-color)] font-['Work_Sans']">
                        {question.kpi} • {question.options.length} Options
                      </div>
                      <h4 className="font-medium text-[var(--primary-color)] font-['Work_Sans']">{question.title}</h4>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-[var(--secondary-color)]">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              
              {index === 0 && (
                <div className="p-4 bg-white">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans']">Question Title</div>
                      <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans']">Question type</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <input 
                          type="text" 
                          className="w-full p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)]" 
                          value={question.title}
                          readOnly
                        />
                      </div>
                      <div>
                        <div className="relative">
                          <select 
                            className="w-full p-2 border border-[var(--divider-color)] rounded-md appearance-none font-['Work_Sans'] text-[var(--primary-color)]"
                            value={question.type}
                            disabled
                          >
                            <option>Single Choice</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-[var(--secondary-color)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Answer Images */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {question.options.map((option) => (
                      <div key={option.id} className="relative">
                        {option.image && (
                          <div className="aspect-w-1 aspect-h-1 mb-2 border border-[var(--divider-color)] rounded-md overflow-hidden">
                            <Image 
                              src={option.image} 
                              alt={option.text} 
                              width={120}
                              height={120}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name={`question_${question.id}`} 
                            className="form-radio h-4 w-4 text-[var(--accent-color)]" 
                          />
                          <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans']">{option.text}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Settings */}
                  <div className="mt-4">
                    <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans'] mb-2">Settings</div>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)]" checked readOnly />
                        <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans']">Randomization</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)]" checked readOnly />
                        <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans']">Mandatory status</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Bottom Buttons */}
                  <div className="flex justify-end mt-4 space-x-2">
                    <button className="px-4 py-2 border border-[var(--divider-color)] bg-white text-[var(--primary-color)] rounded font-medium font-['Work_Sans'] text-sm hover:bg-gray-50">
                      Edit
                    </button>
                    <button className="px-4 py-2 border border-[var(--divider-color)] bg-white text-[var(--primary-color)] rounded font-medium font-['Work_Sans'] text-sm hover:bg-gray-50">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Submit Buttons */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handlePreview}
            className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity"
          >
            Preview & Submit
          </button>
        </div>
      </div>

      {/* Giphy Search Modal */}
      {showGiphyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-[var(--divider-color)]">
              <h3 className="text-lg font-semibold font-['Sora'] text-[var(--primary-color)]">Select a GIF</h3>
            </div>
            
            <div className="p-4 border-b border-[var(--divider-color)]">
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-grow p-2 border border-[var(--divider-color)] rounded-l-md font-['Work_Sans'] text-[var(--primary-color)]"
                  placeholder="Search for GIFs..."
                  value={giphySearchTerm}
                  onChange={(e) => setGiphySearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchGiphy(giphySearchTerm)}
                />
                <button 
                  className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-r-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity"
                  onClick={() => searchGiphy(giphySearchTerm)}
                >
                  Search
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {isSearching ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
                </div>
              ) : giphyResults.length === 0 ? (
                <div className="text-center py-10 text-[var(--secondary-color)] font-['Work_Sans']">
                  {giphySearchTerm ? 'No results found. Try a different search term.' : 'Search for GIFs to display results.'}
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {giphyResults.map((gif) => (
                    <div 
                      key={gif.id} 
                      className="cursor-pointer border border-[var(--divider-color)] rounded-md overflow-hidden hover:border-[var(--accent-color)]"
                      onClick={() => selectGif(gif.images.original.url)}
                    >
                      <img 
                        src={gif.images.fixed_height.url} 
                        alt={gif.title}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[var(--divider-color)] flex justify-between">
              <button 
                className="px-4 py-2 border border-[var(--divider-color)] bg-white text-[var(--primary-color)] rounded font-medium font-['Work_Sans'] text-sm hover:bg-gray-50"
                onClick={() => setShowGiphyModal(false)}
              >
                Cancel
              </button>
              <div className="text-sm text-[var(--secondary-color)] font-['Work_Sans'] flex items-center">
                Powered by GIPHY
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 