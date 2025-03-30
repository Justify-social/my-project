/**
 * CommandMenu Type Definitions
 */

import { ReactNode } from 'react';

export interface CommandMenuProps {
  /**
   * Additional CSS classes to apply to the component
   */
  className?: string;
  
  /**
   * Whether the command menu is open
   */
  isOpen: boolean;
  
  /**
   * Function to call when the command menu should be opened
   */
  onOpen: () => void;
  
  /**
   * Function to call when the command menu should be closed
   */
  onClose: () => void;
  
  /**
   * Array of command groups to display in the menu
   */
  commandGroups?: CommandGroup[];
  
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  
  /**
   * Keyboard shortcut to display (e.g., "⌘K")
   */
  shortcut?: string;
  
  /**
   * Width of the command menu 
   * @default "md"
   */
  width?: 'sm' | 'md' | 'lg' | 'full';
  
  /**
   * Custom children to render in the command menu
   */
  children?: ReactNode;
}

export interface CommandGroup {
  /**
   * Title of the command group
   */
  title: string;
  
  /**
   * Commands in this group
   */
  commands: Command[];
}

export interface Command {
  /**
   * Unique identifier for the command
   */
  id: string;
  
  /**
   * Display name of the command
   */
  name: string;
  
  /**
   * Icon to display for the command (component or render function)
   */
  icon?: ReactNode | (() => ReactNode);
  
  /**
   * Short description of what the command does
   */
  description?: string;
  
  /**
   * Keyboard shortcut for this command if applicable
   */
  shortcut?: string;
  
  /**
   * Function to execute when this command is selected
   */
  onSelect: () => void;
  
  /**
   * Tags for filtering commands
   */
  tags?: string[];
}

export interface CommandMenuSearchProps {
  /**
   * Current search term
   */
  searchTerm: string;
  
  /**
   * Function to handle search term changes
   */
  onSearchChange: (value: string) => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Keyboard shortcut to display
   */
  shortcut?: string;
}

export interface CommandMenuListProps {
  /**
   * Array of command groups to display
   */
  commandGroups: CommandGroup[];
  
  /**
   * Current search term for filtering
   */
  searchTerm: string;
  
  /**
   * Currently selected command index
   */
  selectedIndex: number;
  
  /**
   * Function to handle selection of a command
   */
  onSelect: (command: Command) => void;
  
  /**
   * Function to change the selected index
   */
  onSelectedIndexChange: (index: number) => void;
} 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
