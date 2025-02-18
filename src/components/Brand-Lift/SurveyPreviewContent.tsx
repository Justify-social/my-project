"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  id: string;
  type: 'multiple_choice' | 'scale' | 'open_ended';
  text: string;
  options?: string[];
}

export default function SurveyPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('survey');

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions: Question[] = [
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
  ];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    // Save survey responses logic here
    router.push('/brand-lift/survey-design');
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Survey Preview</h1>
            <span className="text-gray-600">
              Question {currentStep + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-medium mb-4">{currentQuestion.text}</h2>

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 text-gray-700">{option}</label>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'scale' && (
            <div className="flex justify-between items-center mt-4">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(currentQuestion.id, num.toString())}
                  className={`w-10 h-10 rounded-full border ${
                    answers[currentQuestion.id] === num.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  } flex items-center justify-center`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'open_ended' && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded"
              rows={4}
              placeholder="Enter your answer here..."
            />
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded ${
              currentStep === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          {currentStep === questions.length - 1 ? (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Finish
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 