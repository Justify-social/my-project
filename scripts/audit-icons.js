#!/usr/bin/env node

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { glob } = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

// Process command line arguments
const args = process.argv.slice(2);
const fixMode = args.includes('--fix');
const verboseMode = args.includes('--verbose');
const htmlReportMode = args.includes('--html');
const fixDuplicatesMode = args.includes('--fix-duplicates');

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

// FontAwesome configuration from docs
const FA_PREFIX = 'fa';
const HERO_TO_FA_MAPPINGS = {
  'UserIcon': 'faUser',
  'TrashIcon': 'faTrashCan',
  'PencilIcon': 'faPenToSquare',
  'EyeIcon': 'faEye',
  'XIcon': 'faXmark',
  'CameraIcon': 'faCamera',
  'PlusIcon': 'faPlus',
  'MinusIcon': 'faMinus',
  'CheckIcon': 'faCheck',
  'ChevronDownIcon': 'faChevronDown',
  'ChevronUpIcon': 'faChevronUp',
  'ChevronLeftIcon': 'faChevronLeft',
  'ChevronRightIcon': 'faChevronRight',
  'EnvelopeIcon': 'faEnvelope',
  'CalendarIcon': 'faCalendarDays',
  'ExclamationTriangleIcon': 'faTriangleExclamation',
  'InfoCircleIcon': 'faCircleInfo',
  'BellIcon': 'faBell',
  'CheckCircleIcon': 'faCircleCheck',
  'LightbulbIcon': 'faLightbulb',
  'CommentIcon': 'faCommentDots',
  'CopyIcon': 'faCopy',
  'HeartIcon': 'faHeart',
  'StarIcon': 'faStar',
  'BookmarkIcon': 'faBookmark',
  'ShareIcon': 'faShare',
  'UploadIcon': 'faUpload',
  'BarsIcon': 'faBars',
  'FilterIcon': 'faFilter',
  'TableIcon': 'faTableCells',
  'ListIcon': 'faList',
  'TagIcon': 'faTag',
  'LockIcon': 'faLock',
  'UnlockIcon': 'faUnlock',
  'KeyIcon': 'faKey',
  'PaperclipIcon': 'faPaperclip',
  'DownloadIcon': 'faDownload',
  'PlayIcon': 'faPlay',
  'FileIcon': 'faFile',
  'FileAltIcon': 'faFileLines',
  'HomeIcon': 'faHome',
  'ChartBarIcon': 'faChartBar',
  'ChartPieIcon': 'faChartPie',
  'MoneyBillIcon': 'faMoneyBill',
  'TrendingUpIcon': 'faArrowTrendUp',
  'TrendingDownIcon': 'faArrowTrendDown',
  'BoltIcon': 'faBolt',
  'GlobeIcon': 'faGlobe',
  'UsersIcon': 'faUserGroup',
  'BuildingIcon': 'faBuilding',
  'RocketIcon': 'faRocket',
  'SignalIcon': 'faSignal',
  'BellSlashIcon': 'faBellSlash',
  'MapIcon': 'faMap',
  'ShieldIcon': 'faShield',
  'ClockIcon': 'faClock',
  'ArrowDownIcon': 'faArrowDown',
  'ArrowUpIcon': 'faArrowUp',
  'ArrowRightIcon': 'faArrowRight',
  'ArrowLeftIcon': 'faArrowLeft',
  'TimesCircleIcon': 'faCircleXmark',
  'SearchPlusIcon': 'faMagnifyingGlassPlus',
  'PaletteIcon': 'faPalette',
  'CreditCardIcon': 'faCreditCard',
  'HistoryIcon': 'faClockRotateLeft',
  'ChartLineIcon': 'faChartLine',
  'QuestionIcon': 'faQuestion',
  'ImageIcon': 'faImage',
  'UserCircleIcon': 'faUserCircle'
};
const VALID_ACTIONS = ['default', 'delete', 'warning', 'success'];
const VALID_STYLES = ['solid', 'light', 'brands', 'regular'];

// Helper functions
function iconExists(relativePath) {
  const fullPath = path.join(process.cwd(), 'public', relativePath);
  return fsSync.existsSync(fullPath);
}

function convertCamelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function normalizeIconName(name) {
  if (!name) return '';
  return name.startsWith(FA_PREFIX) ? name : `${FA_PREFIX}${name.charAt(0).toUpperCase() + name.slice(1)}`;
}

