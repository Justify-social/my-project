/**
 * Configuration Utilities
 *
 * This module provides utilities for composition and manipulation of configuration objects.
 * It enables a modular approach to building application configurations.
 */

/**
 * Deeply merges multiple configuration objects into a single configuration
 * Last configurations in the array take precedence for conflicting properties
 *
 * @param {...Object} configurations - Configuration objects to merge
 * @returns {Object} - The merged configuration object
 */
function mergeConfigurations(...configurations) {
  // Filter out undefined/null configurations
  const validConfigs = configurations.filter(config => config != null);

  if (validConfigs.length === 0) {
    return {};
  }

  if (validConfigs.length === 1) {
    return validConfigs[0];
  }

  // Custom deep merge implementation for configurations
  return validConfigs.reduce((result, current) => {
    // Handle arrays - either replace or merge depending on strategy
    function mergeArrays(target, source) {
      // Check if the source array has a special merge flag
      if (source.__mode === 'append') {
        // Remove the flag and append
        const sourceWithoutFlag = [...source];
        delete sourceWithoutFlag.__mode;
        return [...target, ...sourceWithoutFlag];
      } else if (source.__mode === 'prepend') {
        // Remove the flag and prepend
        const sourceWithoutFlag = [...source];
        delete sourceWithoutFlag.__mode;
        return [...sourceWithoutFlag, ...target];
      } else {
        // Default is to replace the array entirely
        return source;
      }
    }

    // Recursively merge objects
    function deepMerge(target, source) {
      const output = { ...target };

      Object.keys(source).forEach(key => {
        const sourceValue = source[key];
        const targetValue = target[key];

        // Handle undefined source values
        if (sourceValue === undefined) {
          return;
        }

        if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
          // If property exists in both and both are objects, merge them
          if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
            output[key] = deepMerge(targetValue, sourceValue);
          } else {
            // If target doesn't have this property as an object, use source
            output[key] = sourceValue;
          }
        } else if (Array.isArray(sourceValue)) {
          // Special handling for arrays
          output[key] =
            targetValue && Array.isArray(targetValue)
              ? mergeArrays(targetValue, sourceValue)
              : sourceValue;
        } else {
          // For primitive values, use the source value
          output[key] = sourceValue;
        }
      });

      return output;
    }

    return deepMerge(result, current);
  }, {});
}

/**
 * Validates a configuration object against a schema
 *
 * @param {Object} config - Configuration to validate
 * @param {Object} schema - Schema to validate against
 * @returns {Object} - Validation result with isValid and errors properties
 */
function validateConfiguration(config, schema) {
  // Simple schema validation implementation
  // In production, you'd likely use a more robust library like Joi or Ajv

  const errors = [];

  function validate(configPart, schemaPart, path = '') {
    // Check for required properties
    if (schemaPart.required && Array.isArray(schemaPart.required)) {
      for (const requiredProp of schemaPart.required) {
        if (configPart[requiredProp] === undefined) {
          errors.push(`Missing required property: ${path ? path + '.' : ''}${requiredProp}`);
        }
      }
    }

    // Check property types and nested objects
    if (schemaPart.properties && typeof schemaPart.properties === 'object') {
      Object.keys(schemaPart.properties).forEach(key => {
        const propSchema = schemaPart.properties[key];
        const propValue = configPart[key];
        const propPath = path ? `${path}.${key}` : key;

        // Skip validation if property isn't present and not required
        if (propValue === undefined) {
          return;
        }

        // Type validation
        if (propSchema.type) {
          const expectedType = propSchema.type;
          let actualType = typeof propValue;

          // Special handling for arrays
          if (Array.isArray(propValue)) {
            actualType = 'array';
          }

          if (expectedType !== actualType) {
            errors.push(
              `Type mismatch for ${propPath}: expected ${expectedType}, got ${actualType}`
            );
          }
        }

        // Recursive validation for objects
        if (
          propSchema.type === 'object' &&
          propSchema.properties &&
          propValue &&
          typeof propValue === 'object'
        ) {
          validate(propValue, propSchema, propPath);
        }

        // Array item validation
        if (propSchema.type === 'array' && propSchema.items && Array.isArray(propValue)) {
          propValue.forEach((item, index) => {
            validate({ item }, { properties: { item: propSchema.items } }, `${propPath}[${index}]`);
          });
        }
      });
    }
  }

  validate(config, schema);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Applies environment-specific overrides to a base configuration
 *
 * @param {Object} baseConfig - Base configuration object
 * @param {Object} envOverrides - Environment-specific overrides
 * @returns {Object} - Final configuration with overrides applied
 */
function applyEnvironmentOverrides(baseConfig, envOverrides) {
  return mergeConfigurations(baseConfig, envOverrides);
}

module.exports = {
  mergeConfigurations,
  validateConfiguration,
  applyEnvironmentOverrides,
};
