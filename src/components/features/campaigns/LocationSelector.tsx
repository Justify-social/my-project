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
  "Bristol"];


  const filtered = allLocations.filter(
    (loc) =>
    loc.toLowerCase().includes(query.toLowerCase()) &&
    !selectedLocations.includes(loc)
  );

  return (
    <div className="mb-4 relative font-work-sans">
      <label className="block font-semibold mb-1 font-work-sans">Location</label>
      <input
        type="text"
        placeholder="Search by City, State, Region or Country"
        className="w-full p-2 border rounded font-work-sans"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Location search" />

      {query && filtered.length > 0 &&
      <ul className="absolute z-10 bg-white border w-full mt-1 list-none font-work-sans">
          {filtered.map((loc) =>
        <li
          key={loc}
          onClick={() => {
            onChange([...selectedLocations, loc]);
            setQuery("");
          }}
          className="p-2 hover:bg-gray-100 cursor-pointer font-work-sans"
          role="option">

              {loc}
            </li>
        )}
        </ul>
      }
      <div className="mt-2 flex flex-wrap gap-2 font-work-sans">
        {selectedLocations.map((loc) =>
        <span key={loc} className="bg-gray-200 px-3 py-1 rounded-full flex items-center font-work-sans">
            {loc}
            <button
            type="button"
            onClick={() =>
            onChange(selectedLocations.filter((l) => l !== loc))
            }
            className="ml-2 text-red-500 font-work-sans"
            aria-label={`Remove ${loc}`}>

              ×
            </button>
          </span>
        )}
      </div>
    </div>);

}