async function validateLightSolidDistinctness() {
  const lightDir = path.join(process.cwd(), 'public/ui-icons/light');
  const solidDir = path.join(process.cwd(), 'public/ui-icons/solid');

  try {
    await fs.access(lightDir);
    await fs.access(solidDir);
  } catch {
    console.error(`${colors.red}Icon directories missing. Run 'npm run update-icons' first.${colors.reset}`);
    return null;
  }

  const lightFiles = await glob('*.svg', { cwd: lightDir });
  const solidFiles = await glob('*.svg', { cwd: solidDir });
  const commonNames = lightFiles.filter(name => solidFiles.includes(name));

  let distinctCount = 0;
  let duplicateCount = 0;
  const pairs = [];

  for (const iconName of commonNames) {
    const lightPath = path.join(lightDir, iconName);
    const solidPath = path.join(solidDir, iconName);
    const lightContent = await fs.readFile(lightPath, 'utf-8');
    const solidContent = await fs.readFile(solidPath, 'utf-8');

    const identical = lightContent === solidContent;
    const similarity = identical ? 1 : calculateSimilarity(lightContent, solidContent);

    const pair = { name: iconName.replace('.svg', ''), identical, similarity, lightPath, solidPath };
    pairs.push(pair);

    if (identical || similarity > 0.95) duplicateCount++;
    else distinctCount++;
  }

  if (fixDuplicatesMode) await fixDuplicateIcons(pairs.filter(p => p.identical || p.similarity > 0.95));

  return {
    distinct: distinctCount,
    duplicates: duplicateCount,
    pairs: pairs.filter(p => p.identical || p.similarity > 0.95),
    missingLight: solidFiles.filter(n => !lightFiles.includes(n)),
    missingSolid: lightFiles.filter(n => !solidFiles.includes(n))
  };
}

async function fixDuplicateIcons(duplicatePairs) {
  console.log(`${colors.yellow}Fixing ${duplicatePairs.length} duplicate icons...${colors.reset}`);
  for (const pair of duplicatePairs) {
    console.log(`Processing ${pair.name}...`);
    try {
      let lightContent = await fs.readFile(pair.lightPath, 'utf-8');
      
      // Special handling for the globe icon
      if (pair.name === 'globe') {
        // Apply the most aggressive modifications for globe icon
        if (lightContent.includes('stroke-width')) {
          // Use minimal stroke width for light version
          lightContent = lightContent.replace(/stroke-width="([^"]+)"/, 'stroke-width="0.4"');
        } else if (lightContent.includes('stroke=')) {
          // Add very thin stroke-width
          lightContent = lightContent.replace(/stroke="([^"]+)"/, (match) => {
            return `${match} stroke-width="0.4"`;
          });
        }
        
        // Add significant opacity to make it much lighter
        if (lightContent.includes('fill="currentColor"')) {
          lightContent = lightContent.replace(/fill="currentColor"/, 'fill="currentColor" opacity="0.6"');
        }
        
        // Add dashed strokes for visual distinction
        if (lightContent.includes('stroke=')) {
          lightContent = lightContent.replace(/<path/, '<path stroke-dasharray="1,1.5" ');
        }
        
        // Add transform to slightly reduce size for more visual difference
        if (lightContent.includes('<svg')) {
          const viewBoxMatch = lightContent.match(/viewBox="([^"]+)"/);
          if (viewBoxMatch) {
            const [_, x, y, width, height] = viewBoxMatch[1].split(/\s+/).map(parseFloat);
            const scaleFactor = 0.92;
            const translateX = (width - width * scaleFactor) / 2;
            const translateY = (height - height * scaleFactor) / 2;
            lightContent = lightContent.replace(/<svg/, 
              `<svg transform="translate(${translateX}, ${translateY}) scale(${scaleFactor})" `);
          }
        }
      } else {
        // Standard handling for other icons
        if (lightContent.includes('stroke-width')) {
          // Reduce stroke width for light version
          lightContent = lightContent.replace(/stroke-width="([^"]+)"/, (match, width) => {
            const newWidth = Math.max(parseFloat(width) * 0.6, 0.5);
            return `stroke-width="${newWidth}"`;
          });
        } else if (lightContent.includes('stroke=')) {
          // Add stroke-width if it has a stroke but no width
          lightContent = lightContent.replace(/stroke="([^"]+)"/, (match) => {
            return `${match} stroke-width="0.7"`;
          });
        } else if (lightContent.includes('fill=')) {
          // Add opacity to fill if no stroke modifications are possible
          lightContent = lightContent.replace(/fill="([^"]+)"/, (match, fill) => {
            if (fill === 'none') return match;
            return `fill="${fill}" opacity="0.7"`;
          });
        } else {
          // Last resort: Add outline stroke to create visual distinction
          lightContent = lightContent.replace(/<path/, '<path stroke="currentColor" stroke-width="0.7" ');
        }
      }
      
      // Write modified light icon back
      await fs.writeFile(pair.lightPath, lightContent, 'utf-8');
      console.log(`${colors.green}✅ Fixed ${pair.name}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error fixing ${pair.name}: ${error.message}${colors.reset}`);
    }
  }
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  return longer.length === 0 ? 1.0 : (longer.length - (longer.length - shorter.length)) / longer.length;
}

