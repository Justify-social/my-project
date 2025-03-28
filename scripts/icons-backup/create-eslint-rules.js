/**
 * Icon ESLint Rules Generator
 * 
 * This script creates a set of ESLint rules to enforce icon system best practices.
 * It generates a configuration file that can be integrated into the project's ESLint setup.
 * 
 * Usage:
 *   node scripts/icons/create-eslint-rules.js          # Normal mode
 *   node scripts/icons/create-eslint-rules.js --install # Install into eslintrc
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Process command line arguments
const args = process.argv.slice(2);
const shouldInstall = args.includes('--install');

// Paths
const outputPath = path.join(__dirname, 'icon-eslint-rules.js');
const eslintRcPath = path.join(__dirname, '..', '..', '.eslintrc.js');
const eslintRcJsonPath = path.join(__dirname, '..', '..', '.eslintrc.json');

// ESLint rule definitions
const iconEslintRules = `/**
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
`;

// Function to write the rules file
function writeRulesFile() {
  fs.writeFileSync(outputPath, iconEslintRules, 'utf8');
  console.log(`Icon ESLint rules written to: ${outputPath}`);
}

// Function to install rules into ESLint config
function installRules() {
  console.log('\nInstalling rules into ESLint configuration...');
  
  // Determine whether to use .js or .json
  let eslintrcPath = null;
  let isJson = false;
  
  if (fs.existsSync(eslintRcPath)) {
    eslintrcPath = eslintRcPath;
  } else if (fs.existsSync(eslintRcJsonPath)) {
    eslintrcPath = eslintRcJsonPath;
    isJson = true;
  }
  
  if (!eslintrcPath) {
    console.error('No .eslintrc.js or .eslintrc.json found in project root.');
    console.log('Rules file has been created, but not installed. Manual installation required.');
    return;
  }
  
  // Backup original config
  const backupPath = `${eslintrcPath}.bak`;
  fs.copyFileSync(eslintrcPath, backupPath);
  console.log(`Original ESLint config backed up to: ${backupPath}`);
  
  if (isJson) {
    // Handle JSON config
    const eslintConfig = JSON.parse(fs.readFileSync(eslintrcPath, 'utf8'));
    
    // Add new extends reference
    if (!eslintConfig.extends) {
      eslintConfig.extends = [];
    } else if (typeof eslintConfig.extends === 'string') {
      eslintConfig.extends = [eslintConfig.extends];
    }
    
    // Add the path to our rules file
    const relativePath = path.relative(
      path.dirname(eslintrcPath),
      outputPath
    ).replace(/\\/g, '/');
    
    eslintConfig.extends.push(`./${relativePath}`);
    
    // Write updated config
    fs.writeFileSync(eslintrcPath, JSON.stringify(eslintConfig, null, 2), 'utf8');
    
  } else {
    // Handle JS config
    let eslintConfigContent = fs.readFileSync(eslintrcPath, 'utf8');
    
    // Check if module.exports exists
    if (!eslintConfigContent.includes('module.exports')) {
      console.error('Could not find module.exports in .eslintrc.js.');
      console.log('Rules file has been created, but not installed. Manual installation required.');
      return;
    }
    
    // Create the require statement
    const relativePath = path.relative(
      path.dirname(eslintrcPath),
      outputPath
    ).replace(/\\/g, '/');
    
import iconRules from './${relativePath}';
    
    // Add the require statement at the top of the file
    eslintConfigContent = requireStatement + eslintConfigContent;
    
    // Check if extends property exists and add our rules
    if (eslintConfigContent.includes('extends:')) {
      // Add to existing extends
      eslintConfigContent = eslintConfigContent.replace(
        /extends:\s*(\[|'|")/,
        (match, bracket) => {
          if (bracket === '[') {
            return `extends: [iconRules, `;
          } else {
            return `extends: [iconRules, ${bracket}`;
          }
        }
      );
    } else {
      // Add new extends property
      eslintConfigContent = eslintConfigContent.replace(
        /module\.exports\s*=\s*\{/,
        'module.exports = {\n  extends: [iconRules],'
      );
    }
    
    // Write updated config
    fs.writeFileSync(eslintrcPath, eslintConfigContent, 'utf8');
  }
  
  console.log(`Successfully installed icon rules into ESLint configuration: ${eslintrcPath}`);
  console.log('\nTo use these rules, restart your ESLint server or editor.');
}

// Main function
function main() {
  console.log('Generating ESLint rules for icon system...');
  
  // Write the rules file
  writeRulesFile();
  
  // Install if requested
  if (shouldInstall) {
    installRules();
  } else {
    console.log('\nTo install these rules into your ESLint configuration, run:');
    console.log(`node ${path.relative(process.cwd(), __filename)} --install`);
  }
}

// Run the script
main(); 