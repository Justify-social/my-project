
// Robust SafeFontAwesomeIcon implementation
const SafeFontAwesomeIcon = ({ icon, className, ...props }) => {
  try {
    // Extra debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('SafeFontAwesomeIcon received icon:', icon);
      console.log('  type:', typeof icon);
      console.log('  is array:', Array.isArray(icon));
      if (Array.isArray(icon)) {
        console.log('  array length:', icon.length);
        console.log('  array elements:', icon);
      }
      if (typeof icon === 'object' && icon !== null) {
        console.log('  object keys:', Object.keys(icon));
      }
    }

    // Comprehensive empty/invalid icon check
    const isEmptyOrInvalid = 
      !icon ||
      (typeof icon === 'object' && (
        Object.keys(icon).length === 0 ||
        (Array.isArray(icon) && (
          icon.length === 0 ||
          icon.length < 2 ||
          !icon[0] ||
          !icon[1] ||
          typeof icon[0] !== 'string' ||
          typeof icon[1] !== 'string' ||
          icon[0].trim() === '' ||
          icon[1].trim() === ''
        )) ||
        (!Array.isArray(icon) && (
          !('prefix' in icon) ||
          !('iconName' in icon) ||
          typeof icon.prefix !== 'string' ||
          typeof icon.iconName !== 'string' ||
          icon.prefix.trim() === '' ||
          icon.iconName.trim() === ''
        ))
      ));
    
    if (isEmptyOrInvalid) {
      console.warn('Empty or invalid icon prop passed to SafeFontAwesomeIcon', icon);
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
    
    // Type-specific validation before passing to FontAwesomeIcon
    try {
      if (typeof icon === 'string') {
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      if (Array.isArray(icon) && 
          icon.length === 2 && 
          typeof icon[0] === 'string' && 
          typeof icon[1] === 'string') {
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      if (typeof icon === 'object' && 
          'prefix' in icon && 
          'iconName' in icon) {
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      // If none of the above conditions are met, icon is invalid
      console.warn('Invalid icon format', icon);
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
    } catch (validationError) {
      console.error('Error validating icon format:', validationError);
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
  } catch (e) {
    console.error('Error in SafeFontAwesomeIcon:', e);
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
