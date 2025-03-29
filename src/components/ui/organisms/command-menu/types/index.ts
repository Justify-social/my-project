import { ReactNode } from 'react';

/**
 * Command item type
 */
export interface Command {
  /**
   * Unique ID for the command
   */
  id: string;

  /**
   * Command name displayed in the menu
   */
  name: string;

  /**
   * Optional command description or hint
   */
  description?: string;

  /**
   * Group this command belongs to (for grouping and filtering)
   */
  group?: string;

  /**
   * Command icon (FontAwesome class)
   */
  icon?: string;

  /**
   * Optional keyboard shortcut displayed alongside the command
   * Example: "⇧⌘P" or "Ctrl+K"
   */
  shortcut?: string;

  /**
   * Action to perform when the command is selected
   */
  action: () => void;

  /**
   * Whether the command is currently disabled
   */
  disabled?: boolean;

  /**
   * Additional keywords for searching
   */
  keywords?: string[];

  /**
   * Optional render function for custom command rendering
   */
  renderItem?: (command: Command, active: boolean) => ReactNode;
}

/**
 * Group of commands
 */
export interface CommandGroup {
  /**
   * Group name
   */
  name: string;

  /**
   * Commands in this group
   */
  commands: Command[];

  /**
   * Optional header content for the group
   */
  headerContent?: ReactNode;
}

/**
 * Command palette position
 */
export type CommandMenuPosition = 'top' | 'center';

/**
 * Command palette appearance
 */
export type CommandMenuAppearance = 'default' | 'minimal' | 'floating';

/**
 * Command palette size
 */
export type CommandMenuSize = 'sm' | 'md' | 'lg';

/**
 * Command menu props
 */
export interface CommandMenuProps {
  /**
   * Whether the command menu is open
   */
  isOpen: boolean;

  /**
   * Callback when the command menu is closed
   */
  onClose: () => void;

  /**
   * Array of commands to display
   */
  commands: Command[];

  /**
   * Optional array of command groups
   * Alternative to flat commands array
   */
  commandGroups?: CommandGroup[];

  /**
   * Placeholder text for search input
   * @default "Search commands..."
   */
  placeholder?: string;

  /**
   * Position of the command menu
   * @default "center"
   */
  position?: CommandMenuPosition;

  /**
   * Appearance of the command menu
   * @default "default"
   */
  appearance?: CommandMenuAppearance;

  /**
   * Size of the command menu
   * @default "md"
   */
  size?: CommandMenuSize;

  /**
   * Custom class for the command menu container
   */
  className?: string;

  /**
   * Custom class for the search input
   */
  inputClassName?: string;

  /**
   * Custom class for each command item
   */
  commandClassName?: string;

  /**
   * Maximum number of results to show
   * @default 10
   */
  maxResults?: number;

  /**
   * Whether to show keyboard shortcuts
   * @default true
   */
  showShortcuts?: boolean;

  /**
   * Whether to show icons
   * @default true
   */
  showIcons?: boolean;

  /**
   * Whether to show command descriptions
   * @default true
   */
  showDescriptions?: boolean;

  /**
   * Whether to show group headers
   * @default true
   */
  showGroups?: boolean;

  /**
   * Whether to close the menu when a command is selected
   * @default true
   */
  closeOnSelect?: boolean;

  /**
   * Label for empty state when no commands match search
   * @default "No results found"
   */
  emptyStateLabel?: string;

  /**
   * Initial filter value
   */
  initialFilter?: string;

  /**
   * Whether the command menu should have a dark theme
   * @default false
   */
  isDarkTheme?: boolean;

  /**
   * Optional header content
   */
  headerContent?: ReactNode;

  /**
   * Optional footer content
   */
  footerContent?: ReactNode;

  /**
   * Optional filter function for commands
   */
  filterFunction?: (command: Command, searchValue: string) => boolean;
} 