'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Image, 
  Layers, 
  Copy, 
  Check, 
  Palette, 
  Settings, 
  AlertTriangle, 
  FileCode, 
  BarChart4,
  Download,
  Sparkles,
  Loader2
} from 'lucide-react';
import { iconApi } from '../../api/icon-api';

/**
 * Icon metadata interface
 */
interface IconMetadata {
  id: string;
  name: string;
  path: string;
  category: string;
  weight: 'light' | 'regular' | 'solid' | 'brands';
  tags: string[];
  viewBox: string;
  width: number;
  height: number;
  svgContent: string;
  usageCount: number;
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
  weight: string | null;
  minUsage: number;
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
export default function IconLibrary() {
  // State for icons and categories
  const [icons, setIcons] = useState<IconMetadata[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<IconMetadata[]>([]);
  const [categories, setCategories] = useState<IconCategory[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: null,
    weight: null,
    minUsage: 0
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
  
  // Load icons and categories on initial render
  useEffect(() => {
    loadIcons();
    loadCategories();
  }, []);
  
  // Filter icons when search query or filters change
  useEffect(() => {
    filterIcons();
  }, [searchQuery, filters, icons]);
  
  // Load icons from the API
  const loadIcons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from the actual icon API
      const result = await iconApi.getIcons();
      setIcons(result.items);
      
      // Extract unique weights
      const uniqueWeights = Array.from(new Set(result.items.map(icon => icon.weight)));
      setWeights(uniqueWeights);
      
      setFilteredIcons(result.items);
      
      setLoading(false);
    } catch (err) {
      setError(`Error loading icons: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };
  
  // Load icon categories from the API
  const loadCategories = async () => {
    try {
      // In a real implementation, this would fetch from the actual icon API
      const result = await iconApi.getCategories();
      setCategories(result);
    } catch (err) {
      setError(`Error loading categories: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Handle searching and filtering of icons
  const filterIcons = () => {
    if (!icons.length) return;
    
    let filtered = [...icons];
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(icon => 
        icon.name.toLowerCase().includes(query) || 
        icon.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(icon => icon.category === filters.category);
    }
    
    // Apply weight filter
    if (filters.weight) {
      filtered = filtered.filter(icon => icon.weight === filters.weight);
    }
    
    // Apply usage count filter
    if (filters.minUsage > 0) {
      filtered = filtered.filter(icon => (icon.usageCount || 0) >= filters.minUsage);
    }
    
    // Sort by relevance if searching, otherwise by name
    if (searchQuery.trim()) {
      filtered.sort((a, b) => {
        // Exact matches come first
        const aExact = a.name.toLowerCase() === searchQuery.toLowerCase();
        const bExact = b.name.toLowerCase() === searchQuery.toLowerCase();
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then sort by starts with
        const aStartsWith = a.name.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(searchQuery.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then by usage count
        return (b.usageCount || 0) - (a.usageCount || 0);
      });
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredIcons(filtered);
  };
  
  // Find similar icons to the selected icon
  const findSimilarIcons = useCallback(async () => {
    if (!selectedIcon) return;
    
    try {
      // In a real implementation, this would use the visual similarity API
      const result = await iconApi.findSimilarIcons(selectedIcon.id);
      setSimilarIcons(result);
    } catch (err) {
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
  
  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div>Loading icon library...</div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Image className="mr-2 h-5 w-5" />
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
              <Layers className="mr-2 h-4 w-4" />
              Browse
            </TabsTrigger>
            {selectedIcon && (
              <TabsTrigger value="preview" className="flex-1">
                <Image className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="flex-1">
              <BarChart4 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex-1">
              <Sparkles className="mr-2 h-4 w-4" />
              Optimization
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Browse Tab */}
        <TabsContent value="browse" className="p-0">
          <div className="p-6 border-b">
            <div className="grid gap-4 md:grid-cols-[1fr_2fr] lg:grid-cols-[250px_1fr]">
              {/* Filters */}
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Categories</h3>
                  <div className="space-y-1">
                    <Button
                      variant={filters.category === null ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setFilters({ ...filters, category: null })}
                    >
                      All Categories
                      <Badge variant="outline" className="ml-auto">
                        {icons.length}
                      </Badge>
                    </Button>
                    
                    {categories.map(category => (
                      <Button
                        key={category.id}
                        variant={filters.category === category.id ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFilters({ ...filters, category: category.id })}
                      >
                        {category.name}
                        <Badge variant="outline" className="ml-auto">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-medium">Weights</h3>
                  <div className="space-y-1">
                    <Button
                      variant={filters.weight === null ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setFilters({ ...filters, weight: null })}
                    >
                      All Weights
                    </Button>
                    
                    {weights.map(weight => (
                      <Button
                        key={weight}
                        variant={filters.weight === weight ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFilters({ ...filters, weight: weight })}
                      >
                        {weight.charAt(0).toUpperCase() + weight.slice(1)}
                      </Button>
                    ))}
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
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSelectIcon(icon)}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="h-12 w-12 flex items-center justify-center mb-2">
                              <div 
                                dangerouslySetInnerHTML={{ __html: icon.svgContent }}
                                className="h-8 w-8 text-primary"
                              />
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-medium truncate w-full">
                                {icon.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {icon.weight}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
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
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent }}
                      className="transition-all duration-200"
                      style={{ 
                        width: `${iconSize}px`, 
                        height: `${iconSize}px`,
                        color: iconColor
                      }}
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
                        <FileCode className="inline-block mr-2 h-4 w-4" />
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
                            <Check className="mr-1 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-4 w-4" />
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
                              dangerouslySetInnerHTML={{ __html: icon.svgContent }}
                              className="h-6 w-6 mb-1"
                            />
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
                          {selectedIcon.tags.map(tag => (
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
              <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
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
                              <div 
                                dangerouslySetInnerHTML={{ __html: icon.svgContent }}
                                className="h-8 w-8 text-primary"
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
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Duplicate Icons</AlertTitle>
                      <AlertDescription>
                        <p>Found 5 icons with similar visual appearance that could be consolidated.</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Unused Icons</AlertTitle>
                      <AlertDescription>
                        <p>Found 12 icons that aren't currently used in the codebase.</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
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
                      <Download className="mr-2 h-4 w-4" />
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
                            <Sparkles 
                              key={i} 
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
                            <Sparkles 
                              key={i} 
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
                            <Sparkles 
                              key={i} 
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