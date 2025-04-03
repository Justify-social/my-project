import React from 'react';
import { getIconPath, normalizeIconName } from '../icons';
import { Icon } from '../Icon';
import { IconStyle } from '../types';

interface IconAdapterProps {
  name?: string;
  className?: string;
  solid?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  iconType?: string;
  [key: string]: any;
}

/**
 * Properly formats FontAwesome icon names with special handling for hyphenated formats
 */
function formatIconName(name: string): string {
  if (!name) return '';
  
  // If it's already in the fa* format, just return it
  if (name.startsWith('fa') && name.length > 2 && name[2].toUpperCase() === name[2]) {
    return name;
  }
  
  // Special case for 'circle-notch' and similar hyphenated names
  if (name.includes('-')) {
    // Create parts: ['fa', 'circle', 'notch'] or ['circle', 'notch']
    const parts = name.split('-');
    // Start with 'fa' prefix
    const prefix = 'fa';
    
    // Convert remaining parts to capitalize each word: CircleNotch
    let iconName;
    if (parts[0] === 'fa') {
      // If first part is 'fa', skip it
      iconName = parts.slice(1).map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('');
    } else {
      // Otherwise use all parts
      iconName = parts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('');
    }
    
    return prefix + iconName;
  }
  
  // Handle single word icon without fa prefix
  if (!name.startsWith('fa')) {
    return `fa${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }
  
  return name;
}

/**
 * IconAdapter - Maps older FontAwesome icon usage to the unified Icon component
 * This provides backward compatibility for components using the old icon pattern
 */
export const IconAdapter: React.FC<IconAdapterProps> = ({
  name,
  className,
  solid = false,
  style,
  onClick,
  title,
  iconType,
  ...rest
}) => {
  // Skip rendering if no name provided
  if (!name) {
    console.warn('IconAdapter: No icon name provided');
    return null;
  }

  // Format the icon name properly before passing to Icon component
  const formattedName = formatIconName(name);
  
  // Convert deprecated solid prop to variant
  const variant: IconStyle = solid ? 'solid' : 'light';

  return (
    <Icon
      name={formattedName}
      className={className}
      variant={variant}
      style={style}
      onClick={onClick}
      title={title}
      {...rest}
    />
  );
}; 