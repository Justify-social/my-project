import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Include Next.js recommended rules using FlatCompat
  {
    ...compat.extends('next')[0],
    rules: {
      ...compat.extends('next')[0].rules,
      'react/jsx-key': 'off', // Disable jsx-key rule from Next.js if needed
    },
  },
  // Keep TypeScript recommended
  {
    ...compat.extends('plugin:@typescript-eslint/recommended')[0],
  },
  // Add custom overrides
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'build/**',
      'dist/**',
      'public/**',
      'scripts-backup-*/**',
      'src/components/ui/LoadingSpinner.tsx',
      '**/*.bak',
      '**/*.backup',
      '**/*.old',
      '**/*.tmp',
      '.backup/**',
      'logs/**',
      'coverage/**',
      'archives/**',
      'src/app/(campaigns)/campaigns/wizard/step-*/**',
      'config/**',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'jsx-a11y/role-has-required-aria-props': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'prefer-const': 'warn',
      'no-restricted-imports': ['error', {
        'paths': [{
          'name': '@/components/ui/icon',
          'message': 'Import Icon directly from "@/components/ui/icon/icon" instead for proper app icon handling.'
        }]
      }],
      '@typescript-eslint/no-empty-interface': 'off',
    }
  },
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  }
];

export default eslintConfig;
