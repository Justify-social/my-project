
// SafeFontAwesomeIcon inline fix 
// Copy this entire component into your IconTester.tsx file to replace the existing one

const SafeFontAwesomeIcon = ({ icon, className, ...props }: { icon: IconProp, className?: string, [key: string]: any }) => {
  try {
    // Very thorough validation to catch ALL possible empty object patterns
    if (!icon || 
        (typeof icon === 'object' && (
          Object.keys(icon).length === 0 || 
          JSON.stringify(icon) === '{}' ||
          (Array.isArray(icon) && (
            icon.length === 0 || 
            icon.length < 2 || 
            !icon[0] || 
            !icon[1])
          )
        ))) {
      console.warn('[FIXED VERSION] Empty or invalid icon:', icon);
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
    
    // Type-specific validation to ensure we only pass valid formats
    if (typeof icon === 'string') {
      if (icon.trim() === '') {
        throw new Error('Empty string icon');
      }
      return <FontAwesomeIcon icon={icon} className={className} {...props} />;
    }
    
    if (Array.isArray(icon)) {
      if (icon.length !== 2 || 
          typeof icon[0] !== 'string' || 
          typeof icon[1] !== 'string' ||
          icon[0].trim() === '' || 
          icon[1].trim() === '') {
        throw new Error('Invalid array format for icon');
      }
      return <FontAwesomeIcon icon={icon as [IconPrefix, IconName]} className={className} {...props} />;
    }
    
    if (typeof icon === 'object') {
      if (!icon || 
          !('prefix' in icon) || 
          !('iconName' in icon) ||
          typeof icon.prefix !== 'string' ||
          typeof icon.iconName !== 'string' ||
          icon.prefix.trim() === '' ||
          icon.iconName.trim() === '') {
        throw new Error('Invalid object format for icon');
      }
      return <FontAwesomeIcon icon={icon} className={className} {...props} />;
    }
    
    // If we reach here, format is not recognized
    throw new Error('Unrecognized icon format');
  } catch (e) {
    console.error('[FIXED VERSION] Error rendering FontAwesomeIcon:', e);
    // Return fallback icon
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="red"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
};
    