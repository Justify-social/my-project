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
  onOtherChange,
}: GenderSelectionProps) {
  return (
    <div className="mb-4 font-body">
      <label className="block font-semibold mb-1 font-body">
        Choose one or more gender identities
      </label>
      <div role="group" className="flex items-center space-x-4 font-body">
        {['Male', 'Female', 'Other'].map(g => (
          <label key={g} className="inline-flex items-center font-body">
            <input
              type="checkbox"
              name="gender"
              value={g}
              checked={selected.includes(g)}
              onChange={e => {
                if (e.target.checked) {
                  onChange([...selected, g]);
                } else {
                  onChange(selected.filter(val => val !== g));
                }
              }}
              className="mr-1 font-body"
            />

            {g}
          </label>
        ))}
      </div>
      {selected.includes('Other') && (
        <div className="mt-2 font-body">
          <input
            type="text"
            value={otherGender}
            onChange={e => onOtherChange(e.target.value)}
            placeholder="Please specify"
            className="w-full p-2 border rounded font-body"
            aria-label="Specify other gender"
          />
        </div>
      )}
    </div>
  );
}
