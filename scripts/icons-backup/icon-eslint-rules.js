/**
 * ESLint Rules for Icon System Best Practices
 * 
 * These rules enforce the following guidelines:
 * 1. No direct imports from FontAwesome packages
 * 2. No use of FontAwesome class names in JSX
 * 3. No use of the deprecated FontAwesomeIcon component
 * 4. Use of the new unified Icon component system
 */

module.exports = {
  rules: {
    // Prevent direct FontAwesome imports
    'no-restricted-imports': ['warn', {
      paths: [
        {
          name: '@fortawesome/fontawesome-svg-core',
          message: 'Direct imports from FontAwesome packages are deprecated. Use the unified Icon component from @/components/icons instead.'
        },
        {
          name: '@fortawesome/pro-solid-svg-icons',
          message: 'Direct imports from FontAwesome packages are deprecated. Use the unified Icon component from @/components/icons instead.'
        },
        {
          name: '@fortawesome/pro-light-svg-icons',
          message: 'Direct imports from FontAwesome packages are deprecated. Use the unified Icon component from @/components/icons instead.'
        },
        {
          name: '@fortawesome/pro-regular-svg-icons',
          message: 'Direct imports from FontAwesome packages are deprecated. Use the unified Icon component from @/components/icons instead.'
        },
        {
          name: '@fortawesome/free-brands-svg-icons',
          message: 'Direct imports from FontAwesome packages are deprecated. Use the PlatformIcon component from @/components/icons instead.'
        },
        {
          name: '@fortawesome/react-fontawesome',
          message: 'FontAwesomeIcon is deprecated. Use the unified Icon component from @/components/icons instead.'
        },
        {
          name: 'react-icons/bs',
          message: 'Direct imports from react-icons are deprecated. Use the unified Icon component from @/components/icons instead.'
        },
        {
          name: 'react-icons/fa',
          message: 'Direct imports from react-icons are deprecated. Use the unified Icon component from @/components/icons instead.'
        }
      ]
    }],
    
    // Prevent use of FontAwesome class names in JSX
    'no-restricted-syntax': ['warn', 
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/fa-/]',
        message: 'Using FontAwesome classes directly is deprecated. Use the unified Icon component from @/components/icons instead.'
      },
      {
        selector: 'JSXOpeningElement[name.name="FontAwesomeIcon"]',
        message: 'FontAwesomeIcon component is deprecated. Use the unified Icon component from @/components/icons instead.'
      },
      {
        selector: 'JSXOpeningElement[name.name="i"][attributes.some(attr => attr.name && attr.name.name === "className" && attr.value && attr.value.value && /fa-/.test(attr.value.value))]',
        message: 'Using <i> tags with FontAwesome classes is deprecated. Use the unified Icon component from @/components/icons instead.'
      }
    ]
  },
  
  // Override settings for documentation files
  overrides: [
    {
      files: ['*.md', '*.mdx', '**/docs/**', '**/README.md', '**/scripts/**'],
      rules: {
        'no-restricted-imports': 'off',
        'no-restricted-syntax': 'off'
      }
    }
  ]
};
