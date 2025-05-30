/**
 * @component Icon
 * @category ui
 * @subcategory icon
 * @description Main Icon component that renders Font Awesome icons as SVGs using the consolidated registry
 */
'use client';

import React, { memo, useEffect, useState } from 'react';
import { getIconPath } from './icons';
import { IconProps, SIZE_CLASSES } from './icon-types';
// import { IconMetadata } from './icon-types'; // Removed unused import
// import { iconRegistryData } from '@/lib/generated/icon-registry'; // Removed unused import
// import { cn } from '@/lib/utils'; // Removed unused import

// Debug flag for development
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Main Icon component that renders Font Awesome icons as SVGs
 * Uses the consolidated registry via getIconPath as Single Source of Truth
 */
export const Icon: React.FC<IconProps> = memo(
  ({ iconId = 'faQuestionLight', className = '', size = 'md', title, onClick, ...rest }) => {
    // State to hold SVG content
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get context values
    // const context = useIconContext(); // Removed unused context call

    // Determine the path using the single source of truth
    const iconPath = getIconPath(iconId);

    // Effect to fetch SVG content
    useEffect(() => {
      // console.log(`[Icon DEBUG] useEffect for iconId: ${iconId}, iconPath: ${iconPath}`); // DEBUG LOG
      if (!iconPath) {
        const errorMsg = `Icon path not found for ID: ${iconId}`;
        // console.error(`[Icon DEBUG] ${errorMsg}`); // DEBUG LOG
        setError(errorMsg);
        setSvgContent(null); // Clear previous content if path is invalid
        return;
      }

      let isCancelled = false; // Flag to prevent state update on unmounted component

      const fetchSvg = async () => {
        // console.log(`[Icon DEBUG] fetchSvg called for path: ${iconPath}`); // DEBUG LOG
        try {
          const response = await fetch(iconPath);
          // console.log(`[Icon DEBUG] fetch response status for ${iconPath}: ${response.status}`); // DEBUG LOG
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
          }
          const text = await response.text();
          // console.log(
          //   `[Icon DEBUG] SVG text fetched for ${iconPath} (first 100 chars):`,
          //   text.substring(0, 100)
          // ); // DEBUG LOG
          if (!isCancelled) {
            const sanitizedText = text
              .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
              .replace(/<path([^>]*)fill=\"([^\"]*)\"([^>]*)>/g, '<path$1$3>')
              .replace(/<path(?![^>]*fill=)([^>]*)>/g, '<path fill="currentColor"$1>');
            // console.log(`[Icon DEBUG] SVG content sanitized, setting state for ${iconId}`); // DEBUG LOG
            setSvgContent(sanitizedText);
            setError(null);
          }
        } catch (err) {
          if (!isCancelled) {
            const message = err instanceof Error ? err.message : 'Unknown error fetching SVG';
            // console.error(
            //   `[Icon DEBUG] Error fetching/processing SVG for ${iconId} from ${iconPath}:`,
            //   message
            // ); // DEBUG LOG
            setError(message);
            setSvgContent(null);
          }
        }
      };

      // console.log(`[Icon DEBUG] Resetting state and calling fetchSvg for ${iconId}`); // DEBUG LOG
      setSvgContent(null);
      setError(null);
      fetchSvg();

      // Cleanup function to prevent state updates if component unmounts before fetch completes
      return () => {
        isCancelled = true;
      };
    }, [iconId, iconPath]); // Re-run effect if iconId or derived iconPath changes

    // Handle dynamic classes
    const sizeClass = SIZE_CLASSES[size] || 'w-5 h-5';
    const combinedClasses = `inline-block ${sizeClass} ${className || ''}`.trim();

    // Render error state
    if (error && DEBUG) {
      return (
        <span
          className={`${combinedClasses} border border-dashed border-red-500 text-red-500 flex items-center justify-center`}
          title={`Error loading ${iconId}: ${error}`}
          {...rest}
        >
          !
        </span>
      );
    }

    // Render loading/empty state (optional, could show a placeholder)
    if (!svgContent) {
      // Return a simple span or a placeholder skeleton
      return (
        <span
          className={combinedClasses}
          title={title ? `${title} (loading)` : `Loading ${iconId}...`}
          {...rest}
        ></span>
      );
    }

    // Render the SVG inline
    return (
      <>
        {/* Add style to ensure direct SVG child scales */}
        <style>{`
        .${combinedClasses.split(' ').join('.')} > svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
        <span
          className={combinedClasses}
          title={title}
          onClick={onClick}
          {...rest}
          // Use dangerouslySetInnerHTML to render the fetched SVG content
          // Ensure that the source of SVGs is trusted to avoid XSS risks.
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </>
    );
  }
);

Icon.displayName = 'Icon';

/**
 * Solid variant of the Icon component
 */
export const SolidIcon: React.FC<Omit<IconProps, 'variant'>> = ({ iconId, ...otherProps }) => {
  // Don't modify app icons since they don't have variants
  if (iconId?.startsWith('app')) {
    return <Icon iconId={iconId} {...otherProps} />;
  }

  // Convert to solid variant if needed
  const solidIconId = iconId?.endsWith('Solid')
    ? iconId
    : iconId?.endsWith('Light')
      ? iconId.replace(/Light$/, 'Solid')
      : `${iconId}Solid`;

  return <Icon iconId={solidIconId} {...otherProps} />;
};

/**
 * Light variant of the Icon component
 */
export const LightIcon: React.FC<Omit<IconProps, 'variant'>> = ({ iconId, ...otherProps }) => {
  // Don't modify app icons since they don't have variants
  if (iconId?.startsWith('app')) {
    return <Icon iconId={iconId} {...otherProps} />;
  }

  // Convert to light variant if needed
  const lightIconId = iconId?.endsWith('Light')
    ? iconId
    : iconId?.endsWith('Solid')
      ? iconId.replace(/Solid$/, 'Light')
      : `${iconId}Light`;

  return <Icon iconId={lightIconId} {...otherProps} />;
};
