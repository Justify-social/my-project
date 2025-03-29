import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/string/utils';
import { Command, CommandGroup, CommandMenuProps } from './types';
import CommandMenuSearch from './CommandMenuSearch';
import CommandMenuList from './CommandMenuList';

/**
 * CommandMenu component for keyboard-driven navigation
 * Implements a command palette similar to CMD+K or Ctrl+K interfaces
 */
export function CommandMenu({
  isOpen,
  onOpen,
  onClose,
  commandGroups = [],
  placeholder = 'Search commands...',
  shortcut = '⌘K',
  width = 'md',
  className,
  children,
}: CommandMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Reset search and selection when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : onOpen();
      }
      
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpen, onClose]);

  // Handle command selection
  const handleCommandSelect = useCallback((command: Command) => {
    onClose();
    command.onSelect();
  }, [onClose]);

  // Handle background click
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Prevent clicks inside the menu from closing it
  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Width class mapping
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-4xl'
  };

  if (!mounted) return null;
  
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-16 sm:pt-24"
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "w-full mx-4",
          widthClasses[width],
          "bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700",
          "transform transition-all",
          "animate-in fade-in slide-in-from-top-10 duration-300",
          className
        )}
        onClick={handleMenuClick}
      >
        {/* Optional children or default search/list UI */}
        {children || (
          <>
            <CommandMenuSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder={placeholder}
              shortcut={shortcut}
            />
            
            <CommandMenuList
              commandGroups={commandGroups}
              searchTerm={searchTerm}
              selectedIndex={selectedIndex}
              onSelectedIndexChange={setSelectedIndex}
              onSelect={handleCommandSelect}
            />
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// Export components
export { CommandMenuSearch } from './CommandMenuSearch';
export { CommandMenuList } from './CommandMenuList';

// Export types
export * from './types';

export default CommandMenu; 