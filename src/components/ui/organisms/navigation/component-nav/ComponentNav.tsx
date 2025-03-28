import React from 'react';
import { cn } from '@/utils/string/utils';

export interface ComponentLink {
  /**
   * Unique identifier for the component link, used for the anchor href
   */
  id: string;
  
  /**
   * Display text for the component link
   */
  label: string;
}

export interface ComponentNavProps {
  /**
   * List of component links to display
   */
  links?: ComponentLink[];

  /**
   * Additional className for the container
   */
  className?: string;
  
  /**
   * Whether the navigation should be fixed at the top
   */
  fixed?: boolean;
  
  /**
   * Left offset for fixed positioning (when fixed=true)
   */
  leftOffset?: string;
}

/**
 * ComponentNav provides a horizontal navigation bar for browsing component documentation
 */
export function ComponentNav({
  links,
  className,
  fixed = true,
  leftOffset = '16rem' // 64 in rem units
}: ComponentNavProps) {
  // Default component links if none provided
  const defaultLinks: ComponentLink[] = [
    { id: 'alerts', label: 'Alerts' },
    { id: 'avatars', label: 'Avatars' },
    { id: 'badges', label: 'Badges' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'cards', label: 'Cards' },
    { id: 'charts', label: 'Charts' },
    { id: 'colour-palette-logos', label: 'Colour Palette + Logos' },
    { id: 'container', label: 'Container' },
    { id: 'form-components', label: 'Form Components' },
    { id: 'grid', label: 'Grid' },
    { id: 'icons', label: 'Icons' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'loading', label: 'Loading' },
    { id: 'progress', label: 'Progress' },
    { id: 'tables', label: 'Tables' },
    { id: 'tabs', label: 'Tabs' },
    { id: 'toasts', label: 'Toasts' },
    { id: 'typography', label: 'Typography' }
  ];

  const navLinks = links || defaultLinks;

  return (
    <div className={cn(
      'bg-white border-b border-gray-200 shadow-sm z-40',
      fixed && 'fixed top-16 left-0 right-0',
      fixed && { marginLeft: leftOffset },
      className
    )}>
      <nav className="px-2 sm:px-3 md:px-4 py-2">
        <ul className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 items-center">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a 
                href={`#${link.id}`} 
                className="px-1.5 py-0.5 text-xs sm:text-xs md:text-sm lg:text-sm sm:px-2 md:px-2.5 sm:py-1 md:py-1 bg-gray-100 rounded-md text-[#3182CE] hover:bg-[#00BFFF]/10 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default ComponentNav; 