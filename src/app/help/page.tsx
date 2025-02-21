'use client';

import React, { useState } from "react";

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-4">Justify Help Center</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table of Contents */}
      <nav className="mb-8">
        <ul className="flex flex-wrap gap-4">
          <li>
            <a href="#getting-started" className="text-blue-600 hover:underline">
              Getting Started
            </a>
          </li>
          <li>
            <a href="#faqs" className="text-blue-600 hover:underline">
              FAQs
            </a>
          </li>
          <li>
            <a href="#tutorials" className="text-blue-600 hover:underline">
              Tutorials
            </a>
          </li>
          <li>
            <a href="#troubleshooting" className="text-blue-600 hover:underline">
              Troubleshooting
            </a>
          </li>
          <li>
            <a href="#glossary" className="text-blue-600 hover:underline">
              Glossary
            </a>
          </li>
          <li>
            <a href="#contact-support" className="text-blue-600 hover:underline">
              Contact Support
            </a>
          </li>
          <li>
            <a href="#feedback" className="text-blue-600 hover:underline">
              Feedback
            </a>
          </li>
        </ul>
      </nav>

      {/* Sections */}
      <section id="getting-started" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Getting Started</h2>
        <p className="mb-2">
          Welcome to Justify! Follow these steps to get set up:
        </p>
        <ol className="list-decimal list-inside">
          <li>Sign up or log in to your account.</li>
          <li>Complete your profile and company details.</li>
          <li>Take the guided tour of your dashboard.</li>
          <li>Create your first campaign using the Campaign Wizard.</li>
        </ol>
      </section>

      <section id="faqs" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Frequently Asked Questions</h2>
        <ul className="list-disc list-inside">
          <li>
            <strong>How do I reset my password?</strong> – Click "Forgot Password" on the login page.
          </li>
          <li>
            <strong>Where can I view my campaign results?</strong> – Navigate to your dashboard and select "Reports."
          </li>
          <li>
            <strong>How do I contact support?</strong> – See the Contact Support section below.
          </li>
        </ul>
      </section>

      <section id="tutorials" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Tutorials & Video Guides</h2>
        <p className="mb-2">
          Watch our short video guides to learn more:
        </p>
        <ul className="list-disc list-inside">
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Introduction to Justify
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              How to Create a Campaign
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Navigating Your Dashboard
            </a>
          </li>
        </ul>
      </section>

      <section id="troubleshooting" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Troubleshooting Guides</h2>
        <p className="mb-2">
          Here are some common solutions:
        </p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Dashboard not loading:</strong> Refresh the page or clear your cache.
          </li>
          <li>
            <strong>Error messages:</strong> Refer to the error code in our FAQ or contact support.
          </li>
          <li>
            <strong>Login issues:</strong> Verify your credentials or reset your password.
          </li>
        </ul>
      </section>

      <section id="glossary" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Glossary of Terms</h2>
        <dl className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div>
            <dt className="font-bold">Campaign</dt>
            <dd>A coordinated marketing effort to promote a product or service.</dd>
          </div>
          <div>
            <dt className="font-bold">Brand Lift</dt>
            <dd>The improvement in brand perception after a campaign.</dd>
          </div>
          <div>
            <dt className="font-bold">Influencer</dt>
            <dd>A person with influence over potential buyers through their expertise or social reach.</dd>
          </div>
          <div>
            <dt className="font-bold">Dashboard</dt>
            <dd>The central interface for monitoring your campaign performance.</dd>
          </div>
        </dl>
      </section>

      <section id="contact-support" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Contact Support</h2>
        <p className="mb-2">
          Need further assistance? Fill out the form below or email{" "}
          <a href="mailto:support@justify.social" className="text-blue-600 hover:underline">
            support@justify.social
          </a>
          .
        </p>
        <form className="mt-4 space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            ></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Submit
          </button>
        </form>
      </section>

      <section id="feedback" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Feedback</h2>
        <p className="mb-2">
          Your feedback helps us improve. Let us know how we can make Justify better.
        </p>
        <form className="mt-4 space-y-4">
          <div>
            <label className="block mb-1 font-medium">Your Feedback</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            ></textarea>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Send Feedback
          </button>
        </form>
      </section>
    </div>
  );
};

export default HelpPage;
