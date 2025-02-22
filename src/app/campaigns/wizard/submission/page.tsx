"use client";

import React from 'react';
import Link from 'next/link';

const SubmissionPage = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Success Message */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Submission
        </h1>
        <p className="text-xl text-gray-600">
          Your campaign has been submitted successfully!
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Lift Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Set Up Brand Lift Study
          </h2>
          <p className="text-gray-600 mb-8 h-24">
            Measure how your campaign impacts brand awareness and consumer behavior with a Brand Lift Study.
          </p>
          <Link 
            href="/brand-lift" 
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg text-center transition-colors duration-200"
          >
            Set Up
          </Link>
        </div>

        {/* Creative Testing Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Start Creative Asset Testing
          </h2>
          <p className="text-gray-600 mb-8 h-24">
            Test your creative assets to see how they perform and resonate with your audience.
          </p>
          <Link 
            href="/creative-testing" 
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg text-center transition-colors duration-200"
          >
            Start Testing
          </Link>
        </div>

        {/* Dashboard Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            View Campaign Dashboard
          </h2>
          <p className="text-gray-600 mb-8 h-24">
            Access detailed insights and performance metrics for your campaign.
          </p>
          <Link 
            href="/campaigns" 
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg text-center transition-colors duration-200"
          >
            View Campaign
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
