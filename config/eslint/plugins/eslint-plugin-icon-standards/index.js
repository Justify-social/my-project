/**
 * ESLint plugin for enforcing icon standards in the application
 * 
 * This plugin enforces the following rules:
 * 1. Prevents direct imports from any @fortawesome/* packages
 * 2. Encourages using the Icon component from @/components/ui/atoms/icons
 */

module.exports = {
  rules: {
    'no-fontawesome-direct-import': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prevent direct imports from FontAwesome packages',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          noDirectImport: 'Direct imports from FontAwesome packages are not allowed. Use the Icon component from @/components/ui/atoms/icons instead.',
          suggestReplacement: 'Replace with import { Icon } from "@/components/ui/atoms/icons"'
        }
      },
      create: function(context) {
        return {
          ImportDeclaration(node) {
            const sourceValue = node.source.value;
            
            // Check if import is from any @fortawesome/* package
            if (sourceValue.startsWith('@fortawesome/')) {
              context.report({
                node,
                messageId: 'noDirectImport',
                fix: function(fixer) {
                  // Don't automatically fix imports in non-component files (like utility files)
                  if (context.getFilename().includes('/components/')) {
                    // Check if we're importing FontAwesomeIcon
                    if (sourceValue === '@fortawesome/react-fontawesome') {
                      const hasNamedImport = node.specifiers.some(
                        specifier => 
                          specifier.type === 'ImportSpecifier' && 
                          specifier.imported.name === 'FontAwesomeIcon'
                      );
                      
                      if (hasNamedImport) {
                        return fixer.replaceText(
                          node,
                          'import { Icon } from "@/components/ui/atoms/icons";'
                        );
                      }
                    }
                    
                    // If it's a different FontAwesome import, suggest removing it
                    // but don't auto-fix as it might need more complex changes
                    return null;
                  }
                  return null;
                }
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
        'icon-standards/no-fontawesome-direct-import': 'error'
      }
    }
  }
}; 