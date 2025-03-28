/**
 * Code quality, linting, and formatting scripts
 * 
 * This index file exports all scripts in the linting category
 * for easier importing and usage.
 */

import checkDb from './check-db.js';
import componentDependencyAnalyzer from './component-dependency-analyzer.js';
import findAnyTypes from './find-any-types.js';
import findHookIssues from './find-hook-issues.js';
import findImgTags from './find-img-tags.js';
import fixAnyTypes from './fix-any-types.js';
import fixImgTags from './fix-img-tags.js';
import generateScriptsDocs from './generate-scripts-docs.js';

module.exports = {
  checkDb,
  componentDependencyAnalyzer,
  findAnyTypes,
  findHookIssues,
  findImgTags,
  fixAnyTypes,
  fixImgTags,
  generateScriptsDocs,
};
