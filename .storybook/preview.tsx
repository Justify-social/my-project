import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/components/providers/theme-provider';
import '../src/app/globals.css';

// Create a decorator for theme support
const withThemeProvider = Story => {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="p-6">
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: 'light', color: '#ffffff' },
        { name: 'dark', class: 'dark', color: '#1a1a1a' },
      ],
    },
  },
  // Apply global decorators
  decorators: [withThemeProvider],
};

export default preview;