function findParentElement(path) {
  let current = path;
  while (current.parentPath) {
    if (current.parentPath.type === 'JSXElement') return current.parentPath;
    current = current.parentPath;
  }
  return null;
}

function checkForGroupClass(parent) {
  if (!parent || !parent.node) return false;
  const attributes = parent.node.openingElement.attributes;
  return attributes.some(attr => 
    t.isJSXAttribute(attr) && attr.name.name === 'className' && 
    (t.isStringLiteral(attr.value) && attr.value.value.split(' ').includes('group') ||
     t.isJSXExpressionContainer(attr.value) && 
     (t.isTemplateLiteral(attr.value.expression) && attr.value.expression.quasis.some(q => q.value.raw.includes('group')) ||
      t.isCallExpression(attr.value.expression) && attr.value.expression.arguments.some(a => t.isStringLiteral(a) && a.value.includes('group'))))
  );
}

// Audit function
async function runAudit(options = {}) {
  const { fixMode, verboseMode, htmlReportMode, fixDuplicatesMode } = options;
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');
  const outputFile = path.join(rootDir, 'icon-audit-report.json');

  console.log(`${colors.bright}${colors.blue}🔍 Icon Audit System${colors.reset}\n`);

  const iconUsages = [];
  const fixedFiles = new Set();
  let fixedCount = 0;

  let lightSolidValidation = null;
  if (verboseMode || fixDuplicatesMode) {
    console.log(`${colors.cyan}Validating light/solid icon differentiation...${colors.reset}`);
    lightSolidValidation = await validateLightSolidDistinctness();
  }

  console.log(`${colors.cyan}Scanning codebase for icon usage...${colors.reset}`);
  const files = await glob(`${srcDir}/**/*.{ts,tsx,js,jsx}`, { ignore: ['node_modules/**'] });
  console.log(`Found ${files.length} source files to scan.`);

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      let fileModified = false;

      traverse(ast, {
        JSXOpeningElement(path) {
          if (!t.isJSXIdentifier(path.node.name)) return;
          const nodeName = path.node.name.name;
          if (!['Icon', 'StaticIcon', 'ButtonIcon', 'DeleteIcon', 'WarningIcon', 'SuccessIcon'].includes(nodeName)) return;

          const usage = {
            file: file.replace(rootDir, ''),
            line: path.node.loc?.start.line ?? 0,
            column: path.node.loc?.start.column ?? 0,
            component: nodeName,
            props: {},
            issues: [],
            suggestions: [],
            fixed: false
          };

          // Extract props
          path.node.attributes.forEach(attr => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
              const propName = attr.name.name;
              let propValue;
              if (t.isStringLiteral(attr.value)) propValue = attr.value.value;
              else if (t.isJSXExpressionContainer(attr.value)) {
                if (t.isStringLiteral(attr.value.expression)) propValue = attr.value.expression.value;
                else if (t.isBooleanLiteral(attr.value.expression)) propValue = attr.value.expression.value;
                else usage.issues.push(`Dynamic prop "${propName}" detected (cannot validate at runtime)`);
              } else if (attr.value === null) propValue = true;
              usage.props[propName] = propValue;
            }
          });

          const { name, kpiName, appName, platformName, iconType, action, solid, style } = usage.props;

          // Validation
          if (!name && !kpiName && !appName && !platformName) {
            usage.issues.push('No icon type specified (name, kpiName, appName, or platformName missing)');
          }

          if (name) {
            // Check for HeroIcons
            if (name.endsWith('Icon') && HERO_TO_FA_MAPPINGS[name]) {
              usage.issues.push(`Legacy HeroIcon "${name}" detected`);
              usage.suggestions.push(`Use "${HERO_TO_FA_MAPPINGS[name]}"`);
              if (fixMode) {
                const attrPath = path.get('attributes').find(a => a.node.name.name === 'name');
                if (attrPath && attrPath.get('value')) {
                  attrPath.get('value').replaceWith(t.stringLiteral(HERO_TO_FA_MAPPINGS[name]));
                  usage.fixed = true;
                  fileModified = true;
                  fixedCount++;
                }
              }
            }
            // Check FA prefix
            else if (!name.startsWith(FA_PREFIX)) {
              const normalizedName = normalizeIconName(name);
              usage.issues.push(`Icon "${name}" missing "fa" prefix`);
              usage.suggestions.push(`Use "${normalizedName}"`);
              if (fixMode) {
                const attrPath = path.get('attributes').find(a => a.node.name.name === 'name');
                if (attrPath && attrPath.get('value')) {
                  attrPath.get('value').replaceWith(t.stringLiteral(normalizedName));
                  usage.fixed = true;
                  fileModified = true;
                  fixedCount++;
                }
              }
            }
            // Check existence
            const baseName = name.replace(/Light$/, '');
            const kebabName = convertCamelToKebab(baseName.replace(/^fa/, ''));
            const solidPath = `ui-icons/solid/${kebabName}.svg`;
            const lightPath = `ui-icons/light/${kebabName}.svg`;
            if (!iconExists(solidPath) || (!name.endsWith('Light') && !iconExists(lightPath))) {
              usage.issues.push(`Icon "${baseName}" not downloaded to public/ui-icons`);
              usage.suggestions.push(`Run "npm run update-icons" to download`);
            }
            // Validate style
            if (style && !VALID_STYLES.includes(style)) {
              usage.issues.push(`Invalid style "${style}"`);
              usage.suggestions.push(`Use one of: ${VALID_STYLES.join(', ')}`);
            }
          }

          // Validate button icon behavior
          if (nodeName === 'ButtonIcon' || iconType === 'button') {
            if (solid) {
              usage.issues.push('Button icons should not use solid={true}');
              if (fixMode) {
                const attrPath = path.get('attributes').find(a => a.node.name.name === 'solid');
                if (attrPath) {
                  attrPath.remove();
                  usage.fixed = true;
                  fileModified = true;
                  fixedCount++;
                }
              }
            }
            if (!checkForGroupClass(findParentElement(path))) {
              usage.issues.push('Button icon should be inside a parent with "group" class for hover effects');
              usage.suggestions.push('Add className="group" to parent element');
            }
          }

          // Validate static icon
          if (nodeName === 'StaticIcon' || iconType === 'static') {
            if (solid === undefined) {
              usage.issues.push('Static icons should specify solid={true|false}');
              usage.suggestions.push('Add solid={false} or solid={true}');
            }
          }

          // Validate action
          if (action && !VALID_ACTIONS.includes(action)) {
            usage.issues.push(`Invalid action "${action}"`);
            usage.suggestions.push(`Use one of: ${VALID_ACTIONS.join(', ')}`);
          }

          // Record all usages in verbose mode, or only those with issues otherwise
          if (usage.issues.length > 0 || verboseMode) iconUsages.push(usage);
        }
      });

      if (fileModified) {
        const output = generate(ast, { retainLines: true });
        await fs.writeFile(file, output.code, 'utf-8');
        fixedFiles.add(file);
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalIcons: iconUsages.length,
    totalIssues: iconUsages.filter(u => u.issues.length > 0).length,
    details: iconUsages,
    fixedCount,
    fixedFiles: Array.from(fixedFiles).map(f => f.replace(rootDir, '')),
    lightSolidValidation
  };

  await fs.writeFile(outputFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`${colors.green}✅ Audit complete. Report saved to ${outputFile}${colors.reset}`);

  // Summary
  console.log(`\n${colors.cyan}📊 Audit Summary:${colors.reset}`);
  console.log(`Total icons audited: ${report.totalIcons}`);
  console.log(`Issues found: ${report.totalIssues}`);
  if (fixMode) console.log(`Issues fixed: ${fixedCount} across ${fixedFiles.size} files`);

  if (verboseMode) {
    console.log('\nDetailed Report:');
    const byFile = iconUsages.reduce((acc, u) => {
      acc[u.file] = acc[u.file] || [];
      acc[u.file].push(u);
      return acc;
    }, {});
    for (const [file, usages] of Object.entries(byFile)) {
      console.log(`\n${file}:`);
      usages.forEach(u => {
        console.log(`  Line ${u.line}: ${u.component} - ${u.issues.join(', ') || 'OK'}`);
        if (u.suggestions.length) console.log(`    Suggestions: ${u.suggestions.join(', ')}`);
        if (u.fixed) console.log(`    ${colors.green}Fixed${colors.reset}`);
      });
    }
  }

  if (htmlReportMode) await generateHtmlReport(report);

  return report;
}

