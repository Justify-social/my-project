/**
 * Jest setup file
 *
 * This file configures the testing environment for UI components.
 */

// Import necessary testing libraries
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

/* // Mock removed as the target module no longer exists
// Mock FontAwesome icon integration
jest.mock('@/components/ui/utils/icon-integration', () => ({
  getIconClasses: jest.fn().mockImplementation((icon) => `fa-light fa-${icon}`),
}));
*/

// Mock theme related utils
jest.mock('next-themes', () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark'],
  }),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
