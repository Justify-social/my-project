"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  id: string;
  type: 'multiple_choice' | 'scale' | 'open_ended';
  text: string;
  options?: string[];
}

export default function SurveyDesignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('survey');

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'multiple_choice',
      text: 'How familiar are you with our brand?',
      options: ['Very familiar', 'Somewhat familiar', 'Not familiar'],
    },
    {
      id: '2',
      type: 'scale',
      text: 'How likely are you to recommend our product?',
    },
    {
      id: '3',
      type: 'open_ended',
      text: 'What aspects of our brand stand out to you?',
    },
  ]);

  const handlePreview = () => {
    router.push(`/brand-lift/survey-preview?survey=${surveyId}`);
  };

  const handleSave = () => {
    // Save logic here
    router.push('/brand-lift/survey-approval');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Survey Design</h1>
          <div className="space-x-4">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">{question.text}</h3>
                  <span className="text-sm text-gray-500 capitalize">
                    Type: {question.type.replace('_', ' ')}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Edit question</span>
                  ✏️
                </button>
              </div>

              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        className="h-4 w-4 text-blue-600"
                        disabled
                      />
                      <label className="ml-2 text-gray-700">{option}</label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'scale' && (
                <div className="flex justify-between items-center mt-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      disabled
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'open_ended' && (
                <textarea
                  className="w-full mt-2 p-2 border border-gray-300 rounded"
                  rows={3}
                  placeholder="Enter your answer here..."
                  disabled
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 