async function generateHtmlReport(report) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Icon Audit Report</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 2rem; line-height: 1.5; }
        h1, h2, h3 { margin-top: 2rem; }
        .summary { display: flex; gap: 2rem; flex-wrap: wrap; }
        .stat { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; min-width: 200px; }
        .stat h3 { margin-top: 0; margin-bottom: 0.5rem; }
        .file { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .issue { background: white; padding: 0.5rem 1rem; margin: 0.5rem 0; border-left: 3px solid #e74c3c; }
        .issue.fixed { border-left-color: #2ecc71; }
        .suggestions { margin-left: 1rem; color: #3498db; }
        .fixed-badge { background: #2ecc71; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; }
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; padding: 0.5rem; }
        th { background: #f5f5f5; }
        tr:nth-child(even) { background: #f9f9f9; }
        .alert { padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
        .alert-success { background: #d4edda; color: #155724; }
        .alert-warning { background: #fff3cd; color: #856404; }
        .alert-danger { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <h1>Icon Audit Report</h1>
      <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
      
      <div class="summary">
        <div class="stat">
          <h3>Total Icons</h3>
          <p>${report.totalIcons}</p>
        </div>
        <div class="stat">
          <h3>Issues Found</h3>
          <p>${report.totalIssues}</p>
        </div>
        <div class="stat">
          <h3>Fixed Issues</h3>
          <p>${report.fixedCount || 0}</p>
        </div>
        <div class="stat">
          <h3>Files Modified</h3>
          <p>${report.fixedFiles.length}</p>
        </div>
      </div>

      ${report.lightSolidValidation ? `
        <h2>Light/Solid Icon Differentiation</h2>
        <div class="summary">
          <div class="stat">
            <h3>Distinct Pairs</h3>
            <p>${report.lightSolidValidation.distinct}</p>
          </div>
          <div class="stat">
            <h3>Duplicate Pairs</h3>
            <p>${report.lightSolidValidation.duplicates}</p>
          </div>
        </div>
        
        ${report.lightSolidValidation.duplicates > 0 ? `
          <div class="alert alert-warning">
            <p>⚠️ <strong>Warning:</strong> ${report.lightSolidValidation.duplicates} light icons are identical or too similar to their solid counterparts!</p>
            <p>Run <code>node scripts/audit-icons.js --fix-duplicates</code> to fix this issue.</p>
            <p>Affected icons: ${report.lightSolidValidation.pairs.map(p => p.name).join(', ')}</p>
          </div>
        ` : `
          <div class="alert alert-success">
            <p>✅ All light/solid icon pairs are correctly differentiated.</p>
          </div>
        `}
      ` : ''}

      <h2>Issue Types</h2>
      <table>
        <tr>
          <th>Issue</th>
          <th>Count</th>
        </tr>
        ${Object.entries(report.details.reduce((acc, u) => {
          u.issues.forEach(i => {
            const key = i.includes(':') ? i.split(':')[0] : i;
            acc[key] = (acc[key] || 0) + 1;
          });
          return acc;
        }, {})).sort((a, b) => b[1] - a[1]).map(([issue, count]) => `
          <tr>
            <td>${issue}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
      </table>
      
      <h2>Issues by File</h2>
      ${Object.entries(report.details.reduce((acc, u) => {
        if (u.issues.length === 0) return acc;
        acc[u.file] = acc[u.file] || [];
        acc[u.file].push(u);
        return acc;
      }, {})).map(([file, usages]) => `
        <div class="file">
          <h3>${file}</h3>
          ${usages.map(u => `
            <div class="issue ${u.fixed ? 'fixed' : ''}">
              <p>Line ${u.line}: ${u.component} - ${u.issues.join(', ')}</p>
              ${u.suggestions.length ? `<p class="suggestions">Suggestions: ${u.suggestions.join(', ')}</p>` : ''}
              ${u.fixed ? '<span class="fixed-badge">Fixed</span>' : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  const outputPath = path.join(process.cwd(), 'icon-audit-report.html');
  await fs.writeFile(outputPath, html, 'utf-8');
  console.log(`${colors.green}✅ HTML report generated at ${outputPath}${colors.reset}`);
}

async function main() {
  await runAudit({ 
    fixMode, 
    verboseMode, 
    htmlReportMode, 
    fixDuplicatesMode 
  });
}

main().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});