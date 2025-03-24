'use client';

import React, { useState } from 'react';

interface ScreeningQuestionsProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function ScreeningQuestions({
  selectedTags,
  onChange,
}: ScreeningQuestionsProps) {
  const [query, setQuery] = useState("");
  const tagSuggestions = ["Tag Suggestion 1", "Tag Suggestion 2", "Other"];
  
  const filtered = tagSuggestions.filter(
    (tag) =>
      tag.toLowerCase().includes(query.toLowerCase()) &&
      !selectedTags.includes(tag)
  );
  
  return (
    <div className="mb-4 relative">
      <label className="block font-semibold mb-1">
        Search Screening Questions
      </label>
      <input
        type="text"
        placeholder="Type to search screening questions"
        className="w-full p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Screening questions search"
      />
      {query && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 list-none">
          {filtered.map((tag) => (
            <li
              key={tag}
              onClick={() => {
                onChange([...selectedTags, tag]);
                setQuery("");
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span key={tag} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
            {tag}
            <button
              type="button"
              onClick={() => onChange(selectedTags.filter((t) => t !== tag))}
              className="ml-2 text-red-500"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
} 