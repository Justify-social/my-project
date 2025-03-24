'use client';

import React, { useState } from 'react';

interface ScreeningQuestionsProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function ScreeningQuestions({
  selectedTags,
  onChange
}: ScreeningQuestionsProps) {
  const [query, setQuery] = useState("");
  const tagSuggestions = ["Tag Suggestion 1", "Tag Suggestion 2", "Other"];

  const filtered = tagSuggestions.filter(
    (tag) =>
    tag.toLowerCase().includes(query.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  return (
    <div className="mb-4 relative font-work-sans">
      <label className="block font-semibold mb-1 font-work-sans">
        Search Screening Questions
      </label>
      <input
        type="text"
        placeholder="Type to search screening questions"
        className="w-full p-2 border rounded font-work-sans"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Screening questions search" />

      {query && filtered.length > 0 &&
      <ul className="absolute z-10 bg-white border w-full mt-1 list-none font-work-sans">
          {filtered.map((tag) =>
        <li
          key={tag}
          onClick={() => {
            onChange([...selectedTags, tag]);
            setQuery("");
          }}
          className="p-2 hover:bg-gray-100 cursor-pointer font-work-sans">

              {tag}
            </li>
        )}
        </ul>
      }
      <div className="mt-2 flex flex-wrap gap-2 font-work-sans">
        {selectedTags.map((tag) =>
        <span key={tag} className="bg-gray-200 px-3 py-1 rounded-full flex items-center font-work-sans">
            {tag}
            <button
            type="button"
            onClick={() => onChange(selectedTags.filter((t) => t !== tag))}
            className="ml-2 text-red-500 font-work-sans"
            aria-label={`Remove ${tag}`}>

              ×
            </button>
          </span>
        )}
      </div>
    </div>);

}