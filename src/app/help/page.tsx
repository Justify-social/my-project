"use client";

import React, { useState } from "react";

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Help Center</h1>
      
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-blue-600 hover:underline">Platform Overview</a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">Account Setup</a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">First Campaign</a>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Campaigns</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-blue-600 hover:underline">Create a Campaign</a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">Campaign Settings</a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">Performance Metrics</a>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Account Management</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-blue-600 hover:underline">Billing & Subscriptions</a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">Team Settings</a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">API Access</a>
            </li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">How do I create my first campaign?</h3>
            <p className="text-gray-600">Navigate to the Campaigns section and click on "New Campaign". Follow our step-by-step wizard to set up your campaign.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">How do I invite team members?</h3>
            <p className="text-gray-600">Go to Settings > Team Members and click "Invite". Enter their email address and select their role.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">How do I access my billing history?</h3>
            <p className="text-gray-600">Visit the Billing section in your account settings to view all past invoices and update payment methods.</p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
        <p className="mb-4">Our support team is available 24/7 to assist you with any questions.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default HelpPage;
