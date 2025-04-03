// This file is now located at config/eslint/eslintrc.js
// This is a redirect file for backward compatibility
module.exports = {
  plugins: [
    'icon-standards'
  ],
  
  extends: [
    'plugin:icon-standards/recommended'
  ],
  
  rules: {
    'icon-standards/no-fontawesome-direct-import': 'error',
    'icon-standards/prefer-icon-id-prop': 'error'
  }
};