'use client';

import React, { useState } from 'react';

interface LocationSelectorProps {
  selectedLocations: string[];
  onChange: (locations: string[]) => void;
}

export default function LocationSelector({ selectedLocations, onChange }: LocationSelectorProps) {
  const [query, setQuery] = useState("");
  const allLocations = [
    "London",
    "Manchester",
    "Birmingham",
    "Glasgow",
    "Liverpool",
    "Leeds",
    "Sheffield",
    "Bristol",
  ];
  
  const filtered = allLocations.filter(
    (loc) =>
      loc.toLowerCase().includes(query.toLowerCase()) &&
      !selectedLocations.includes(loc)
  );
  
  return (
    <div className="mb-4 relative">
      <label className="block font-semibold mb-1">Location</label>
      <input
        type="text"
        placeholder="Search by City, State, Region or Country"
        className="w-full p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Location search"
      />
      {query && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 list-none">
          {filtered.map((loc) => (
            <li
              key={loc}
              onClick={() => {
                onChange([...selectedLocations, loc]);
                setQuery("");
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              role="option"
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedLocations.map((loc) => (
          <span key={loc} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
            {loc}
            <button
              type="button"
              onClick={() =>
                onChange(selectedLocations.filter((l) => l !== loc))
              }
              className="ml-2 text-red-500"
              aria-label={`Remove ${loc}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
} 