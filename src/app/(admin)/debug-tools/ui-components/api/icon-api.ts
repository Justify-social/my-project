'use client';

/**
 * Icon information
 */
export interface IconInfo {
  name: string;
  category: string;
  variants: string[];
  sizes: string[];
  path: string;
  solidPath: string;
  usage: string;
  tags?: string[];
}

/**
 * Icon API for the UI Component Library
 */
export const iconApi = {
  /**
   * Get all icons
   */
  async getIcons(): Promise<IconInfo[]> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, return dummy data
      return [
        {
          name: 'home',
          category: 'navigation',
          variants: ['light', 'solid'],
          sizes: ['16', '24', '32'],
          path: '/icons/light/home.svg',
          solidPath: '/icons/solid/home.svg',
          usage: '<Icon name="home" />',
          tags: ['house', 'dashboard', 'main']
        },
        {
          name: 'settings',
          category: 'application',
          variants: ['light', 'solid'],
          sizes: ['16', '24', '32'],
          path: '/icons/light/settings.svg',
          solidPath: '/icons/solid/settings.svg',
          usage: '<Icon name="settings" />',
          tags: ['preferences', 'config', 'gear']
        },
        {
          name: 'user',
          category: 'users',
          variants: ['light', 'solid'],
          sizes: ['16', '24', '32'],
          path: '/icons/light/user.svg',
          solidPath: '/icons/solid/user.svg',
          usage: '<Icon name="user" />',
          tags: ['person', 'profile', 'account']
        }
      ];
    } catch (error) {
      console.error('Error fetching icons:', error);
      return [];
    }
  },

  /**
   * Get icon categories
   */
  async getIconCategories(): Promise<string[]> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, return dummy data
      return [
        'navigation',
        'application',
        'users',
        'files',
        'commerce',
        'communication',
        'devices',
        'media'
      ];
    } catch (error) {
      console.error('Error fetching icon categories:', error);
      return [];
    }
  },

  /**
   * Validate an icon name
   */
  async validateIconName(name: string): Promise<boolean> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, validate against a hardcoded list
      const validIcons = ['home', 'settings', 'user', 'document', 'chart', 'message'];
      return validIcons.includes(name);
    } catch (error) {
      console.error(`Error validating icon name '${name}':`, error);
      return false;
    }
  },

  /**
   * Find similar icons
   */
  async findSimilarIcons(name: string): Promise<IconInfo[]> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, return dummy data
      const dummyResults: Record<string, IconInfo[]> = {
        home: [
          {
            name: 'house',
            category: 'buildings',
            variants: ['light', 'solid'],
            sizes: ['16', '24', '32'],
            path: '/icons/light/house.svg',
            solidPath: '/icons/solid/house.svg',
            usage: '<Icon name="house" />',
            tags: ['home', 'residence', 'dwelling']
          }
        ],
        user: [
          {
            name: 'person',
            category: 'users',
            variants: ['light', 'solid'],
            sizes: ['16', '24', '32'],
            path: '/icons/light/person.svg',
            solidPath: '/icons/solid/person.svg',
            usage: '<Icon name="person" />',
            tags: ['user', 'profile', 'individual']
          }
        ]
      };
      
      return dummyResults[name] || [];
    } catch (error) {
      console.error(`Error finding similar icons for '${name}':`, error);
      return [];
    }
  }
}; 