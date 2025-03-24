'use client';

import React, { useState } from 'react';

interface CompetitorTrackingProps {
  selected: string[];
  onChange: (companies: string[]) => void;
}

export default function CompetitorTracking({ selected, onChange }: CompetitorTrackingProps) {
  const [query, setQuery] = useState("");
  const allCompanies = [
  "Company Name 1",
  "Company Name 2",
  "Company Name 3",
  "Company Name 4"];


  const filtered = allCompanies.filter(
    (comp) =>
    comp.toLowerCase().includes(query.toLowerCase()) && !selected.includes(comp)
  );

  return (
    <div className="mb-4 relative font-work-sans">
      <label className="block font-semibold mb-1 font-work-sans">Search Companies</label>
      <input
        type="text"
        placeholder="Type to search companies (comma separated)"
        className="w-full p-2 border rounded font-work-sans"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Competitor search" />

      {query && filtered.length > 0 &&
      <ul className="absolute z-10 bg-white border w-full mt-1 list-none font-work-sans">
          {filtered.map((comp) =>
        <li
          key={comp}
          onClick={() => {
            onChange([...selected, comp]);
            setQuery("");
          }}
          className="p-2 hover:bg-gray-100 cursor-pointer font-work-sans">

              {comp}
            </li>
        )}
        </ul>
      }
      <div className="mt-2 flex flex-wrap gap-2 font-work-sans">
        {selected.map((comp) =>
        <span key={comp} className="bg-gray-200 px-3 py-1 rounded-full flex items-center font-work-sans">
            {comp}
            <button
            type="button"
            onClick={() => onChange(selected.filter((c) => c !== comp))}
            className="ml-2 text-red-500 font-work-sans"
            aria-label={`Remove ${comp}`}>

              ×
            </button>
          </span>
        )}
      </div>
    </div>);

}