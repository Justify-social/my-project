/**
 * ESLint rules to enforce icon standards
 */

module.exports = {
  meta: {
    docs: {
      description: "Enforce using iconId prop instead of name",
      category: "Best Practices",
      recommended: true
    },
    fixable: "code",
    schema: []
  },
  create: function(context) {
    return {
      JSXOpeningElement(node) {
        // Only target Icon component
        if (node.name.name !== 'Icon') {
          return;
        }

        // Check if there's a name prop but no iconId prop
        const nameAttr = node.attributes.find(attr => 
          attr.type === 'JSXAttribute' && attr.name.name === 'name'
        );
        
        const iconIdAttr = node.attributes.find(attr => 
          attr.type === 'JSXAttribute' && attr.name.name === 'iconId'
        );

        // If there's a name prop but no iconId prop, report it
        if (nameAttr && !iconIdAttr) {
          context.report({
            node: nameAttr,
            message: "Use iconId prop instead of name prop for consistent icon references",
            fix: function(fixer) {
              // If it's a string literal, we can try to fix it
              if (nameAttr.value.type === 'Literal') {
                const iconName = nameAttr.value.value;
                
                // Check for solid prop
                const solidAttr = node.attributes.find(attr => 
                  attr.type === 'JSXAttribute' && 
                  attr.name.name === 'solid' && 
                  attr.value && 
                  (attr.value.value === true || 
                   (attr.value.expression && attr.value.expression.value === true))
                );
                
                // Determine the correct suffix
                const suffix = solidAttr ? 'Solid' : 'Light';
                
                // Create the new iconId value
                const newIconId = `${iconName}${suffix}`;
                
                // Replace name with iconId
                const nameRange = nameAttr.range;
                const solidRange = solidAttr ? solidAttr.range : null;
                
                // If we have a solid prop, remove it too
                if (solidRange) {
                  // Find comma or space before the solid prop
                  const sourceCode = context.getSourceCode();
                  const tokensBetween = sourceCode.getTokensBetween(nameAttr, solidAttr);
                  const startOffset = tokensBetween.length > 0 ? tokensBetween[0].range[0] : nameRange[1];
                  
                  return [
                    fixer.removeRange([startOffset, solidRange[1]]),
                    fixer.replaceText(nameAttr, `iconId="${newIconId}"`)
                  ];
                }
                
                return fixer.replaceText(nameAttr, `iconId="${newIconId}"`);
              }
            }
          });
        }
        
        // Also check for solid prop
        const solidAttr = node.attributes.find(attr => 
          attr.type === 'JSXAttribute' && attr.name.name === 'solid'
        );
        
        if (solidAttr) {
          context.report({
            node: solidAttr,
            message: "Use iconId prop with explicit suffix (Light/Solid) instead of solid prop",
            fix: function(fixer) {
              // If we already reported on the name prop, skip fixing this
              if (nameAttr && !iconIdAttr) {
                return null;
              }
              
              // If there's an iconId, we need to modify it
              if (iconIdAttr && iconIdAttr.value.type === 'Literal') {
                const iconId = iconIdAttr.value.value;
                const isSolid = solidAttr.value && 
                  (solidAttr.value.value === true || 
                  (solidAttr.value.expression && solidAttr.value.expression.value === true));
                
                if (isSolid) {
                  // If the iconId already has a suffix, remove it first
                  let baseIconId = iconId;
                  if (iconId.endsWith('Light') || iconId.endsWith('Solid')) {
                    baseIconId = iconId.substring(0, iconId.length - 5);
                  }
                  
                  // Replace iconId with Solid suffix
                  return [
                    fixer.replaceText(iconIdAttr, `iconId="${baseIconId}Solid"`),
                    fixer.remove(solidAttr)
                  ];
                } else {
                  // Just remove the solid={false} prop as Light is default
                  return fixer.remove(solidAttr);
                }
              }
              
              return null;
            }
          });
        }
      }
    };
  }
}; 