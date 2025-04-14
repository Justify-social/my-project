/**
 * ESLint rule to enforce using iconId instead of name prop for Icon components
 *
 * Installation:
 * 1. Add this file to your ESLint custom rules directory
 * 2. Add to your .eslintrc.js:
 *
 * ```js
 * module.exports = {
 *   // ...other config
 *   plugins: [
 *     // ...other plugins
 *     'custom-rules'
 *   ],
 *   rules: {
 *     // ...other rules
 *     'custom-rules/require-icon-id': 'warn'
 *   }
 * }
 * ```
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using iconId instead of name prop for Icon components',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [], // no options
    messages: {
      useIconId: 'Use iconId="faIconLight" instead of name="faIcon" for better type safety',
      useLightSuffix: 'Add explicit Light/Solid suffix to iconId for better type safety',
      removeSolid: 'Remove solid prop when using iconId with explicit variant',
    },
  },

  create(context) {
    return {
      // Match JSX elements named Icon, SolidIcon, or LightIcon
      JSXOpeningElement(node) {
        const elementName = node.name.name;

        // Only process Icon components
        if (!['Icon', 'SolidIcon', 'LightIcon'].includes(elementName)) {
          return;
        }

        let hasName = false;
        let hasIconId = false;
        let hasSolid = false;
        let nameValue = null;
        let solidValue = null;
        let iconIdValue = null;

        // Check props
        node.attributes.forEach(attr => {
          if (!attr.name) return;

          const propName = attr.name.name;

          if (propName === 'name') {
            hasName = true;
            if (attr.value.type === 'Literal') {
              nameValue = attr.value.value;
            }
          } else if (propName === 'iconId') {
            hasIconId = true;
            if (attr.value.type === 'Literal') {
              iconIdValue = attr.value.value;
            }
          } else if (propName === 'solid') {
            hasSolid = true;
            if (
              attr.value.type === 'JSXExpressionContainer' &&
              attr.value.expression.type === 'Literal'
            ) {
              solidValue = attr.value.expression.value;
            }
          }
        });

        // Report issues
        if (hasName && !hasIconId) {
          // Using name without iconId
          context.report({
            node,
            messageId: 'useIconId',
            fix(fixer) {
              // Only attempt to fix if we have a literal value
              if (nameValue && typeof nameValue === 'string') {
                const nameAttr = node.attributes.find(attr => attr.name?.name === 'name');
                const solidAttr = node.attributes.find(attr => attr.name?.name === 'solid');

                if (nameAttr) {
                  const variant = solidValue === true ? 'Solid' : 'Light';
                  const newIconId = `iconId="${nameValue}${variant}"`;

                  // Replace name with iconId
                  const fixes = [fixer.replaceText(nameAttr, newIconId)];

                  // Also remove solid prop if present
                  if (solidAttr) {
                    fixes.push(fixer.remove(solidAttr));
                  }

                  return fixes;
                }
              }
              return null;
            },
          });
        } else if (hasIconId && hasSolid) {
          // Using both iconId and solid (redundant)
          context.report({
            node,
            messageId: 'removeSolid',
            fix(fixer) {
              // Remove solid prop
              const solidAttr = node.attributes.find(attr => attr.name?.name === 'solid');
              if (solidAttr) {
                return fixer.remove(solidAttr);
              }
              return null;
            },
          });
        } else if (
          hasIconId &&
          iconIdValue &&
          typeof iconIdValue === 'string' &&
          !iconIdValue.endsWith('Light') &&
          !iconIdValue.endsWith('Solid')
        ) {
          // Using iconId but without explicit variant suffix
          context.report({
            node,
            messageId: 'useLightSuffix',
            fix(fixer) {
              // Add Light suffix by default
              const iconIdAttr = node.attributes.find(attr => attr.name?.name === 'iconId');
              if (iconIdAttr) {
                return fixer.replaceText(iconIdAttr.value, `"${iconIdValue}Light"`);
              }
              return null;
            },
          });
        }
      },
    };
  },
};
