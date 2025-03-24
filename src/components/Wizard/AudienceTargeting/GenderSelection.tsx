'use client';

import React from 'react';

interface GenderSelectionProps {
  selected: string[];
  otherGender: string;
  onChange: (genders: string[]) => void;
  onOtherChange: (val: string) => void;
}

export default function GenderSelection({
  selected,
  otherGender,
  onChange,
  onOtherChange
}: GenderSelectionProps) {
  return (
    <div className="mb-4 font-work-sans">
      <label className="block font-semibold mb-1 font-work-sans">
        Choose one or more gender identities
      </label>
      <div role="group" className="flex items-center space-x-4 font-work-sans">
        {["Male", "Female", "Other"].map((g) =>
        <label key={g} className="inline-flex items-center font-work-sans">
            <input
            type="checkbox"
            name="gender"
            value={g}
            checked={selected.includes(g)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, g]);
              } else {
                onChange(selected.filter((val) => val !== g));
              }
            }}
            className="mr-1 font-work-sans" />

            {g}
          </label>
        )}
      </div>
      {selected.includes("Other") &&
      <div className="mt-2 font-work-sans">
          <input
          type="text"
          value={otherGender}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify"
          className="w-full p-2 border rounded font-work-sans"
          aria-label="Specify other gender" />

        </div>
      }
    </div>);

}