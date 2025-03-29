'use client';

/**
 * Component Metadata Extractor
 *
 * This utility extracts metadata from UI component files using TypeScript's
 * compiler API to parse the AST (Abstract Syntax Tree). It identifies:
 * - Component name and exports
 * - Props and their types
 * - JSDoc descriptions
 * - Dependencies on other components
 * - Examples from comments
 */

// Dynamic imports with fallbacks for browser environment
import * as ts from 'typescript';
import { ComponentMetadata, PropDefinition } from '../db/registry';

// Check if we're in a browser or server environment
const isServer = typeof window === 'undefined';

// Dynamically import modules based on environment
let fs: any;
let path: any;

if (isServer) {
  // Server-side imports
  import('fs').then((module) => { fs = module.default || module; });
  import('path').then((module) => { path = module.default || module; });
} else {
  // Browser-side imports with mocks
  fs = require('../utils/fs-browser').default;
  path = require('../utils/path-browser-mock').default;
}

/**
 * Options for metadata extraction process
 */
export interface MetadataExtractionOptions {
  extractProps: boolean;
  extractExamples: boolean;
  extractDependencies: boolean;
  extractJSDoc: boolean;
}

const DEFAULT_OPTIONS: MetadataExtractionOptions = {
  extractProps: true,
  extractExamples: true,
  extractDependencies: true,
  extractJSDoc: true,
};

/**
 * ComponentMetadataExtractor provides methods to extract metadata from component files
 */
export class ComponentMetadataExtractor {
  private readonly options: MetadataExtractionOptions;

