import React, { useEffect, useState, useRef, KeyboardEvent } from 'react';
import {
  Command,
  CommandGroup,
  CommandMenuProps,
} from './types';
import classNames from 'classnames';
import './command-menu.css';

const CommandMenu: React.FC<CommandMenuProps> = ({
  isOpen,
  onClose,
  commands = [],
  commandGroups,
  placeholder = 'Search commands...',
  position = 'center',
  appearance = 'default',
  size = 'md',
  className,
  inputClassName,
  commandClassName,
  maxResults = 10,
  showShortcuts = true,
  showIcons = true,
  showDescriptions = true,
  showGroups = true,
  closeOnSelect = true,
  emptyStateLabel = 'No results found',
  initialFilter = '',
  isDarkTheme = false,
  headerContent,
  footerContent,
  filterFunction,
}) => {
  const [searchValue, setSearchValue] = useState(initialFilter);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [groupedCommands, setGroupedCommands] = useState<CommandGroup[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);
  const activeCommandRef = useRef<HTMLDivElement>(null);

  // Default filter function if none provided
  const defaultFilterFunction = (command: Command, search: string) => {
    const searchLower = search.toLowerCase();
    return (
      command.name.toLowerCase().includes(searchLower) ||
      (command.description?.toLowerCase().includes(searchLower) || false) ||
      (command.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower)) || false)
    );
  };

  // Filter commands based on search input
  useEffect(() => {
    if (!isOpen) return;

    const filterFunc = filterFunction || defaultFilterFunction;
    
    if (commandGroups) {
      // Filter grouped commands
      const filtered = commandGroups.map(group => ({
        ...group,
        commands: group.commands.filter(command => filterFunc(command, searchValue)),
      })).filter(group => group.commands.length > 0);
      
      setGroupedCommands(filtered);

      // Create flattened list for keyboard navigation
      const flattenedCommands = filtered.flatMap(group => group.commands);
      setFilteredCommands(flattenedCommands.slice(0, maxResults));
    } else {
      // Filter flat list
      const filtered = commands.filter(command => filterFunc(command, searchValue));
      setFilteredCommands(filtered.slice(0, maxResults));

      // Group by command group property if showGroups is true
      if (showGroups) {
        const groups: Record<string, Command[]> = {};
        
        filtered.forEach(command => {
          const groupName = command.group || 'General';
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(command);
        });
        
        const newGroupedCommands = Object.entries(groups).map(([name, commands]) => ({
          name,
          commands,
        }));
        
        setGroupedCommands(newGroupedCommands);
      }
    }
    
    // Reset active index when search changes
    setActiveIndex(0);
  }, [searchValue, commands, commandGroups, isOpen, maxResults, showGroups, filterFunction]);

  // Focus input when component opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchValue(initialFilter);
    }
  }, [isOpen, initialFilter]);

  // Scroll active item into view
  useEffect(() => {
    if (activeCommandRef.current && commandListRef.current) {
      const activeCommand = activeCommandRef.current;
      const commandList = commandListRef.current;
      
      const activeTop = activeCommand.offsetTop;
      const activeBottom = activeTop + activeCommand.offsetHeight;
      const listTop = commandList.scrollTop;
      const listBottom = listTop + commandList.offsetHeight;
      
      if (activeTop < listTop) {
        commandList.scrollTop = activeTop;
      } else if (activeBottom > listBottom) {
        commandList.scrollTop = activeBottom - commandList.offsetHeight;
      }
    }
  }, [activeIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          executeCommand(filteredCommands[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Execute selected command
  const executeCommand = (command: Command) => {
    if (command.disabled) return;
    
    command.action();
    
    if (closeOnSelect) {
      onClose();
    }
  };

  // Render a command item
  const renderCommand = (command: Command, index: number) => {
    const isActive = index === activeIndex;
    const isDisabled = !!command.disabled;
    
    const commandItemClasses = classNames(
      'command-menu-item',
      {
        'command-menu-item-active': isActive,
        'command-menu-item-disabled': isDisabled,
      },
      commandClassName
    );
    
    // Use custom render function if provided
    if (command.renderItem) {
      return (
        <div
          key={command.id}
          className={commandItemClasses}
          onClick={() => executeCommand(command)}
          ref={isActive ? activeCommandRef : undefined}
        >
          {command.renderItem(command, isActive)}
        </div>
      );
    }
    
    return (
      <div
        key={command.id}
        className={commandItemClasses}
        onClick={() => executeCommand(command)}
        ref={isActive ? activeCommandRef : undefined}
      >
        {showIcons && command.icon && (
          <div className="command-menu-item-icon">
            <i className={`fa-light ${command.icon}`}></i>
          </div>
        )}
        
        <div className="command-menu-item-content">
          <div className="command-menu-item-name">{command.name}</div>
          {showDescriptions && command.description && (
            <div className="command-menu-item-description">{command.description}</div>
          )}
        </div>
        
        {showShortcuts && command.shortcut && (
          <div className="command-menu-item-shortcut">{command.shortcut}</div>
        )}
      </div>
    );
  };

  // If not open, don't render
  if (!isOpen) return null;

  const containerClasses = classNames(
    'command-menu-container',
    `command-menu-position-${position}`,
    `command-menu-appearance-${appearance}`,
    `command-menu-size-${size}`,
    {
      'command-menu-dark': isDarkTheme,
    },
    className
  );

  const inputClasses = classNames('command-menu-input', inputClassName);

  return (
    <div className="command-menu-overlay" onClick={onClose}>
      <div 
        className={containerClasses} 
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {headerContent && (
          <div className="command-menu-header">
            {headerContent}
          </div>
        )}
        
        <div className="command-menu-search">
          <div className="command-menu-search-icon">
            <i className="fa-light fa-search"></i>
          </div>
          <input
            ref={inputRef}
            type="text"
            className={inputClasses}
            placeholder={placeholder}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button 
              className="command-menu-clear-button"
              onClick={() => setSearchValue('')}
              aria-label="Clear search"
            >
              <i className="fa-light fa-times"></i>
            </button>
          )}
          
          <div className="command-menu-keyboard-hint">
            <kbd>↑</kbd> <kbd>↓</kbd> to navigate <kbd>↵</kbd> to select <kbd>esc</kbd> to close
          </div>
        </div>
        
        <div className="command-menu-divider"></div>
        
        <div className="command-menu-list" ref={commandListRef}>
          {(showGroups ? groupedCommands : [{ name: '', commands: filteredCommands }]).map((group, groupIndex) => (
            <div key={group.name || `group-${groupIndex}`} className="command-menu-group">
              {showGroups && group.name && (
                <div className="command-menu-group-header">
                  {group.headerContent || group.name}
                </div>
              )}
              
              <div className="command-menu-group-items">
                {group.commands.map((command, commandIndex) => {
                  // Calculate the overall index for active state
                  let overallIndex = 0;
                  if (showGroups) {
                    for (let i = 0; i < groupIndex; i++) {
                      overallIndex += groupedCommands[i].commands.length;
                    }
                    overallIndex += commandIndex;
                  } else {
                    overallIndex = commandIndex;
                  }
                  
                  return renderCommand(command, overallIndex);
                })}
              </div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="command-menu-empty-state">
              {emptyStateLabel}
            </div>
          )}
        </div>
        
        {footerContent && (
          <>
            <div className="command-menu-divider"></div>
            <div className="command-menu-footer">
              {footerContent}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommandMenu;
export * from './types'; 