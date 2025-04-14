'use client';

import React from 'react';

interface LanguagesSelectorProps {
  selected: string[];
  onChange: (langs: string[]) => void;
}

export default function LanguagesSelector({ selected, onChange }: LanguagesSelectorProps) {
  const languages = ['English', 'Spanish', 'French', 'German', 'Mandarin'];

  return (
    <div className="mb-4 font-body">
      <label className="block font-semibold mb-1 font-body">Select language</label>
      <select
        multiple
        value={selected}
        onChange={e => {
          const selectedOptions = Array.from(e.target.selectedOptions).map(o => o.value);
          onChange(selectedOptions);
        }}
        className="w-full p-2 border rounded font-body"
        aria-label="Select languages"
      >
        {languages.map(lang => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}
