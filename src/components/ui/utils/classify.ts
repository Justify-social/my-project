/**
 * Component Classification Utility
 *
 * This utility parses JSDoc metadata from component files and
 * classifies components according to atomic design principles.
 */

/**
 * Component metadata interface
 */
export interface ComponentMetadata {
  name: string;
  description: string;
  category: 'atom' | 'molecule' | 'organism' | 'template' | 'page' | 'unknown';
  renderType: 'server' | 'client';
  props?: string[];
  examples?: string[];
  relatedComponents?: string[];
  source?: string;
  author?: string;
  status?: 'stable' | 'beta' | 'deprecated';
  lastUpdated?: string;
  usage?: string;
  notes?: string[];
  accessibility?: string[];
  since?: string;
  events?: string[];
  apis?: string[];
  implementation?: string;
  classNames?: string[];
  filePath?: string;
  code?: string;
  [key: string]: unknown; // Changed any to unknown
}

/**
 * Prop type interface
 */
export interface PropType {
  name: string;
  type: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

/**
 * Parse component metadata from JSDoc comments
 *
 * @param source Component source code containing JSDoc comments
 * @param filePath Optional file path of the component
 * @returns ComponentMetadata object
 */
export function parseComponentMetadata(source: string, filePath?: string): ComponentMetadata {
  const metadata: ComponentMetadata = {
    name: extractValue(source, '@component') || 'Unknown',
    description: extractValue(source, '@description') || '',
    category: extractCategory(source),
    renderType: extractRenderType(source),
    props: extractMultiValue(source, '@prop'),
    examples: extractCodeBlocks(source, '@example'),
    relatedComponents: extractMultiValue(source, '@see'),
    source: extractValue(source, '@source'),
    author: extractValue(source, '@author'),
    status: extractStatus(source),
    lastUpdated: extractValue(source, '@lastUpdated'),
    usage: extractCodeBlock(source, '@usage'),
    notes: extractMultiValue(source, '@note'),
    accessibility: extractMultiValue(source, '@accessibility'),
    since: extractValue(source, '@since'),
    events: extractMultiValue(source, '@event'),
    apis: extractMultiValue(source, '@api'),
    implementation: extractCodeBlock(source, '@implementation'),
    classNames: extractMultiValue(source, '@className'),
    filePath: filePath,
    code: source,
  };

  // Clean up undefined fields
  Object.keys(metadata).forEach(key => {
    if (metadata[key] === undefined) {
      delete metadata[key];
    }
  });

  return metadata;
}

/**
 * Extract the component render type from JSDoc
 *
 * @param source Source code
 * @returns 'client' if explicitly marked or 'use client' directive is present, otherwise 'server'
 */
function extractRenderType(source: string): ComponentMetadata['renderType'] {
  // Check for explicit renderType in JSDoc
  const renderTypeValue = extractValue(source, '@renderType');

  if (renderTypeValue) {
    const normalizedRenderType = renderTypeValue.toLowerCase();
    if (normalizedRenderType === 'client' || normalizedRenderType === 'server') {
      return normalizedRenderType as ComponentMetadata['renderType'];
    }
  }

  // If no explicit tag, check for 'use client' directive
  if (source.includes('use client')) {
    return 'client';
  }

  // Default to server
  return 'server';
}

/**
 * Extract a code block from JSDoc tag
 *
 * @param source Source code
 * @param tagName JSDoc tag name without @
 * @returns The extracted code block or undefined
 */
function extractCodeBlock(source: string, tagName: string): string | undefined {
  const regex = new RegExp(`@${tagName}\\s+\`\`\`([\\s\\S]*?)\`\`\``, 'm');
  const match = source.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract multiple code blocks from JSDoc tags
 *
 * @param source Source code
 * @param tagName JSDoc tag name without @
 * @returns Array of extracted code blocks or undefined
 */
function extractCodeBlocks(source: string, tagName: string): string[] | undefined {
  const regex = new RegExp(`@${tagName}\\s+\`\`\`([\\s\\S]*?)\`\`\``, 'gm');
  const matches = Array.from(source.matchAll(regex));

  if (matches.length === 0) {
    // Try regular multiline extraction if code blocks not found
    return extractMultiValue(source, tagName);
  }

  return matches.map(match => match[1].trim());
}

/**
 * Extract a TypeScript interface from the source code
 *
 * @param source Source code
 * @param interfaceName Name of the interface to extract
 * @returns The extracted interface as a string or undefined
 */
export function extractInterface(source: string, interfaceName: string): string | undefined {
  const regex = new RegExp(`export\\s+interface\\s+${interfaceName}[\\s\\S]*?{[\\s\\S]*?}`, 'm');
  const match = source.match(regex);
  return match ? match[0].trim() : undefined;
}

/**
 * Extract prop types from a component's source code
 *
 * @param source Source code
 * @returns Object containing prop name, type, and description
 */
export function extractPropTypes(source: string): PropType[] {
  // Look for interface or type definition for props
  const propsInterfaceMatch = source.match(/interface\s+(\w+Props)\s+{([^}]*)}/);
  const propsTypeMatch = source.match(/type\s+(\w+Props)\s+=\s+{([^}]*)}/);

  let propsContent = '';
  if (propsInterfaceMatch) {
    propsContent = propsInterfaceMatch[2];
  } else if (propsTypeMatch) {
    propsContent = propsTypeMatch[2];
  } else {
    return [];
  }

