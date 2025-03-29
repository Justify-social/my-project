import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/utils/string/utils';
import { Command, CommandGroup, CommandMenuListProps } from './types';

/**
 * List component for the CommandMenu that displays filtered commands
 */
export function CommandMenuList({
  commandGroups,
  searchTerm,
  selectedIndex,
  onSelect,
  onSelectedIndexChange
}: CommandMenuListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Filter commands based on search term
  const filteredGroups = searchTerm 
    ? commandGroups
        .map(group => ({
          ...group,
          commands: group.commands.filter(command => {
            const searchLower = searchTerm.toLowerCase();
            return (
              command.name.toLowerCase().includes(searchLower) ||
              (command.description?.toLowerCase().includes(searchLower)) ||
              (command.tags?.some(tag => tag.toLowerCase().includes(searchLower)))
            );
          })
        }))
        .filter(group => group.commands.length > 0)
    : commandGroups;

  // Flatten all commands for keyboard navigation
  const allCommands = filteredGroups.flatMap(group => group.commands);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Handler for keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!allCommands.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          onSelectedIndexChange((selectedIndex + 1) % allCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          onSelectedIndexChange((selectedIndex - 1 + allCommands.length) % allCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (allCommands[selectedIndex]) {
            onSelect(allCommands[selectedIndex]);
          }
          break;
      }
    },
    [allCommands, selectedIndex, onSelect, onSelectedIndexChange]
  );

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Helper to get the index of a command in the flattened array
  const getCommandIndex = (command: Command): number => {
    return allCommands.findIndex(cmd => cmd.id === command.id);
  };

  if (filteredGroups.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400">
        No commands found for "{searchTerm}"
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[300px] py-2" ref={listRef}>
      {filteredGroups.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="mb-4 last:mb-0">
          <div className="px-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {group.title}
          </div>
          <div className="space-y-1">
            {group.commands.map(command => {
              const commandIndex = getCommandIndex(command);
              const isSelected = commandIndex === selectedIndex;
              
              return (
                <button
                  key={command.id}
                  ref={isSelected ? selectedRef : null}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2",
                    isSelected 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                  )}
                  onClick={() => onSelect(command)}
                  onMouseEnter={() => onSelectedIndexChange(commandIndex)}
                >
                  {command.icon && (
                    <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {typeof command.icon === 'function' ? command.icon() : command.icon}
                    </span>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{command.name}</div>
                    {command.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {command.description}
                      </div>
                    )}
                  </div>
                  
                  {command.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded shrink-0">
                      {command.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommandMenuList; 