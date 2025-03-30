'use client';

import { IconInfo, IconCategory } from './icon-api';

/**
 * File-system based icon API that reads directly from /public/icons
 */
class FileSystemIconApi {
  // Base URL for icons in public directory
  private baseUrl: string = '/icons';
  
  // Available icon weights (folders)
  private readonly weights = ['light', 'regular', 'solid', 'brands'];
  
  // Cache for icons and categories
  private iconsCache: { items: IconInfo[] } | null = null;
  private categoriesCache: IconCategory[] | null = null;
  
  /**
   * Get all available icons from the public/icons directory
   */
  async getIcons(): Promise<{ items: IconInfo[] }> {
    try {
      // If we have cached data and not in development, return it
      if (this.iconsCache && process.env.NODE_ENV !== 'development') {
        return this.iconsCache;
      }
      
      // Scan all icon directories
      const icons: IconInfo[] = [];
      
      for (const weight of this.weights) {
        try {
          const response = await fetch(`/api/file-system?directory=/icons/${weight}&extension=.svg`);
          if (!response.ok) continue;
          
          const files = await response.json();
          
          // Process each file into an icon record
          for (const file of files) {
            try {
              const name = this.fileNameToIconName(file.name);
              const svgResponse = await fetch(`${this.baseUrl}/${weight}/${file.name}`);
              
              if (!svgResponse.ok) continue;
              
              const svgContent = await svgResponse.text();
              const category = this.getCategoryFromTags(name, file.name) || 'Uncategorized';
              
              // Parse width, height and viewBox from SVG content
              const { viewBox, width, height } = this.extractSvgDimensions(svgContent);
              
              icons.push({
                id: `${weight}-${file.name}`,
                name,
                path: `${this.baseUrl}/${weight}/${file.name}`,
                category,
                weight,
                tags: this.generateTagsFromName(file.name),
                viewBox,
                width,
                height,
                svgContent,
                usageCount: Math.floor(Math.random() * 50) // Random usage count for demo
              });
            } catch (err) {
              console.warn(`Error processing icon ${file.name}:`, err);
              // Continue with next file
            }
          }
        } catch (err) {
          console.warn(`Error fetching icons for weight ${weight}:`, err);
          // Continue with next weight
        }
      }
      
      // If no icons were found, try fallback to direct path scanning
      if (icons.length === 0) {
        await this.scanIconsViaDirectFetch(icons);
      }
      
      this.iconsCache = { items: icons };
      return this.iconsCache;
    } catch (error) {
      console.error('Error fetching icons:', error);
      throw error;
    }
  }
  
  /**
   * Fallback method to scan icons via direct fetch
   */
  private async scanIconsViaDirectFetch(icons: IconInfo[]) {
    for (const weight of this.weights) {
      const commonIcons = [
        'user', 'home', 'search', 'check', 'cog', 'gear', 'star', 
        'heart', 'download', 'upload', 'trash', 'edit', 'pencil',
        'play', 'pause', 'bell', 'calendar', 'envelope'
      ];
      
      for (const iconName of commonIcons) {
        try {
          const svgResponse = await fetch(`${this.baseUrl}/${weight}/${iconName}.svg`);
          if (!svgResponse.ok) continue;
          
          const svgContent = await svgResponse.text();
          const name = this.fileNameToIconName(iconName + '.svg');
          const category = this.getCategoryFromTags(name, iconName + '.svg') || 'Uncategorized';
          const { viewBox, width, height } = this.extractSvgDimensions(svgContent);
          
          icons.push({
            id: `${weight}-${iconName}.svg`,
            name,
            path: `${this.baseUrl}/${weight}/${iconName}.svg`,
            category,
            weight,
            tags: this.generateTagsFromName(iconName + '.svg'),
            viewBox,
            width,
            height,
            svgContent,
            usageCount: Math.floor(Math.random() * 50)
          });
        } catch (err) {
          // Just skip this icon and try the next one
        }
      }
    }
  }
  
  /**
   * Extract SVG dimensions from SVG content
   */
  private extractSvgDimensions(svgContent: string): { viewBox: string, width: number, height: number } {
    // Default values
    let viewBox = '0 0 24 24';
    let width = 24;
    let height = 24;
    
    try {
      // Extract viewBox
      const viewBoxMatch = svgContent.match(/viewBox=["']([^"']*)["']/i);
      if (viewBoxMatch && viewBoxMatch[1]) {
        viewBox = viewBoxMatch[1];
        
        // Extract width and height from viewBox if not explicitly defined
        const viewBoxParts = viewBox.split(' ').map(Number);
        if (viewBoxParts.length === 4) {
          width = viewBoxParts[2];
          height = viewBoxParts[3];
        }
      }
      
      // Extract explicit width if present
      const widthMatch = svgContent.match(/width=["']([^"']*)["']/i);
      if (widthMatch && widthMatch[1]) {
        const parsedWidth = parseInt(widthMatch[1], 10);
        if (!isNaN(parsedWidth)) {
          width = parsedWidth;
        }
      }
      
      // Extract explicit height if present
      const heightMatch = svgContent.match(/height=["']([^"']*)["']/i);
      if (heightMatch && heightMatch[1]) {
        const parsedHeight = parseInt(heightMatch[1], 10);
        if (!isNaN(parsedHeight)) {
          height = parsedHeight;
        }
      }
    } catch (err) {
      console.warn('Error extracting SVG dimensions:', err);
    }
    
    return { viewBox, width, height };
  }
  
