'use client';

import React from 'react';
import { Field, ErrorMessage } from 'formik';

export default function AdvancedTargeting() {
  return (
    <div className="border p-4 rounded mb-4 font-work-sans">
      <h2 className="text-xl font-bold mb-2 font-sora">Advanced Targeting</h2>
      <div className="mb-4 font-work-sans">
        <label htmlFor="educationLevel" className="block font-semibold mb-1 font-work-sans">
          Education Level
        </label>
        <Field
          as="select"
          id="educationLevel"
          name="educationLevel"
          className="w-full p-2 border rounded">

          <option value="">Select Education Level</option>
          <option value="High School">High School</option>
          <option value="College">College</option>
          <option value="University">University</option>
          <option value="Postgraduate">Postgraduate</option>
        </Field>
        <ErrorMessage name="educationLevel" component="div" className="text-red-600 text-sm font-work-sans" />
      </div>
      <div className="mb-4 font-work-sans">
        <label htmlFor="jobTitles" className="block font-semibold mb-1 font-work-sans">
          Job Titles
        </label>
        <Field
          id="jobTitles"
          name="jobTitles"
          placeholder="Type to search job titles"
          className="w-full p-2 border rounded" />

        <ErrorMessage name="jobTitles" component="div" className="text-red-600 text-sm font-work-sans" />
      </div>
      <div className="mb-4 font-work-sans">
        <label className="block font-semibold mb-1 font-work-sans">Income Level</label>
        <div role="group" className="flex items-center space-x-4 font-work-sans">
          {["$10,000", "$20,000", "$30,000"].map((inc) =>
          <label key={inc} className="inline-flex items-center font-work-sans">
              <Field type="radio" name="incomeLevel" value={inc} />
              <span className="ml-2 font-work-sans">{inc}</span>
            </label>
          )}
        </div>
        <ErrorMessage name="incomeLevel" component="div" className="text-red-600 text-sm font-work-sans" />
      </div>
    </div>);

}