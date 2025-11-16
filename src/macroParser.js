/**
 * Parse HarloweDocs.md to extract all valid macro names
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract all valid macro names from the Harlowe documentation
 * @param {string} docPath - Path to HarloweDocs.md
 * @returns {Set<string>} Set of valid macro names
 */
function extractMacroNames(docPath) {
  const content = fs.readFileSync(docPath, 'utf-8');
  const macroNames = new Set();
  
  // Match macro definitions like: [(set: ...VariableToValue)](#macro_set) Instant
  // Or with aliases like: (b4r:) or (rgba:)
  const macroPattern = /\(\s*([a-zA-Z0-9-]+)\s*:/g;
  
  let match;
  while ((match = macroPattern.exec(content)) !== null) {
    const macroName = match[1];
    macroNames.add(macroName);
  }
  
  return macroNames;
}

/**
 * Load and cache macro names
 */
function loadMacroNames() {
  const docPath = path.join(__dirname, '..', 'HarloweDocs.md');
  return extractMacroNames(docPath);
}

module.exports = {
  extractMacroNames,
  loadMacroNames
};
