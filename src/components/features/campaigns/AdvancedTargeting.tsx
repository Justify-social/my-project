'use client';

import React from 'react';
// import { Field, ErrorMessage } from 'formik'; // Commented out due to missing module error

export default function AdvancedTargeting() {
  return (
    <div className="border p-4 rounded mb-4 font-body">
      <h2 className="text-xl font-bold mb-2 font-heading">Advanced Targeting</h2>
      <div className="mb-4 font-body">
        <label htmlFor="educationLevel" className="block font-semibold mb-1 font-body">
          Education Level
        </label>
        {/* Commented out Formik Field due to missing module error */}
        <select id="educationLevel" className="w-full p-2 border rounded" disabled>
          <option value="">Select Education Level</option>
          <option value="High School">High School</option>
          <option value="College">College</option>
          <option value="University">University</option>
          <option value="Postgraduate">Postgraduate</option>
        </select>
        {/* <ErrorMessage name="educationLevel" component="div" className="text-red-600 text-sm font-body" /> */}
      </div>
      <div className="mb-4 font-body">
        <label htmlFor="jobTitles" className="block font-semibold mb-1 font-body">
          Job Titles
        </label>
        {/* Commented out Formik Field due to missing module error */}
        <input id="jobTitles" placeholder="Type to search job titles" className="w-full p-2 border rounded" disabled />
        {/* <ErrorMessage name="jobTitles" component="div" className="text-red-600 text-sm font-body" /> */}
      </div>
      <div className="mb-4 font-body">
        <label className="block font-semibold mb-1 font-body">Income Level</label>
        <div role="group" className="flex items-center space-x-4 font-body">
          {['$10,000', '$20,000', '$30,000'].map(inc => (
            <label key={inc} className="inline-flex items-center font-body">
              <input type="radio" disabled />
              <span className="ml-2 font-body">{inc}</span>
            </label>
          ))}
        </div>
        {/* <ErrorMessage name="incomeLevel" component="div" className="text-red-600 text-sm font-body" /> */}
      </div>
    </div>
  );
}
