/**
 * @component HoverIcon
 * @category ui
 * @subcategory icon
 * @description A wrapper around the base Icon component that handles hover state transitions from light to solid variants
 */
'use client';

import React, { useState } from 'react';
import { Icon } from './icon';
import { IconProps } from './icon-types';
import { useIconContext } from './icon-context';

/**
 * HoverIcon component
 * 
 * A wrapper around the base Icon component that handles hover state transitions
 * from light to solid variants. Uses IconContext for defaults.
 */
export const HoverIcon: React.FC<Omit<IconProps, 'variant'>> = ({
  iconId,
  className,
  size,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { defaultVariant = 'light' } = useIconContext();
  
  // Don't modify app icons since they don't have variants
  if (iconId?.startsWith('app')) {
    return <Icon iconId={iconId} className={className} size={size} {...props} />;
  }
  
  // Get base icon name without variant suffix
  const baseIconName = iconId?.replace(/(Light|Solid)$/, '');
  
  // Determine correct variant based on hover state
  const variant = isHovered ? 'solid' : defaultVariant;
  
  // Apply the correct variant suffix
  const finalIconId = `${baseIconName}${variant === 'solid' ? 'Solid' : 'Light'}`;
  
  return (
    <span
      className="inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon 
        iconId={finalIconId}
        className={className}
        size={size}
        {...props}
      />
    </span>
  );
};

export default HoverIcon; 