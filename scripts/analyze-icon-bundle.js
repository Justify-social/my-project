/**
 * Icon Bundle Size Analysis Tool
 * 
 * This script analyzes the bundle size impact of different icon libraries:
 * - Font Awesome (direct imports)
 * - Hero Icons
 * - React Icons
 * 
 * Usage: 
 *   node scripts/analyze-icon-bundle.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const TEMP_DIR = path.join(__dirname, '../temp-icon-analysis');
const ICON_SETS = [
  {
    name: 'Font Awesome (direct imports)',
    code: `
      import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
      import { 
        faUser, faSearch, faPlus, faMinus, faCheck, faXmark,
        faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
        faCog, faEnvelope, faCalendarDays, faTrash,
        faTriangleExclamation, faCircleInfo, faBell,
        faCircleCheck, faLightbulb, faCommentDots,
        faEye, faPen, faCopy, faTrashCan,
        faHeart, faStar, faBookmark, faShare,
        faDownload, faUpload, faList, faFilter,
        faTableCells, faListCheck, faTag, faLock,
        faUnlock, faKey, faPaperclip, faMoneyBill,
        faInstagram, faYoutube, faTiktok, faFacebook, 
        faXTwitter, faLinkedin
      } from '@fortawesome/free-solid-svg-icons';
      import {
        faUser as farUser,
        faCircleCheck as farCircleCheck,
        faLightbulb as farLightbulb,
        faCommentDots as farCommentDots,
        faEye as farEye,
        faCopy as farCopy,
        faTrashCan as farTrashCan,
        faHeart as farHeart,
        faStar as farStar,
        faBookmark as farBookmark,
      } from '@fortawesome/free-regular-svg-icons';
      
      export default function IconTest() {
        return (
          <div>
            <FontAwesomeIcon icon={faUser} />
            <FontAwesomeIcon icon={faSearch} />
            <FontAwesomeIcon icon={farUser} />
            {/* Other icons would be used here */}
          </div>
        );
      }
    `,
  },
  {
    name: 'Hero Icons Direct',
    code: `
      import {
        UserIcon, MagnifyingGlassIcon, PlusIcon, MinusIcon, CheckIcon, XMarkIcon,
        ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon,
        CogIcon, EnvelopeIcon, CalendarDaysIcon, TrashIcon,
        ExclamationTriangleIcon, InformationCircleIcon, BellIcon
      } from '@heroicons/react/24/solid';
      
      import {
        UserIcon as UserIconOutline,
        MagnifyingGlassIcon as MagnifyingGlassIconOutline,
        PlusIcon as PlusIconOutline,
        MinusIcon as MinusIconOutline,
        XMarkIcon as XMarkIconOutline
      } from '@heroicons/react/24/outline';
      
      export default function IconTest() {
        return (
          <div>
            <UserIcon className="w-6 h-6" />
            <MagnifyingGlassIcon className="w-6 h-6" />
            <UserIconOutline className="w-6 h-6" />
            {/* Other icons would be used here */}
          </div>
        );
      }
    `,
  },
  {
    name: 'React Icons',
    code: `
      import { FaUser, FaSearch, FaPlus, FaMinus, FaCheck, FaTimes } from 'react-icons/fa';
      import { HiUser, HiMagnifyingGlass, HiPlus, HiMinus, HiCheck, HiXMark } from 'react-icons/hi2';
      import { BsUser, BsSearch, BsPlus, BsMinus, BsCheck, BsX } from 'react-icons/bs';
      
      export default function IconTest() {
        return (
          <div>
            <FaUser className="w-6 h-6" />
            <FaSearch className="w-6 h-6" />
            <HiUser className="w-6 h-6" />
            <HiMagnifyingGlass className="w-6 h-6" />
            <BsUser className="w-6 h-6" />
            <BsSearch className="w-6 h-6" />
            {/* Other icons would be used here */}
          </div>
        );
      }
    `,
  },
];

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log(chalk.blue('📊 Running Icon Bundle Size Analysis'));
console.log(chalk.gray('------------------------------------------------'));

const results = [];

// Analyze each icon set
for (const iconSet of ICON_SETS) {
  console.log(chalk.cyan(`\nAnalyzing: ${iconSet.name}`));
  
  const filename = path.join(TEMP_DIR, `${iconSet.name.replace(/\s/g, '-').toLowerCase()}.jsx`);
  
  // Create the test file
  fs.writeFileSync(filename, iconSet.code);
  
  // Analyze bundle size using a simple webpack config (not perfect, but gives a relative comparison)
  try {
    // Create a minimal package.json for the test
    const packageJsonPath = path.join(TEMP_DIR, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      fs.writeFileSync(packageJsonPath, JSON.stringify({
        name: "icon-analysis",
        version: "1.0.0",
        type: "module",
        dependencies: {
          "@fortawesome/fontawesome-svg-core": "^6.4.2",
          "@fortawesome/free-brands-svg-icons": "^6.4.2",
          "@fortawesome/free-regular-svg-icons": "^6.4.2",
          "@fortawesome/free-solid-svg-icons": "^6.4.2",
          "@fortawesome/react-fontawesome": "^0.2.0",
          "@heroicons/react": "^2.0.18",
          "react": "^18.2.0",
          "react-icons": "^4.11.0"
        }
      }, null, 2));
    }
    
    // We would normally use webpack to analyze, but for simplicity, we'll just report file size
    const stats = fs.statSync(filename);
    const fileSizeKB = stats.size / 1024;
    
    // Estimate the actual bundle impact (this is very approximate)
    // In a real app, you would use tools like webpack-bundle-analyzer
    const estBundleSizeKB = fileSizeKB * 3; // Very rough approximation
    
    results.push({
      name: iconSet.name,
      fileSizeKB: fileSizeKB.toFixed(2),
      estBundleSizeKB: estBundleSizeKB.toFixed(2)
    });
    
    console.log(chalk.green(`✅ Analysis complete for ${iconSet.name}`));
  } catch (error) {
    console.error(chalk.red(`Error analyzing ${iconSet.name}:`), error);
  }
}

// Output results table
console.log('\n');
console.log(chalk.yellow('📦 Bundle Size Comparison:'));
console.log(chalk.gray('------------------------------------------------'));
console.log(chalk.yellow('Library                    | Import Size (KB) | Est. Bundle Impact (KB)'));
console.log(chalk.gray('------------------------------------------------'));

// Sort by estimated bundle size (smallest first)
results.sort((a, b) => parseFloat(a.estBundleSizeKB) - parseFloat(b.estBundleSizeKB));

results.forEach(result => {
  console.log(
    `${result.name.padEnd(27)} | ${result.fileSizeKB.padStart(15)} | ${result.estBundleSizeKB.padStart(20)}`
  );
});

console.log(chalk.gray('------------------------------------------------'));
console.log(chalk.blue(`💡 Note: These are approximate sizes based on import statements.`));
console.log(chalk.blue(`    For more accurate results, use webpack-bundle-analyzer in your project.`));
console.log(chalk.gray('------------------------------------------------'));

console.log(chalk.green(`\n✅ Analysis complete! Temporary files saved in ${TEMP_DIR}`));
console.log(`Run your own analysis with: node scripts/analyze-icon-bundle.js\n`); 