/**
 * Icon Standards ESLint Plugin
 */

const preferIconIdRule = require('../../rules/icon-standards');

module.exports = {
  rules: {
    'prefer-icon-id-prop': preferIconIdRule,
    'no-fontawesome-direct-import': {
      meta: {
        docs: {
          description: "Disallow direct imports from Font Awesome",
          category: "Best Practices",
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create: function(context) {
        return {
          ImportDeclaration(node) {
            // Check for direct FontAwesome imports
            if (node.source.value.includes('@fortawesome/')) {
              context.report({
                node,
                message: "Don't import FontAwesome icons directly. Use the Icon component instead."
              });
            }
          }
        };
      }
    }
  },
  configs: {
    recommended: {
      plugins: ['icon-standards'],
      rules: {
        'icon-standards/prefer-icon-id-prop': 'error',
        'icon-standards/no-fontawesome-direct-import': 'error'
      }
    }
  }
}; 