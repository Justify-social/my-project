import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import nextjs from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Dedicated global ignores object
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'build/**',
      'dist/**',
      'vercel-mcp-server/dist/**',
      'public/**', // Be careful, this ignores all of public. If you have JS/TS in public you want linted, adjust.
      'scripts-backup-*/**',
      'src/components/ui/LoadingSpinner.tsx', // Specific file ignore example
      '**/*.bak',
      '**/*.backup',
      '**/*.old',
      '**/*.tmp',
      '.backup/**',
      'logs/**',
      'coverage/**',
      'archives/**',
      // 'src/app/(campaigns)/campaigns/wizard/step-*/**', // Example of more specific src ignore
      'config/**',
      'graphiti-env/**',
      'src/lib/generated/**',
      'graphiti_src/**',
      // Add other top-level ignores here if needed
    ],
  },
  // Keep TypeScript recommended
  {
    ...compat.extends('plugin:@typescript-eslint/recommended')[0],
  },
  // Add Next.js configuration
  {
    plugins: {
      '@next/next': nextjs,
    },
    rules: {
      ...nextjs.configs.recommended.rules,
      ...nextjs.configs['core-web-vitals'].rules,
    },
  },
  // Add custom overrides (rules only now, ignores moved)
  {
    // Ignores was here, now moved to its own global config object
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'jsx-a11y/role-has-required-aria-props': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'prefer-const': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/components/ui/icon',
              message:
                'Import Icon directly from "@/components/ui/icon/icon" instead for proper app icon handling.',
            },
          ],
        },
      ],
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];

export default eslintConfig;