  constructor(options: Partial<MetadataExtractionOptions> = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * Extract metadata from a component file
   */
  public async extractFromFile(filePath: string): Promise<ComponentMetadata | null> {
    if (!isServer) {
      console.warn(`Metadata extraction is limited in browser environments for ${filePath}`);
      // Return mock data in browser context
      return {
        id: 'browser-mock-id',
        path: filePath,
        name: path.basename(filePath, path.extname(filePath)),
        category: this.determineCategory(filePath),
        lastUpdated: new Date(),
        description: 'This is mock metadata for browser environment',
        exports: ['MockComponent'],
        props: [
          {
            name: 'mockProp',
            type: 'string',
            description: 'Mock property for browser context',
            required: false,
            defaultValue: "'default'"
          }
        ],
        examples: ['<MockComponent mockProp="example" />'],
        dependencies: [],
        version: '1.0.0',
        changeHistory: []
      };
    }

    try {
      // Check if modules are loaded
      if (!fs || !path) {
        console.error('File system modules not loaded yet');
        return null;
      }

      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Parse TypeScript file
      const sourceFile = ts.createSourceFile(
        path.basename(filePath),
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );

      // Get last modified time
      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime;

      // Extract basic information
      const relativePath = path.relative(process.cwd(), filePath);
      const category = this.determineCategory(relativePath);
      const name = this.extractComponentName(sourceFile, path.basename(filePath, path.extname(filePath)));
      const description = this.options.extractJSDoc ? this.extractJSDocDescription(sourceFile) : '';
      const exports = this.extractExports(sourceFile);
      
      // Extract props if enabled
      const props = this.options.extractProps ? this.extractProps(sourceFile) : [];
      
      // Extract examples if enabled
      const examples = this.options.extractExamples ? this.extractExamples(sourceFile) : [];
      
      // Extract dependencies if enabled
      const dependencies = this.options.extractDependencies ? this.extractDependencies(sourceFile) : [];

      // Create metadata object
      const metadata: ComponentMetadata & { id: string } = {
        id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        path: relativePath,
        name,
        category,
        lastUpdated: lastModified,
        description,
        exports,
        props,
        examples,
        dependencies,
        version: '1.0.0', // Initial version for new components
        changeHistory: [],
      };

      return metadata;
    } catch (error) {
      console.error(`Error extracting metadata from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Determine component category (atom, molecule, organism) from its path
   */
  private determineCategory(relativePath: string): 'atom' | 'molecule' | 'organism' {
    const lowerPath = relativePath.toLowerCase();
    
    if (lowerPath.includes('/atoms/') || lowerPath.includes('/atom/')) {
      return 'atom';
    }
    
    if (lowerPath.includes('/molecules/') || lowerPath.includes('/molecule/')) {
      return 'molecule';
    }
    
    if (lowerPath.includes('/organisms/') || lowerPath.includes('/organism/')) {
      return 'organism';
    }

    // Fallback: try to determine from directory structure
    const parts = relativePath.split(path?.sep || '/');
    const index = parts.findIndex(p => p === 'ui');
    if (index >= 0 && index + 1 < parts.length) {
      const category = parts[index + 1].toLowerCase();
      if (category === 'atoms' || category === 'molecules' || category === 'organisms') {
        return category.endsWith('s') ? category.slice(0, -1) as any : category as any;
      }
    }

    // If we can't determine, default to atom
    return 'atom';
  }

  /**
   * Extract component name from source file
   */
  private extractComponentName(sourceFile: ts.SourceFile, fallbackName: string): string {
    // Look for exported function components or class components
    let name = '';
    
    // Visitor function to find component declarations
    const visit = (node: ts.Node): void => {
      // Look for exported function declarations
      if (ts.isFunctionDeclaration(node) && this.hasExportModifier(node)) {
        if (node.name) {
          name = node.name.text;
          return;
        }
      }
      
      // Look for exported class declarations that extend React.Component
      if (ts.isClassDeclaration(node) && this.hasExportModifier(node)) {
        if (node.name) {
          name = node.name.text;
          return;
        }
      }
      
      // Look for exported const assignments with function expressions or arrow functions
      if (ts.isVariableStatement(node) && this.hasExportModifier(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name) && 
              (declaration.initializer && 
               (ts.isArrowFunction(declaration.initializer) || 
                ts.isFunctionExpression(declaration.initializer)))) {
            name = declaration.name.text;
            return;
          }
        }
      }
      
      // Continue traversing the AST
      ts.forEachChild(node, visit);
    };
    
    // Start traversal from source file
    visit(sourceFile);
    
    // If no name was found, use the fallback (filename)
    return name || fallbackName;
  }

  /**
   * Check if a node has export modifier
   */
  private hasExportModifier(node: ts.Declaration): boolean {
    if (!node.modifiers) {
      return false;
    }
    
    return node.modifiers.some(
      modifier => modifier.kind === ts.SyntaxKind.ExportKeyword
    );
  }

  /**
   * Extract JSDoc description from source file
   */
  private extractJSDocDescription(sourceFile: ts.SourceFile): string {
    // Find the first JSDoc comment for a component
    let description = '';
    
    // Visitor function to find JSDoc comments
    const visit = (node: ts.Node): void => {
      // Skip if we already found a description
      if (description) {
        return;
      }
      
      // Check for JSDoc comments on function components
      if (ts.isFunctionDeclaration(node) && this.hasExportModifier(node)) {
        const jsDoc = this.getJSDocCommentBlock(node, sourceFile);
        if (jsDoc) {
          description = jsDoc;
          return;
        }
      }
      
      // Check for JSDoc comments on class components
      if (ts.isClassDeclaration(node) && this.hasExportModifier(node)) {
        const jsDoc = this.getJSDocCommentBlock(node, sourceFile);
        if (jsDoc) {
          description = jsDoc;
          return;
        }
      }
      
      // Check for JSDoc comments on variable declarations
      if (ts.isVariableStatement(node) && this.hasExportModifier(node)) {
        const jsDoc = this.getJSDocCommentBlock(node, sourceFile);
        if (jsDoc) {
          description = jsDoc;
          return;
        }
      }
      
      // Continue traversing the AST
      ts.forEachChild(node, visit);
    };
    
    // Start traversal from source file
    visit(sourceFile);
    
    return description;
  }

  /**
   * Extract JSDoc comment text from a node
   */
  private getJSDocCommentBlock(node: ts.Node, sourceFile: ts.SourceFile): string {
    const nodePos = node.getFullStart();
    const nodeText = sourceFile.text.substring(0, nodePos);
    const commentRanges = ts.getLeadingCommentRanges(nodeText, 0);
    
    if (!commentRanges || commentRanges.length === 0) {
      return '';
    }
    
    // Get the last comment range, which is the JSDoc right before the node
    const lastCommentRange = commentRanges[commentRanges.length - 1];
    
    // Only process it if it's a JSDoc comment (starts with "/**")
    const commentText = nodeText.substring(lastCommentRange.pos, lastCommentRange.end);
    if (!commentText.startsWith('/**')) {
      return '';
    }
    
    // Extract the comment text, removing the "/**" and "*/" markers and normalizing whitespace
    const lines = commentText
      .split('\n')
      .map(line => line.trim().replace(/^\s*\/\*\*|\*\/|\*/g, '').trim())
      .filter(Boolean);
    
    return lines.join(' ');
  }

  /**
   * Extract exports from source file
   */
  private extractExports(sourceFile: ts.SourceFile): string[] {
    const exports: string[] = [];
    
    const visit = (node: ts.Node): void => {
      // Handle export declaration with named exports
      if (ts.isExportDeclaration(node) && node.exportClause) {
        if (ts.isNamedExports(node.exportClause)) {
          for (const element of node.exportClause.elements) {
            if (element.propertyName) {
              exports.push(element.propertyName.text);
            } else {
              exports.push(element.name.text);
            }
          }
        }
      }
      
      // Handle export assignment
      if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression)) {
        exports.push(node.expression.text);
      }
      
      // Handle exported function declarations
      if (ts.isFunctionDeclaration(node) && this.hasExportModifier(node) && node.name) {
        exports.push(node.name.text);
      }
      
      // Handle exported class declarations
      if (ts.isClassDeclaration(node) && this.hasExportModifier(node) && node.name) {
        exports.push(node.name.text);
      }
      
      // Handle exported variable declarations
      if (ts.isVariableStatement(node) && this.hasExportModifier(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            exports.push(declaration.name.text);
          }
        }
      }
      
      // Continue traversing the AST
      ts.forEachChild(node, visit);
    };
    
    // Start traversal from source file
    visit(sourceFile);
    
    return exports;
  }

  /**
   * Extract props from source file
   */
  private extractProps(sourceFile: ts.SourceFile): PropDefinition[] {
    const props: PropDefinition[] = [];
    
    const visit = (node: ts.Node): void => {
      // Look for interfaces and type aliases that might define props
      if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
          node.name.text.endsWith('Props')) {
        if (ts.isInterfaceDeclaration(node) && node.members) {
          for (const member of node.members) {
            if (ts.isPropertySignature(member) && member.name) {
              const propName = this.getPropertyName(member.name);
              if (propName) {
                const type = member.type ? this.getTypeAsString(member.type) : 'any';
                const required = member.questionToken === undefined;
                const jsDoc = this.getJSDocCommentBlock(member, sourceFile);
                
                // Look for default value in JSDoc
                const defaultValueMatch = jsDoc.match(/@default\s+(.+)(?:\s|$)/);
                const defaultValue = defaultValueMatch ? defaultValueMatch[1].trim() : undefined;
                
                // Clean JSDoc by removing tags
                const description = jsDoc.replace(/@\w+\s+[^\s]+(\s|$)/g, '').trim();
                
                props.push({
                  name: propName,
                  type,
                  required,
                  description,
                  defaultValue
                });
              }
            }
          }
        } else if (ts.isTypeAliasDeclaration(node) && node.type && ts.isTypeLiteralNode(node.type)) {
          for (const member of node.type.members) {
            if (ts.isPropertySignature(member) && member.name) {
              const propName = this.getPropertyName(member.name);
              if (propName) {
                const type = member.type ? this.getTypeAsString(member.type) : 'any';
                const required = member.questionToken === undefined;
                const jsDoc = this.getJSDocCommentBlock(member, sourceFile);
                
                // Look for default value in JSDoc
                const defaultValueMatch = jsDoc.match(/@default\s+(.+)(?:\s|$)/);
                const defaultValue = defaultValueMatch ? defaultValueMatch[1].trim() : undefined;
                
                // Clean JSDoc by removing tags
                const description = jsDoc.replace(/@\w+\s+[^\s]+(\s|$)/g, '').trim();
                
                props.push({
                  name: propName,
                  type,
                  required,
                  description,
                  defaultValue
                });
              }
            }
          }
        }
      }
      
      // Continue traversing the AST
      ts.forEachChild(node, visit);
    };
    
    // Start traversal from source file
    visit(sourceFile);
    
    return props;
  }

  /**
   * Get property name from different name node types
   */
  private getPropertyName(nameNode: ts.PropertyName): string | undefined {
    if (ts.isIdentifier(nameNode)) {
      return nameNode.text;
    } else if (ts.isStringLiteral(nameNode)) {
      return nameNode.text;
    } else if (ts.isNumericLiteral(nameNode)) {
      return nameNode.text;
    }
    return undefined;
  }

  /**
   * Convert TypeScript type node to string representation
   */
  private getTypeAsString(typeNode: ts.TypeNode): string {
    if (ts.isKeywordTypeNode(typeNode)) {
      return ts.SyntaxKind[typeNode.kind].toLowerCase().replace('keyword', '');
    } else if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
      return typeNode.typeName.text;
    } else if (ts.isUnionTypeNode(typeNode)) {
      return typeNode.types.map(t => this.getTypeAsString(t)).join(' | ');
    } else if (ts.isLiteralTypeNode(typeNode)) {
      if (ts.isStringLiteral(typeNode.literal)) {
        return `'${typeNode.literal.text}'`;
      } else if (ts.isNumericLiteral(typeNode.literal)) {
        return typeNode.literal.text;
      } else {
        return 'literal';
      }
    } else if (ts.isArrayTypeNode(typeNode)) {
      return `${this.getTypeAsString(typeNode.elementType)}[]`;
    }
    return 'unknown';
  }

  /**
   * Extract examples from comments in source file
   */
  private extractExamples(sourceFile: ts.SourceFile): string[] {
    // Look for code examples in comments marked with @example
    const examples: string[] = [];
    const fileText = sourceFile.text;
    
    // Simple regex to find @example blocks
    const exampleRegex = /@example\s+(```(?:tsx|jsx|javascript|js|ts)?\s*([\s\S]*?)```|(?:\s*\n)+([\s\S]*?)(?:\s*\n\s*@|\s*\n\s*\*\/|$))/g;
    
    let match;
    while ((match = exampleRegex.exec(fileText)) !== null) {
      const example = match[2] || match[3];
      if (example && example.trim()) {
        examples.push(example.trim());
      }
    }
    
    return examples;
  }

  /**
   * Extract dependencies (imported components) from source file
   */
  private extractDependencies(sourceFile: ts.SourceFile): string[] {
    const dependencies: string[] = [];
    
    const visit = (node: ts.Node): void => {
      // Handle import declarations
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const modulePath = node.moduleSpecifier.text;
        
        // Only consider relative imports or specific paths that likely contain UI components
        if (modulePath.startsWith('.') || modulePath.includes('/components/') || modulePath.includes('@/components/')) {
          dependencies.push(modulePath);
        }
      }
      
      // Continue traversing the AST
      ts.forEachChild(node, visit);
    };
    
    // Start traversal from source file
    visit(sourceFile);
    
    return dependencies;
  }
}

// Export singleton instance
export const componentMetadataExtractor = new ComponentMetadataExtractor(); 