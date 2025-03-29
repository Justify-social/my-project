import React, { useRef, useEffect } from 'react';
import { cn } from '@/utils/string/utils';
import { CommandMenuSearchProps } from './types';

/**
 * Search input component for the CommandMenu
 */
export function CommandMenuSearch({
  searchTerm,
  onSearchChange,
  placeholder = 'Search commands...',
  shortcut = '⌘K'
}: CommandMenuSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full py-2 pl-10 pr-4 text-sm bg-white dark:bg-gray-800",
            "border border-gray-300 dark:border-gray-600 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          )}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          autoCapitalize="off"
        />
        
        {shortcut && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded">
              {shortcut}
            </kbd>
          </span>
        )}
      </div>
    </div>
  );
}

export default CommandMenuSearch; 