"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SurveyApprovalContent() {
  const router = useRouter();
  const [selectedSurvey, setSelectedSurvey] = useState('');

  const surveys = [
    {
      id: '1',
      name: 'Summer Campaign Survey',
      status: 'Pending Approval',
      questions: 12,
      lastModified: '2024-02-18',
    },
    {
      id: '2',
      name: 'Product Launch Survey',
      status: 'Approved',
      questions: 15,
      lastModified: '2024-02-17',
    },
    {
      id: '3',
      name: 'Brand Awareness Survey',
      status: 'In Review',
      questions: 10,
      lastModified: '2024-02-16',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSurveySelect = (surveyId: string) => {
    setSelectedSurvey(surveyId);
    router.push(`/brand-lift/survey-design?survey=${surveyId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Survey Approval</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <div
            key={survey.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSurveySelect(survey.id)}
          >
            <h3 className="text-lg font-semibold mb-2">{survey.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(survey.status)}`}>
                  {survey.status}
                </span>
                <span className="text-gray-600">{survey.questions} Questions</span>
              </div>
              <div className="text-sm text-gray-500">
                Last modified: {survey.lastModified}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 