  // Extract individual prop definitions
  const propRegex = /(\w+)(\?)?:\s*([^;]*);(?:\s*\/\/\s*(.*))?/g;
  const props: PropType[] = [];
  let match;

  while ((match = propRegex.exec(propsContent)) !== null) {
    const [, name, optional, type, comment] = match;
    props.push({
      name,
      type: type.trim(),
      description: comment ? comment.trim() : undefined,
      required: !optional,
    });
  }

  // Look for default values in the component
  props.forEach(prop => {
    const defaultValueRegex = new RegExp(
      `${prop.name}\\s*=\\s*props\\.${prop.name}\\s*\\?\\?\\s*([^,;]*)`,
      'g'
    );
    const defaultMatch = defaultValueRegex.exec(source);
    if (defaultMatch) {
      prop.defaultValue = defaultMatch[1].trim();
    }
  });

  return props;
}

/**
 * Classify a component based on its name, source code, or explicit metadata
 *
 * @param componentName Name of the component
 * @param source Optional source code to analyze
 * @returns Component category: 'atom', 'molecule', 'organism', 'template', 'page', or 'unknown'
 */
export function classifyComponent(
  componentName: string,
  source?: string
): ComponentMetadata['category'] {
  // If source is provided, check for explicit categorization in JSDoc
  if (source) {
    const explicitCategory = extractCategory(source);
    if (explicitCategory !== 'unknown') {
      return explicitCategory;
    }
  }

  // Classify based on naming conventions and component complexity
  const name = componentName.toLowerCase();

  // Atoms are basic building blocks - simple, single-purpose components
  const atomPatterns = [
    'button',
    'badge',
    'avatar',
    'icon',
    'input',
    'toggle',
    'checkbox',
    'radio',
    'label',
    'separator',
    'switch',
    'progress',
    'spinner',
    'skeleton',
    'tooltip',
    'indicator',
    'tag',
    'chip',
  ];

  // Molecules combine atoms to form relatively simple components with limited functionality
  const moleculePatterns = [
    'card',
    'alert',
    'dialog',
    'popover',
    'dropdown',
    'menu',
    'tabs',
    'accordion',
    'combobox',
    'select',
    'form-field',
    'toast',
    'breadcrumb',
    'pagination',
    'slider',
    'drawer',
    'hover-card',
    'command',
    'sheet',
    'resizable',
    'scroll-area',
    'list-item',
    'navigation-menu',
  ];

  // Organisms are complex components combining multiple molecules/atoms
  const organismPatterns = [
    'calendar',
    'table',
    'data-table',
    'form',
    'layout',
    'sidebar',
    'header',
    'footer',
    'navbar',
    'dashboard',
    'grid',
    'gallery',
    'carousel',
    'editor',
    'file-upload',
    'search',
    'wizard',
    'stepper',
  ];

  // Templates represent page-level layouts
  const templatePatterns = [
    'template',
    'layout',
    'page-layout',
    'app-shell',
    'dashboard-layout',
    'grid-layout',
    'auth-layout',
    'marketing-layout',
  ];

  // Check against patterns
  for (const pattern of atomPatterns) {
    if (name.includes(pattern)) return 'atom';
  }

  for (const pattern of moleculePatterns) {
    if (name.includes(pattern)) return 'molecule';
  }

  for (const pattern of organismPatterns) {
    if (name.includes(pattern)) return 'organism';
  }

  for (const pattern of templatePatterns) {
    if (name.includes(pattern)) return 'template';
  }

  // Default to unknown if no match is found
  return 'unknown';
}

/**
 * Extract a single value from JSDoc tag
 *
 * @param source Source code
 * @param tagName JSDoc tag name without @
 * @returns The extracted value or undefined
 */
function extractValue(source: string, tagName: string): string | undefined {
  const regex = new RegExp(`@${tagName}\\s+([^\\n\\r@]*)`);
  const match = source.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract multiple values from repeated JSDoc tags
 *
 * @param source Source code
 * @param tagName JSDoc tag name without @
 * @returns Array of extracted values or undefined
 */
function extractMultiValue(source: string, tagName: string): string[] | undefined {
  const regex = new RegExp(`@${tagName}\\s+([^\\n\\r@]*)`, 'g');
  const matches = Array.from(source.matchAll(regex));

  if (matches.length === 0) {
    return undefined;
  }

  return matches.map(match => match[1].trim());
}

/**
 * Extract the component category from JSDoc
 *
 * @param source Source code
 * @returns Component category or 'unknown'
 */
function extractCategory(source: string): ComponentMetadata['category'] {
  const categoryValue = extractValue(source, 'category');

  if (!categoryValue) return 'unknown';

  const normalizedCategory = categoryValue.toLowerCase();

  if (
    normalizedCategory === 'atom' ||
    normalizedCategory === 'molecule' ||
    normalizedCategory === 'organism' ||
    normalizedCategory === 'template' ||
    normalizedCategory === 'page'
  ) {
    return normalizedCategory as ComponentMetadata['category'];
  }

  return 'unknown';
}

/**
 * Extract component status from JSDoc
 *
 * @param source Source code
 * @returns Component status or undefined
 */
function extractStatus(source: string): ComponentMetadata['status'] | undefined {
  const statusValue = extractValue(source, 'status');

  if (!statusValue) return undefined;

  const normalizedStatus = statusValue.toLowerCase();

  if (
    normalizedStatus === 'stable' ||
    normalizedStatus === 'beta' ||
    normalizedStatus === 'deprecated'
  ) {
    return normalizedStatus as ComponentMetadata['status'];
  }

  return undefined;
}
