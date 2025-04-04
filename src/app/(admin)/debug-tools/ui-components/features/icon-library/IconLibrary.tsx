'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/organisms/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/molecules/tabs/tabs'
import { Badge } from '@/components/ui/atoms/badge/badge'
import { Button } from '@/components/ui/atoms/button/Button'
import { Input } from '@/components/ui/atoms/input/Input'
import { Slider } from '@/components/ui/atoms/slider/slider';
import { Switch } from '@/components/ui/atoms/switch/Switch'
import { Select } from '@/components/ui/atoms/select/Select'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/molecules/feedback/alert'
import { Icon } from '@/components/ui/atoms/icon';
import { iconApi } from '../../api/icon-api';
import { IconErrorBoundary } from './IconErrorBoundary';

// Debug flag
const DEBUG = true;

// Helper for debug logging
const debug = (...args: any[]) => {
  if (DEBUG) {
    console.log('[IconLibrary]', ...args);
  }
};

/**
 * Icon metadata interface
 */
export interface IconMetadata {
  id: string;
  name: string;
  svgContent: string;
  category?: string;
  tags?: string[];
  weight?: string;
  version?: string;
  path?: string;
  viewBox?: string;
  width?: number;
  height?: number;
  usageCount?: number;
}

/**
 * Icon category interface
 */
interface IconCategory {
  id: string;
  name: string;
  count: number;
  description: string;
}

/**
 * Interface for search filters
 */
interface SearchFilters {
  category: string | null;
  minUsage: number;
}

/**
 * IconLibrary wrapper component that includes error boundary
 */
export default function IconLibraryWrapper() {
  return (
    <IconErrorBoundary>
      <IconLibrary />
    </IconErrorBoundary>
  );
}

/**
 * IconLibrary Component
 * 
 * Comprehensive icon management interface that allows:
 * - Discovering and browsing available icons
 * - Searching by name, tags, and visual similarity
 * - Interactive previewing with size and color adjustments
 * - Usage analytics and optimization recommendations
 */
