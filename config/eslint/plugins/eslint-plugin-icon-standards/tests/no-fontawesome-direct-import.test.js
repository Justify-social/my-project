const { RuleTester } = require('eslint');
const rule = require('../').rules['no-fontawesome-direct-import'];

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
});

ruleTester.run('no-fontawesome-direct-import', rule, {
  valid: [
    // Valid cases
    {
      code: `import { Icon } from '@/components/ui/atoms/icons';`,
      filename: '/src/components/ui/MyComponent.jsx'
    },
    {
      code: `import React from 'react';`,
      filename: '/src/components/ui/MyComponent.jsx'
    },
    {
      code: `import { Something } from 'somewhere-else';`,
      filename: '/src/components/ui/MyComponent.jsx'
    },
    // Even in non-component files, other imports are fine
    {
      code: `import React from 'react';`,
      filename: '/src/utils/helpers.js'
    }
  ],
  invalid: [
    // Invalid cases - FontAwesomeIcon import
    {
      code: `import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';`,
      filename: '/src/components/ui/MyComponent.jsx',
      errors: [{ messageId: 'noDirectImport' }],
      output: `import { Icon } from "@/components/ui/atoms/icons";`
    },
    // Invalid case - Icon import (fa*)
    {
      code: `import { faUser } from '@fortawesome/pro-solid-svg-icons';`,
      filename: '/src/components/ui/MyComponent.jsx',
      errors: [{ messageId: 'noDirectImport' }]
      // No automatic fix for this case
    },
    // Invalid case - Multiple icon imports
    {
      code: `import { faUser, faHome } from '@fortawesome/pro-solid-svg-icons';`,
      filename: '/src/components/ui/MyComponent.jsx',
      errors: [{ messageId: 'noDirectImport' }]
      // No automatic fix for this case
    },
    // Invalid case - Library import
    {
      code: `import { library } from '@fortawesome/fontawesome-svg-core';`,
      filename: '/src/components/ui/MyComponent.jsx',
      errors: [{ messageId: 'noDirectImport' }]
      // No automatic fix for this case
    },
    // Invalid case - Default import
    {
      code: `import Brand from '@fortawesome/free-brands-svg-icons';`,
      filename: '/src/components/ui/MyComponent.jsx',
      errors: [{ messageId: 'noDirectImport' }]
      // No automatic fix for this case
    }
  ]
}); 