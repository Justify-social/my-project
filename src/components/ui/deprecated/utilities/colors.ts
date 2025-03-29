/**
 * Brand Colors Palette
 * 
 * This file centralizes all color definitions used throughout the application.
 * When updating colors, only change them here to ensure consistency.
 */

export const colors = {
  // Primary Colors
  primary: {
    main: '#333333', // Jet
    variable: 'var(--primary-color)',
  },
  
  // Secondary Colors
  secondary: {
    main: '#4A5568', // Payne's Grey
    variable: 'var(--secondary-color)',
  },
  
  // Accent Colors
  accent: {
    main: '#00BFFF', // Deep Sky Blue
    variable: 'var(--accent-color)',
  },
  
  // Background Colors
  background: {
    main: '#FFFFFF', // White
    variable: 'var(--background-color)',
  },
  
  // Divider Colors
  divider: {
    main: '#D1D5DB', // French Grey
    variable: 'var(--divider-color)',
  },
  
  // Interactive Colors
  interactive: {
    main: '#3182CE', // Medium Blue
    variable: 'var(--interactive-color)',
  },
  
  // Status Colors
  status: {
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    error: '#EF4444',   // Red
    info: '#3B82F6',    // Blue
  }
};

/**
 * Root CSS variables to insert into your CSS/SCSS file
 * 
 * :root {
 *   --primary-color: #333333;
 *   --secondary-color: #4A5568;
 *   --accent-color: #00BFFF;
 *   --background-color: #FFFFFF;
 *   --divider-color: #D1D5DB;
 *   --interactive-color: #3182CE;
 * }
 */

export default colors; 