function IconLibrary() {
  // State for icons and categories
  const [icons, setIcons] = useState<IconMetadata[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<IconMetadata[]>([]);
  const [categories, setCategories] = useState<IconCategory[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: null,
    minUsage: 0,
  });
  
  // State for selected icon and preview options
  const [selectedIcon, setSelectedIcon] = useState<IconMetadata | null>(null);
  const [iconSize, setIconSize] = useState(24);
  const [iconColor, setIconColor] = useState('#333333');
  const [showBackground, setShowBackground] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  
  // State for UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [similarIcons, setSimilarIcons] = useState<IconMetadata[]>([]);
  const [loadAttempt, setLoadAttempt] = useState(0); // For retrying
  
  // Reference to the API
  const apiRef = useRef(iconApi);
  
  // Load icons and categories on initial render or retry
  useEffect(() => {
    loadIcons();
    loadCategories();
  }, [loadAttempt]);
  
  // Filter icons when search query or filters change
  useEffect(() => {
    filterIcons();
  }, [searchQuery, filters, icons]);
  
  // Load icons from the API
  const loadIcons = async () => {
    try {
      setLoading(true);
      setError(null);
      debug('Loading icons...');
      
      // Fetch icons from API
      const result = await apiRef.current.getIcons();
      debug('API result:', result);
      
      if (result && Array.isArray(result.items)) {
        const iconData = result.items;
        debug('Icons loaded successfully:', iconData.length);
        
        // Basic validation
        if (iconData.length === 0) {
          setError('No icons were found in the registry. The icon registry may be empty or misconfigured.');
          setIcons([]);
          setFilteredIcons([]);
          return;
        }
        
        // Check for valid SVG content in at least some icons
        const validSvgCount = iconData.filter(icon => 
          icon && icon.svgContent && icon.svgContent.includes('<svg')
        ).length;
        
        if (validSvgCount === 0 && iconData.length > 0) {
          debug('No valid SVG content found in icons');
          setError('Icons were found but none have valid SVG content.');
        }
        
        // Set icons state
        setIcons(iconData);
        
        // Extract unique weights with null check
        const uniqueWeights = Array.from(
          new Set(iconData.map(icon => icon.weight || 'regular'))
        );
        setWeights(uniqueWeights);
        
        // Initially display all icons
        setFilteredIcons(iconData);
      } else {
        debug('No icons found in API response:', result);
        setError('No icons found. Please check the icon registry.');
        setIcons([]);
        setFilteredIcons([]);
      }
    } catch (err) {
      debug('Error loading icons:', err);
      console.error('Error loading icons:', err);
      setError(`Failed to load icons: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIcons([]);
      setFilteredIcons([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load icon categories from the API
  const loadCategories = async () => {
    try {
      debug('Loading categories...');
      // Get categories from API
      const categoryData = await apiRef.current.getIconCategories();
      debug('Categories loaded:', categoryData);
      
      if (categoryData && categoryData.length > 0) {
        // Create category objects with count information
        const categories = categoryData.map(name => {
          const count = icons.filter(icon => icon.category === name).length;
          return {
            id: name,
            name,
            count,
            description: ''
          };
        });
        
        setCategories(categories);
      } else {
        debug('No categories found');
        setCategories([]);
      }
    } catch (err) {
      debug('Error loading categories:', err);
      console.error('Error loading categories:', err);
      setCategories([]);
    }
  };
  
  // Handle retrying after error
  const handleRetry = () => {
    debug('Retrying icon load');
    setLoadAttempt(prev => prev + 1);
  };
  
  // Handle searching and filtering of icons
  const filterIcons = () => {
    // Safety check to ensure icons is defined and is an array
    if (!icons || !Array.isArray(icons) || icons.length === 0) {
      setFilteredIcons([]);
      return;
    }
    
    debug('Filtering icons with query:', searchQuery, 'and filters:', filters);
    let filtered = [...icons];
    
    // Apply search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(icon => 
        (icon.name?.toLowerCase().includes(query)) || 
        (Array.isArray(icon.tags) && icon.tags.some(tag => tag?.toLowerCase().includes(query)))
      );
    }
    
    // Apply category filter with null checks
    if (filters.category) {
      filtered = filtered.filter(icon => icon.category === filters.category);
    }
    
    // Apply usage count filter with null checks
    if (filters.minUsage > 0) {
      filtered = filtered.filter(icon => (icon.usageCount || 0) >= filters.minUsage);
    }
    
    // Sort by relevance if searching, otherwise by name
    if (searchQuery && searchQuery.trim()) {
      filtered.sort((a, b) => {
        // Ensure name properties exist
        const aName = a.name || '';
        const bName = b.name || '';
        const query = searchQuery.toLowerCase();
        
        // Exact matches come first
        const aExact = aName.toLowerCase() === query;
        const bExact = bName.toLowerCase() === query;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then sort by starts with
        const aStartsWith = aName.toLowerCase().startsWith(query);
        const bStartsWith = bName.toLowerCase().startsWith(query);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then by usage count
        return (b.usageCount || 0) - (a.usageCount || 0);
      });
    } else {
      filtered.sort((a, b) => {
        const aName = a.name || '';
        const bName = b.name || '';
        return aName.localeCompare(bName);
      });
    }
    
    debug(`Filtered to ${filtered.length} icons`);
    setFilteredIcons(filtered);
  };
  
  // Find similar icons to the selected icon
  const findSimilarIcons = useCallback(async () => {
    if (!selectedIcon) return;
    
    try {
      debug('Finding similar icons for:', selectedIcon.id);
      const result = await iconApi.findSimilarIcons(selectedIcon.id);
      debug('Similar icons found:', result.length);
      setSimilarIcons(result);
    } catch (err) {
      debug("Error finding similar icons:", err);
      console.error("Error finding similar icons:", err);
      setSimilarIcons([]);
    }
  }, [selectedIcon]);
  
  // Update similar icons when selected icon changes
  useEffect(() => {
    if (selectedIcon) {
      findSimilarIcons();
    } else {
      setSimilarIcons([]);
    }
  }, [selectedIcon, findSimilarIcons]);
  
  // Handle icon selection
  const handleSelectIcon = (icon: IconMetadata) => {
    debug('Icon selected:', icon.id);
    setSelectedIcon(icon);
    setActiveTab('preview');
  };
  
  // Copy icon code to clipboard
  const copyIconCode = () => {
    if (!selectedIcon) return;
    
    const code = `<Icon name="${selectedIcon.name}" ${iconSize !== 24 ? `size={${iconSize}}` : ''} ${iconColor !== '#333333' ? `color="${iconColor}"` : ''} />`;
    
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Generate code example for the selected icon
  const generateCodeExample = (icon: IconMetadata) => {
    if (!icon) return '';
    
    return `<Icon 
  name="${icon.name}" 
  ${iconSize !== 24 ? `size={${iconSize}}` : ''}
  ${iconColor !== '#333333' ? `color="${iconColor}"` : ''}
/>`;
  };
  
  // Add a helper function to format icon names
  const formatIconName = (name: string): string => {
    // Remove 'fa' prefix if it exists
    let formattedName = name.startsWith('fa') ? name.substring(2) : name;
    
    // Convert camelCase to words with spaces
    formattedName = formattedName.replace(/([A-Z])/g, ' $1');
    
    // Capitalize first letter
    formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    
    return formattedName.trim();
  };
  
  // Safely render SVG content with React
  const SafeSvgRenderer = ({ 
    svgContent, 
    size = 24, 
    color = 'currentColor',
    className = '',
    iconHoverEffect = false
  }: { 
    svgContent: string; 
    size?: number; 
    color?: string;
    className?: string;
    iconHoverEffect?: boolean;
  }) => {
    // Create sanitized and processed SVG
    const processedSvg = useMemo(() => {
      if (!svgContent) return null;

      try {
        // Set default size if viewBox is not present
        let cleanSvg = svgContent;

        // Replace the fill attribute with the color prop value, or remove it to use currentColor
        cleanSvg = cleanSvg.replace(/fill="[^"]*"/g, `fill="${color}"`);
        
        // Set explicit width and height attributes
        cleanSvg = cleanSvg.replace(/<svg([^>]*)>/, `<svg$1 width="${size}" height="${size}">`);
        
        // Add hover effect data attribute if requested
        if (iconHoverEffect) {
          // Prepare both light and solid versions for hover effect
          const lightVersion = cleanSvg;
          const solidVersion = cleanSvg.replace(/weight="light"/g, 'weight="solid"');
          
          return {
            light: lightVersion,
            solid: solidVersion,
            __html: lightVersion
          };
        }
        
        return { __html: cleanSvg };
      } catch (error) {
        console.error('Error processing SVG:', error);
        return { __html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><rect width="24" height="24" fill="red" opacity="0.2" /><text x="50%" y="50%" font-size="8" text-anchor="middle" fill="red">Error</text></svg>` };
      }
    }, [svgContent, size, color, iconHoverEffect]);

    // If there's no SVG, show a placeholder
    if (!processedSvg) {
      return (
        <div 
          className={`inline-flex items-center justify-center bg-gray-100 text-gray-400 rounded ${className}`} 
          style={{ width: size, height: size }}
        >
          ?
        </div>
      );
    }

    // Handle hover effect with CSS
    if (iconHoverEffect && processedSvg.light && processedSvg.solid) {
      return (
        <div className={`relative inline-block ${className}`}>
          {/* Light version (default) */}
          <div className="group-hover:opacity-0 transition-opacity duration-200">
            <div dangerouslySetInnerHTML={{ __html: processedSvg.light }} />
          </div>
          
          {/* Solid version (on hover) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div dangerouslySetInnerHTML={{ __html: processedSvg.solid }} />
          </div>
        </div>
      );
    }

    // Regular rendering without hover effect
    return <div className={className} dangerouslySetInnerHTML={processedSvg} />;
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Icon iconId="faSpinnerLight"  className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div>Loading icon library...</div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <Icon iconId="faTriangleExclamationLight"  className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <div className="mb-4">{error}</div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRetry}
          >
            <Icon iconId="faRotateLight"  className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon iconId="faQuestionLight"  className="mr-2 h-5 w-5" />
          Icon Library
        </CardTitle>
        <CardDescription>
          Browse, search, and preview icons from the design system
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="browse" className="flex-1">
              <Icon iconId="faQuestionLight"  className="mr-2 h-4 w-4" />
              Browse
            </TabsTrigger>
            {selectedIcon && (
              <TabsTrigger value="preview" className="flex-1">
                <Icon iconId="faQuestionLight"  className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="flex-1">
              <Icon iconId="faQuestionLight"  className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex-1">
              <Icon iconId="faQuestionLight"  className="mr-2 h-4 w-4" />
              Optimization
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Browse Tab */}
        <TabsContent value="browse" className="p-0">
          <div className="p-6 border-b">
            <div className="grid gap-4 md:grid-cols-[1fr_2fr] lg:grid-cols-[250px_1fr]">
              {/* Filters */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Categories</h3>
                  <div className="space-y-1">
                    <Button
                      variant={filters.category === null ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-start font-medium ${filters.category === null ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                      onClick={() => setFilters({ ...filters, category: null })}
                    >
                      All Categories
                    </Button>
                    
                    {/* Brand Icons */}
                    <Button
                      variant={filters.category === 'brands' ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-start font-medium ${filters.category === 'brands' ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                      onClick={() => setFilters({ ...filters, category: 'brands' })}
                    >
                      Brand
                      <Badge variant={filters.category === 'brands' ? "secondary" : "outline"} className="ml-auto">
                        {icons.filter(icon => icon.category === 'brands').length}
                      </Badge>
                    </Button>
                    
                    {/* App Icons */}
                    <Button
                      variant={filters.category === 'app' ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-start font-medium ${filters.category === 'app' ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                      onClick={() => setFilters({ ...filters, category: 'app' })}
                    >
                      App
                      <Badge variant={filters.category === 'app' ? "secondary" : "outline"} className="ml-auto">
                        {icons.filter(icon => icon.category === 'app').length}
                      </Badge>
                    </Button>
                    
                    {/* KPI Icons */}
                    <Button
                      variant={filters.category === 'kpis' ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-start font-medium ${filters.category === 'kpis' ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                      onClick={() => setFilters({ ...filters, category: 'kpis' })}
                    >
                      KPIs
                      <Badge variant={filters.category === 'kpis' ? "secondary" : "outline"} className="ml-auto">
                        {icons.filter(icon => icon.category === 'kpis').length}
                      </Badge>
                    </Button>
                    
                    {/* Light/Solid Icons */}
                    <Button
                      variant={filters.category === 'light' || filters.category === 'solid' ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-start font-medium ${filters.category === 'light' || filters.category === 'solid' ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                      onClick={() => setFilters({ ...filters, category: 'light' })}
                    >
                      Icons
                      <Badge variant={filters.category === 'light' || filters.category === 'solid' ? "secondary" : "outline"} className="ml-auto">
                        {icons.filter(icon => icon.category === 'light' || icon.category === 'solid').length}
                      </Badge>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-medium">Usage</h3>
                  <Slider
                    value={[filters.minUsage]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={(value) => setFilters({ ...filters, minUsage: value[0] })}
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>All</span>
                    <span>Min usage: {filters.minUsage}</span>
                  </div>
                </div>
              </div>
              
              {/* Search and Results */}
              <div className="space-y-4">
                <div className="relative">
                  <Icon iconId="faQuestionLight"  className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search icons by name or tags..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {filteredIcons.length > 0 ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {filteredIcons.length} {filteredIcons.length === 1 ? 'icon' : 'icons'} found
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredIcons.map(icon => (
                        <Card 
                          key={icon.id}
                          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                          onClick={() => handleSelectIcon(icon)}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="h-12 w-12 flex items-center justify-center mb-3 bg-slate-50 rounded-md p-2 group">
                              <SafeSvgRenderer 
                                svgContent={icon.svgContent.replace(/weight="(.*?)"/, icon.category === 'light' || icon.category === 'solid' ? 'weight="light"' : 'weight="regular"')} 
                                size={32}
                                className="text-[#333333] group-hover:text-[#00BFFF] transition-colors duration-200"
                                iconHoverEffect={true}
                              />
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium truncate w-full">
                                {formatIconName(icon.name)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon iconId="faQuestionLight"  className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No Icons Found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview" className="p-0">
          {selectedIcon ? (
            <div className="p-6 grid gap-6 md:grid-cols-[2fr_1fr]">
              {/* Preview Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {selectedIcon.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedIcon.category} • {selectedIcon.weight} • {selectedIcon.width}×{selectedIcon.height}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`flex items-center justify-center p-6 rounded-md mb-4 ${
                      showBackground ? 'bg-slate-100' : ''
                    }`}
                    style={{ minHeight: '200px' }}
                  >
                    <SafeSvgRenderer 
                      svgContent={selectedIcon.svgContent}
                      size={iconSize}
                      color={iconColor}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Size: {iconSize}px</span>
                        <button 
                          className="text-xs text-primary"
                          onClick={() => setIconSize(24)}
                        >
                          Reset
                        </button>
                      </div>
                      <Slider
                        value={[iconSize]}
                        min={12}
                        max={64}
                        step={1}
                        onValueChange={(value) => setIconSize(value[0])}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Color</span>
                        <button 
                          className="text-xs text-primary"
                          onClick={() => setIconColor('#333333')}
                        >
                          Reset
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {['#333333', '#4A5568', '#00BFFF', '#3182CE', '#DD6B20', '#38A169', '#D53F8C', '#E53E3E'].map(color => (
                          <div
                            key={color}
                            className={`h-8 w-8 rounded-md cursor-pointer ${
                              iconColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setIconColor(color)}
                          />
                        ))}
                      </div>
                      <div className="flex items-center mt-4">
                        <input 
                          type="color" 
                          value={iconColor}
                          onChange={(e) => setIconColor(e.target.value)}
                          className="w-8 h-8 p-0 border-0 rounded-md"
                        />
                        <span className="text-sm ml-2">Custom color: {iconColor}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-background"
                        checked={showBackground}
                        onCheckedChange={setShowBackground}
                      />
                      <label htmlFor="show-background" className="text-sm cursor-pointer">
                        Show background
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Code and Similar Icons */}
              <div className="space-y-6">
                {/* Code Example */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        <Icon iconId="faQuestionLight"  className="inline-block mr-2 h-4 w-4" />
                        Code
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyIconCode}
                        className="h-8 px-2"
                      >
                        {copied ? (
                          <>
                            <Icon iconId="faCheckLight"  className="mr-1 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Icon iconId="faQuestionLight"  className="mr-1 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-slate-50 p-4 rounded-md overflow-x-auto text-sm">
                      <code>{generateCodeExample(selectedIcon)}</code>
                    </pre>
                    <div className="text-xs text-muted-foreground mt-2">
                      Import from <code>@/components/ui/icons</code>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Similar Icons */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Similar Icons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {similarIcons.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {similarIcons.map(icon => (
                          <div
                            key={icon.id}
                            className="flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-slate-50"
                            onClick={() => handleSelectIcon(icon)}
                          >
                            <div 
                              className="h-12 w-12 flex items-center justify-center mb-2">
                              <SafeSvgRenderer 
                                svgContent={icon.svgContent}
                                size={24}
                                className="mx-auto mb-1"
                              />
                            </div>
                            <div className="text-xs text-center truncate w-full">
                              {icon.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No similar icons found
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Icon Metadata */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{selectedIcon.name}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{selectedIcon.category}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Weight:</span>
                        <span>{selectedIcon.weight}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Path:</span>
                        <span className="truncate">{selectedIcon.path}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Usage:</span>
                        <span>{selectedIcon.usageCount || 0} references</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedIcon.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Icon iconId="faQuestionLight"  className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No Icon Selected</h3>
              <p>Select an icon from the browse tab to preview it</p>
            </div>
          )}
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="p-0">
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Icon Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-md">
                    Chart placeholder: Icon usage distribution
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-md">
                    Chart placeholder: Category distribution
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Weight Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-md">
                    Chart placeholder: Weight distribution
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Most Used Icons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {icons
                      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                      .slice(0, 12)
                      .map(icon => (
                        <Card 
                          key={icon.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSelectIcon(icon)}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="h-12 w-12 flex items-center justify-center mb-2">
                              <SafeSvgRenderer 
                                svgContent={icon.svgContent}
                                size={32}
                                className="text-primary"
                              />
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-medium truncate w-full">
                                {icon.name}
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {icon.usageCount || 0} uses
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Optimization Tab */}
        <TabsContent value="optimization" className="p-0">
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Icon iconId="faTriangleExclamationLight"  className="h-4 w-4" />
                      <AlertTitle>Duplicate Icons</AlertTitle>
                      <AlertDescription>
                        <p>Found 5 icons with similar visual appearance that could be consolidated.</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <Icon iconId="faTriangleExclamationLight"  className="h-4 w-4" />
                      <AlertTitle>Unused Icons</AlertTitle>
                      <AlertDescription>
                        <p>Found 12 icons that aren't currently used in the codebase.</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <Icon iconId="faTriangleExclamationLight"  className="h-4 w-4" />
                      <AlertTitle>SVG Optimization</AlertTitle>
                      <AlertDescription>
                        <p>8 icons could be optimized to reduce file size by approximately 15%.</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Optimize
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Bundle Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Total Icon Bundle Size</h3>
                      <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: '35%' }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span>156 KB total</span>
                        <span className="text-muted-foreground">3.5% of bundle</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Icon Usage Efficiency</h3>
                      <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full" 
                          style={{ width: '65%' }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span>65% efficiency</span>
                        <span className="text-muted-foreground">35% unused capacity</span>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Icon iconId="faQuestionLight"  className="mr-2 h-4 w-4" />
                      Generate Optimization Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <h3 className="text-sm font-medium mb-2">1. Implement Icon Sprites</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Convert individual SVG icons to a sprite sheet to reduce HTTP requests and improve caching.
                      </p>
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Potential Impact:</span>
                        <div className="ml-2 flex">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Icon iconId="faQuestionLight"  
                              key={`rec1-${i}`} 
                              className={`h-4 w-4 ${i <= 4 ? 'text-amber-500' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <h3 className="text-sm font-medium mb-2">2. Tree-Shake Unused Icons</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Implement proper tree-shaking to remove unused icons from production bundles.
                      </p>
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Potential Impact:</span>
                        <div className="ml-2 flex">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Icon iconId="faQuestionLight"  
                              key={`rec2-${i}`} 
                              className={`h-4 w-4 ${i <= 5 ? 'text-amber-500' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <h3 className="text-sm font-medium mb-2">3. Optimize SVG Code</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Run SVGO on all icons to remove unnecessary metadata and optimize paths.
                      </p>
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Potential Impact:</span>
                        <div className="ml-2 flex">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Icon iconId="faQuestionLight"  
                              key={`rec3-${i}`} 
                              className={`h-4 w-4 ${i <= 3 ? 'text-amber-500' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 