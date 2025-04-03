// This file is now located at config/eslint/eslintrc.js
// This is a redirect file for backward compatibility
module.exports = require('./config/eslint/eslintrc.js');

rules: {
  'custom/icon-standards': 'error', // Enforce standardized icon usage
}

plugins: [
  'custom'
]