  /**
   * Convert file name to display name (e.g., "magnifying-glass.svg" -> "IconMagnifyingGlass")
   */
  private fileNameToIconName(fileName: string): string {
    // Remove file extension
    const baseName = fileName.replace(/\.svg$/, '');
    
    // Convert to title case with camelCase
    return 'Icon' + baseName.split(/[-_]/).map(
      part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join('');
  }
  
  /**
   * Generate tags from file name
   */
  private generateTagsFromName(fileName: string): string[] {
    const baseName = fileName.replace(/\.svg$/, '');
    const tags: string[] = [];
    
    // Add the base name itself
    tags.push(baseName);
    
    // Add parts of compound names
    if (baseName.includes('-')) {
      const parts = baseName.split('-');
      tags.push(...parts);
    }
    
    // Add aliases for common icons
    const aliases: Record<string, string[]> = {
      'magnifying-glass': ['search', 'find', 'zoom'],
      'home': ['house', 'main'],
      'gear': ['settings', 'preferences', 'cog'],
      'cog': ['gear', 'settings', 'preferences'],
      'trash': ['delete', 'remove', 'bin'],
      'envelope': ['email', 'mail', 'message'],
      'bell': ['notification', 'alert'],
      'user': ['profile', 'account', 'person'],
      'users': ['people', 'group', 'team'],
      'star': ['favorite', 'bookmark'],
      'heart': ['like', 'love', 'favorite'],
      'pen': ['edit', 'write', 'modify'],
      'pencil': ['edit', 'write', 'modify'],
      'check': ['success', 'complete', 'done'],
      'xmark': ['close', 'cancel', 'times'],
      'times': ['close', 'cancel', 'x'],
      'calendar': ['date', 'schedule', 'event'],
      'download': ['save', 'export', 'store'],
      'upload': ['import', 'share'],
    };
    
    // Add aliases if available
    for (const [key, aliasList] of Object.entries(aliases)) {
      if (baseName === key || baseName.includes(key)) {
        tags.push(...aliasList);
      }
    }
    
    // Ensure unique tags
    return [...new Set(tags)];
  }
  
  /**
   * Determine category based on icon name or tags
   */
  private getCategoryFromTags(name: string, fileName: string): string | null {
    const baseName = fileName.replace(/\.svg$/, '').toLowerCase();
    const categories: Record<string, string[]> = {
      'Navigation': ['home', 'house', 'arrow', 'angle', 'chevron', 'direction', 'map', 'location', 'compass'],
      'User': ['user', 'person', 'profile', 'account', 'avatar'],
      'Interface': ['check', 'xmark', 'times', 'close', 'plus', 'minus', 'circle', 'square'],
      'Communication': ['comment', 'message', 'chat', 'envelope', 'mail', 'email', 'phone', 'call'],
      'Media': ['image', 'photo', 'picture', 'video', 'camera', 'music', 'play', 'pause', 'stop'],
      'Commerce': ['cart', 'shop', 'store', 'bag', 'money', 'dollar', 'credit', 'coin'],
      'Data': ['chart', 'graph', 'bar', 'pie', 'data', 'analytics', 'statistics'],
      'File': ['file', 'document', 'folder', 'save', 'upload', 'download'],
      'Security': ['lock', 'unlock', 'key', 'shield', 'protection', 'secure'],
      'Social': ['share', 'like', 'heart', 'star', 'thumbs', 'social', 'network'],
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (baseName.includes(keyword)) {
          return category;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get all icon categories
   */
  async getIconCategories(): Promise<IconCategory[]> {
    try {
      // If we have cached data and not in development, return it
      if (this.categoriesCache && process.env.NODE_ENV !== 'development') {
        return this.categoriesCache;
      }
      
      // Get all icons first to determine categories
      const icons = await this.getIcons();
      
      // Count icons by category
      const categoryCounts: Record<string, number> = {};
      
      for (const icon of icons.items) {
        if (!categoryCounts[icon.category]) {
          categoryCounts[icon.category] = 0;
        }
        categoryCounts[icon.category]++;
      }
      
      // Create category objects
      const categories: IconCategory[] = Object.entries(categoryCounts).map(([name, count]) => ({
        id: name,
        name,
        count,
        description: `${name} icons for the UI`
      }));
      
      this.categoriesCache = categories;
      return categories;
    } catch (error) {
      console.error('Error fetching icon categories:', error);
      throw error;
    }
  }
  
  /**
   * Find similar icons to a given icon
   */
  async findSimilarIcons(iconId: string): Promise<IconInfo[]> {
    try {
      // Get all icons first
      const allIcons = await this.getIcons();
      
      // Find the target icon
      const targetIcon = allIcons.items.find(icon => icon.id === iconId);
      if (!targetIcon) {
        return [];
      }
      
      // Filter icons that share tags with the target icon
      return allIcons.items
        .filter(icon => 
          icon.id !== iconId && // Not the same icon
          icon.tags.some(tag => targetIcon.tags.includes(tag)) // Has at least one common tag
        )
        .slice(0, 5); // Limit to 5 similar icons
    } catch (error) {
      console.error('Error finding similar icons:', error);
      throw error;
    }
  }
  
  /**
   * Validate if an icon name is valid and available
   */
  async validateIconName(name: string): Promise<boolean> {
    try {
      // Simple validation - not empty and follows naming convention
      if (!name || !name.match(/^Icon[A-Z][a-zA-Z0-9]*$/)) {
        return false;
      }
      
      // Check if name already exists
      const allIcons = await this.getIcons();
      return !allIcons.items.some(icon => icon.name === name);
    } catch (error) {
      console.error('Error validating icon name:', error);
      throw error;
    }
  }
}

// Export a singleton instance of the API
export const fileSystemIconApi = new FileSystemIconApi(); 