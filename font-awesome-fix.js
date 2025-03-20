/**
 * FONT AWESOME FIX SUGGESTIONS
 * 
 * Copy these solutions to the appropriate files to fix empty object icon errors
 */

// ========================================================================
// 1. SafeFontAwesomeIcon Component Fix
// ========================================================================

const SafeFontAwesomeIcon = ({ icon, className, ...props }) => {
  try {
    // Handle all possible empty/invalid icon cases
    if (!icon || 
        (typeof icon === 'object' && Object.keys(icon).length === 0) || 
        JSON.stringify(icon) === '{}' ||
        (Array.isArray(icon) && !icon[0] && !icon[1])) {
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
    
    return <FontAwesomeIcon icon={icon} className={className} {...props} />;
  } catch (e) {
    console.error('Error rendering FontAwesomeIcon:', e);
    // Return fallback icon
    return <FallbackIcon />;
  }
};

// ========================================================================
// 2. getProIcon Function Fix
// ========================================================================

const getProIcon = (iconName, style = 'fas') => {
  try {
    // Check for undefined or empty iconName
    if (!iconName || typeof iconName !== 'string' || iconName.trim() === '') {
      console.warn(`Invalid icon name passed to getProIcon: ${iconName}`);
      return ['fas', 'question'];
    }
    
    // Convert the iconName to a valid IconName - ensure kebab-case format
    const validIconName = iconName.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Verify the icon exists in the library
    try {
      // Try to find the icon - if it doesn't exist, this will throw an error
      findIconDefinition({ prefix: style, iconName: validIconName });
    } catch (e) {
      console.warn(`Icon ${style} ${validIconName} not found in library`);
      return ['fas', 'question'];
    }
    
    return [style, validIconName];
  } catch (e) {
    console.error(`Error in getProIcon for ${style} ${iconName}:`, e);
    // Fallback to a safe icon
    return ['fas', 'question'];
  }
};

// ========================================================================
// 3. Safe Component Usage
// ========================================================================

{/* Make sure you validate the icon name before passing it to getProIcon */}
<SafeFontAwesomeIcon 
  icon={name && typeof name === 'string' ? getProIcon(name, 'fas') : ['fas', 'question']} 
  className={className} 
/>

// Alternative approach using optional chaining and nullish coalescing
<SafeFontAwesomeIcon 
  icon={getProIcon(name ?? 'question', style ?? 'fas')} 
  className={className} 
/>
