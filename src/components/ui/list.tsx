'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Icon, IconName } from './icon';

// Types
export interface ListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /**
   * List items to be rendered
   */
  items?: ListItemProps[];

  /**
   * Type of list to render
   */
  variant?: 'unordered' | 'ordered' | 'none';

  /**
   * Size of the list items
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to add dividers between items
   */
  dividers?: boolean;

  /**
   * Whether to make list items interactive (clickable)
   */
  interactive?: boolean;

  /**
   * Whether to add hover effect to list items
   */
  hoverable?: boolean;

  /**
   * Whether to add a border around the list
   */
  bordered?: boolean;

  /**
   * Direction of the list
   */
  layout?: 'vertical' | 'horizontal';

  /**
   * Icon to display before each item
   */
  icon?: IconName | React.ReactNode;

  /**
   * Background color to use
   */
  bgColor?: 'white' | 'gray' | 'blue' | 'transparent';

  /**
   * Whether to highlight alternating rows
   */
  striped?: boolean;
}
export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, 'content'> {
  /**
   * Content of the list item
   */
  content?: React.ReactNode;

  /**
   * Primary text for the list item
   */
  primary?: React.ReactNode;

  /**
   * Secondary text for the list item (used for description)
   */
  secondary?: React.ReactNode;

  /**
   * Whether the item is active
   */
  active?: boolean;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Icon to display before the item, overrides list's icon
   */
  icon?: IconName | React.ReactNode;

  /**
   * Action to display at the end of the item
   */
  action?: React.ReactNode;

  /**
   * Optional method called when item is clicked
   */
  onClick?: (e: React.MouseEvent<HTMLLIElement>) => void;

  /**
   * Whether to add divider after this item (overrides list's dividers)
   */
  divider?: boolean;

  /**
   * Whether to display a lighter background for this item
   */
  highlighted?: boolean;
}

/**
 * A flexible List component for rendering different types of lists
 */
export const List = forwardRef<HTMLDivElement, ListProps>(({
  items = [],
  variant = 'unordered',
  size = 'md',
  dividers = false,
  interactive = false,
  hoverable = false,
  bordered = true,
  layout = 'vertical',
  icon,
  className,
  children,
  bgColor = 'white',
  striped = false,
  ...props
}, ref) => {
  // Determine list element type
  const ListTag = variant === 'ordered' ? 'ol' : 'ul';

  // Determine size-based classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Determine spacing based on layout
  const layoutClasses = {
    vertical: '',
    horizontal: 'flex flex-wrap'
  };

  // Determine background color classes
  const bgColorClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    transparent: 'bg-transparent'
  };
  return <div ref={ref} className={cn(bordered && 'rounded-md border border-gray-200', bgColorClasses[bgColor], className)} {...props}>
      <ListTag className={cn('list-none m-0 p-0', sizeClasses[size], layoutClasses[layout])}>
        {items.length > 0 ? items.map((item, index) => <ListItem key={index} {...item} divider={item.divider ?? (dividers && index < items.length - 1)} interactive={interactive} hoverable={hoverable} size={size} icon={item.icon || icon} layout={layout} highlighted={striped && index % 2 === 1} />) : children}
      </ListTag>
    </div>;
});
List.displayName = 'List';

/**
 * Individual list item component
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps & {
  interactive?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  highlighted?: boolean;
}>(({
  content,
  primary,
  secondary,
  active = false,
  disabled = false,
  icon,
  action,
  onClick,
  divider = false,
  interactive = false,
  hoverable = false,
  size = 'md',
  layout = 'vertical',
  className,
  children,
  highlighted = false,
  ...props
}, ref) => {
  // Determine padding based on size
  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3'
  };

  // Determine layout classes
  const layoutClasses = {
    vertical: 'block w-full',
    horizontal: 'inline-block'
  };

  // Handle click when interactive and not disabled
  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  // Render the icon based on its type
  const renderIcon = () => {
    if (!icon) return null;

    // If icon is a React element, render it directly
    if (React.isValidElement(icon)) {
      return <div className="mr-3 flex-shrink-0">{icon}</div>;
    }

    // If icon is an IconName string, use the Icon component
    if (typeof icon === 'string') {
      // Ensure the icon name is properly formatted with 'fa' prefix
      const iconName = (icon as string).startsWith('fa') ? icon as IconName : `fa${icon.charAt(0).toUpperCase() + icon.slice(1)}` as IconName;
      
      return <div className="mr-3 flex-shrink-0">
          <Icon name={iconName} className="h-5 w-5 text-gray-400" solid={false} />
        </div>;
    }
    return null;
  };
  return <li ref={ref} className={cn(paddingClasses[size], layoutClasses[layout], divider && layout === 'vertical' && 'border-b border-gray-200 last:border-b-0', divider && layout === 'horizontal' && 'border-r border-gray-200 last:border-r-0', interactive && 'cursor-pointer', hoverable && !disabled && 'hover:bg-gray-50', active && 'bg-blue-50', highlighted && 'bg-gray-50', disabled && 'opacity-50 cursor-not-allowed', className)} onClick={handleClick} aria-disabled={disabled} {...props}>
      <div className="flex items-center">
        {renderIcon()}
        
        <div className="flex-grow min-w-0">
          {content ? <div>{content}</div> : <>
              {primary && <div className="text-gray-900 truncate">{primary}</div>}
              {secondary && <div className="text-gray-500 text-xs mt-0.5 truncate">{secondary}</div>}
            </>}
        </div>
        
        {action && <div className="ml-3 flex-shrink-0">{action}</div>}
        
        {children}
      </div>
    </li>;
});
ListItem.displayName = 'ListItem';

/**
 * Example list component
 */
export function ListExample() {
  // Basic list example matching the screenshot
  const basicItems = [{
    primary: 'Inbox',
    icon: 'faInbox'
  }, {
    primary: 'Sent',
    icon: 'faPaperPlane'
  }, {
    primary: 'Drafts',
    icon: 'faFileLines'
  }, {
    primary: 'Trash',
    icon: 'faTrashCan'
  }];

  // Detailed list example matching the screenshot
  const detailedItems = [{
    primary: 'Project Alpha',
    secondary: 'Due in 3 days',
    icon: 'faFolder',
    action: <span className="text-xs font-medium text-blue-600">View</span>
  }, {
    primary: 'Team Meeting',
    secondary: 'Tomorrow at 10:00 AM',
    icon: 'faCalendar',
    action: <span className="text-xs font-medium text-blue-600">Join</span>,
    active: true,
    highlighted: true
  }, {
    primary: 'Client Report',
    secondary: 'Ready for review',
    icon: 'faFileLines',
    action: <span className="text-xs font-medium text-blue-600">Review</span>
  }, {
    primary: 'System Update',
    secondary: 'Scheduled for next week',
    icon: 'faGear',
    action: <span className="text-xs font-medium text-blue-600">Details</span>,
    disabled: true
  }];
  return <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Basic List</h3>
        <List items={basicItems} dividers bordered hoverable interactive bgColor="white" />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Detailed List</h3>
        <List items={detailedItems} dividers bordered hoverable interactive size="md" bgColor="white" />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Horizontal List</h3>
        <List layout="horizontal" bordered bgColor="white" className="inline-block">
          <ListItem primary="Home" className="py-2 px-4" icon="faHouse" />
          <ListItem primary="Products" className="py-2 px-4" icon="faBox" />
          <ListItem primary="About" className="py-2 px-4" icon="faCircleInfo" />
          <ListItem primary="Contact" className="py-2 px-4" icon="faEnvelope" />
        </List>
      </div>
    </div>;
}