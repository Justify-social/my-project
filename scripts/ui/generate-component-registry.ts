import fs from 'fs';
import path from 'path';
import doctrine from 'doctrine';

// --- Configuration ---
const COMPONENTS_DIR = path.join(process.cwd(), 'src', 'components', 'ui');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'static');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'component-registry.json');
const ALLOWED_CATEGORIES = ['atom', 'molecule', 'organism'];

interface ComponentMetadata {
    name: string;
    description?: string;
    category?: string;
    subcategory?: string;
    status?: string | null; // Added status
    renderType?: string; // Added renderType
    author?: string; // Added author
    since?: string; // Added since
    filePath: string; // Added filePath relative to project root
}

interface ComponentRegistry {
    generatedAt: string;
    components: ComponentMetadata[];
    byCategory: Record<string, ComponentMetadata[]>;
    byName: Record<string, ComponentMetadata>;
    allCategories: string[];
    // Add other potential top-level fields if needed later
    // e.g., allCategories, byCategory (can be derived or generated separately)
}

// --- Helper Functions ---

/**
 * Checks if a filename likely represents a component.
 */
function isComponentFile(fileName: string): boolean {
    if (!fileName.endsWith('.tsx')) {
        return false;
    }
    // Basic exclusions
    if (fileName.endsWith('.types.tsx') ||
        fileName.endsWith('.test.tsx') ||
        fileName.endsWith('.spec.tsx') ||
        fileName.endsWith('.stories.tsx')) {
        return false;
    }
    // Check if the base name starts with an uppercase letter (common convention)
    // const baseName = path.basename(fileName, '.tsx');
    // return baseName.charAt(0) === baseName.charAt(0).toUpperCase(); // REMOVED THIS CHECK
    return true; // If it ends with .tsx and isn't excluded, consider it for metadata extraction
}

/**
 * Extracts JSDoc metadata from a file.
 */
function extractMetadata(filePath: string): ComponentMetadata | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const jsdocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
        if (!jsdocMatch) return null;

        // console.log(`    Raw JSDoc for ${path.basename(filePath)}:`, jsdocMatch[0]); // Keep if needed

        const parsed = doctrine.parse(jsdocMatch[0], { unwrap: true, sloppy: true });
        console.log(`DEBUG: Parsed Doctrine for ${path.basename(filePath)}:`, JSON.stringify(parsed, null, 2)); // Log parsed object

        const metadata: Partial<ComponentMetadata> = {};
        let componentName = '';

        console.log(`DEBUG: Iterating tags for ${path.basename(filePath)}:`);
        for (const tag of parsed.tags) {
            // console.log(`      - Tag Title: '${tag.title}', Description: '${tag.description}'`); 
            console.log(`DEBUG: Processing tag:`, JSON.stringify(tag)); // Log the whole tag structure
            switch (tag.title) {
                case 'component':
                    componentName = tag.description?.trim() || '';
                    break;
                case 'description':
                    metadata.description = tag.description?.trim();
                    break;
                case 'category':
                    metadata.category = tag.description?.trim().toLowerCase();
                    console.log(`DEBUG: ---> Assigned category: ${metadata.category}`); // Log immediately after assignment
                    break;
                case 'subcategory':
                    metadata.subcategory = tag.description?.trim().toLowerCase();
                    break;
                case 'status':
                    metadata.status = tag.description?.trim() || null;
                    break;
                case 'rendertype': // Match common variations
                case 'renderType':
                    metadata.renderType = tag.description?.trim().toLowerCase();
                    break;
                case 'author':
                    metadata.author = tag.description?.trim();
                    break;
                case 'since':
                    metadata.since = tag.description?.trim();
                    break;
            }
        }

        // console.log(`    Final category before check: '${metadata.category}'`); 

        // If name wasn't in JSDoc, infer from filename
        if (!componentName) componentName = path.basename(filePath, '.tsx');
        if (!componentName) return null;
        metadata.name = componentName;
        metadata.filePath = path.relative(process.cwd(), filePath);
        if (!metadata.category) metadata.category = 'unknown';

        return metadata as ComponentMetadata;

    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        return null;
    }
}

/**
 * Recursively finds component files and extracts metadata.
 */
function findComponents(dir: string): ComponentMetadata[] {
    let results: ComponentMetadata[] = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            console.log(`DEBUG: Checking path: ${fullPath}`); // Log every path checked
            try {
                const stat = fs.statSync(fullPath);
                if (stat && stat.isDirectory()) {
                    results = results.concat(findComponents(fullPath));
                } else if (isComponentFile(file)) {
                    console.log(`DEBUG: Identified component file: ${file}`); // Log component file identification
                    const metadata = extractMetadata(fullPath);
                    if (metadata) {
                        // console.log(`    Extracted metadata for ${metadata.name}, Category: ${metadata.category}`);
                        results.push(metadata);
                    } else {
                        // console.log(`    Could not extract metadata from ${file}`);
                    }
                }
            } catch (statError) {
                console.error(`Could not stat file ${fullPath}:`, statError);
            }
        });
    } catch (readDirError) {
        console.error(`Could not read directory ${dir}:`, readDirError);
    }
    return results;
}

// --- Main Execution ---
console.log(`Scanning for components in ${COMPONENTS_DIR}...`);
const allComponents = findComponents(COMPONENTS_DIR);
console.log("DEBUG: Raw components found before filtering:", JSON.stringify(allComponents, null, 2)); // Log all found components before filtering

console.log(`Found ${allComponents.length} potential component files.`);

// Filter components by allowed categories
const filteredComponents = allComponents.filter(comp =>
    comp.category && ALLOWED_CATEGORIES.includes(comp.category)
);

console.log(`Filtered down to ${filteredComponents.length} components in categories: ${ALLOWED_CATEGORIES.join(', ')}`);

// Sort alphabetically by name
filteredComponents.sort((a, b) => a.name.localeCompare(b.name));

// --- Generate derived registry structures ---

// Group by Category
const byCategory: Record<string, ComponentMetadata[]> = {};
filteredComponents.forEach(comp => {
    const category = comp.category || 'unknown'; // Should already be filtered, but handle defensively
    if (!byCategory[category]) {
        byCategory[category] = [];
    }
    byCategory[category].push(comp);
});

// Index by Name (lowercase)
const byName: Record<string, ComponentMetadata> = {};
filteredComponents.forEach(comp => {
    byName[comp.name.toLowerCase()] = comp;
});

// Get list of categories actually present
const allPresentCategories = Object.keys(byCategory).sort();

// Prepare the final registry object
const registry: ComponentRegistry = {
    generatedAt: new Date().toISOString(),
    components: filteredComponents,
    byCategory: byCategory,
    byName: byName,
    allCategories: allPresentCategories,
};

// Ensure output directory exists
try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (mkdirError) {
    console.error(`Could not create output directory ${OUTPUT_DIR}:`, mkdirError);
    process.exit(1); // Exit if we can't create the directory
}


// Write the JSON file
try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));
    console.log(`Successfully wrote component registry to ${OUTPUT_FILE}`);
} catch (writeError) {
    console.error(`Error writing registry file ${OUTPUT_FILE}:`, writeError);
    process.exit(1); // Exit on write error
} 