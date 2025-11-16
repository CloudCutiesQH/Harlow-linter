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
  
  // Find the "List of macros" section
  const macroListStart = content.indexOf('##### List of macros');
  const macroListEnd = content.indexOf('##### Special keywords');
  
  if (macroListStart === -1 || macroListEnd === -1) {
    throw new Error('Could not find macro list section in documentation');
  }
  
  const macroSection = content.substring(macroListStart, macroListEnd);
  
  // Match macro definitions in list items: *   [(macro-name: params)](#macro_macro-name) Type
  const mainMacroPattern = /\*\s+\[\(([a-z0-9-]+):/gi;
  
  let match;
  while ((match = mainMacroPattern.exec(macroSection)) !== null) {
    const macroName = match[1];
    macroNames.add(macroName);
  }
  
  // Match alias macros shown as plain text: (alias:) or (alias:), (alias2:)
  // These appear on separate lines after the main macro definition
  const aliasPattern = /^\s+\(([a-z0-9-]+):\)/gim;
  
  while ((match = aliasPattern.exec(macroSection)) !== null) {
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
