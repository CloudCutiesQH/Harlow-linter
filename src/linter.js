/**
 * Main Harlowe linter functionality
 */

const { loadMacroNames } = require('./macroParser');
const { parseTweeFile, extractMacros } = require('./tweeParser');

/**
 * Lint a Twee file for Harlowe code errors
 * @param {string} filePath - Path to the Twee file
 * @returns {Object} Linting results with errors and warnings
 */
function lintFile(filePath) {
  const validMacros = loadMacroNames();
  const passages = parseTweeFile(filePath);
  
  const errors = [];
  const warnings = [];
  
  // Check each passage
  for (const passage of passages) {
    const macros = extractMacros(passage.content, passage.startLine);
    
    // Validate each macro
    for (const macro of macros) {
      if (!validMacros.has(macro.name)) {
        errors.push({
          type: 'invalid-macro',
          message: `Unknown macro name: '${macro.name}'`,
          passage: passage.name,
          line: macro.line,
          column: macro.column,
          suggestion: findSimilarMacro(macro.name, validMacros)
        });
      }
    }
    
    // Check for unclosed macros (basic check for unmatched parentheses)
    const unclosedErrors = checkUnclosedMacros(passage.content, passage.name, passage.startLine);
    errors.push(...unclosedErrors);
  }
  
  return {
    filePath,
    errors,
    warnings,
    passageCount: passages.length,
    isValid: errors.length === 0
  };
}

/**
 * Check for unclosed macros (unmatched parentheses)
 * @param {string} content - Passage content
 * @param {string} passageName - Name of the passage
 * @param {number} startLine - Starting line number
 * @returns {Array} Array of errors
 */
function checkUnclosedMacros(content, passageName, startLine) {
  const errors = [];
  let depth = 0;
  let openPositions = [];
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '(') {
      depth++;
      openPositions.push({
        index: i,
        line: startLine + (content.substring(0, i).match(/\n/g) || []).length
      });
    } else if (char === ')') {
      depth--;
      openPositions.pop();
      
      if (depth < 0) {
        const line = startLine + (content.substring(0, i).match(/\n/g) || []).length;
        errors.push({
          type: 'unmatched-parenthesis',
          message: 'Unexpected closing parenthesis',
          passage: passageName,
          line: line,
          column: i - content.lastIndexOf('\n', i)
        });
        depth = 0; // Reset to continue checking
      }
    }
  }
  
  // Check for unclosed parentheses
  if (depth > 0 && openPositions.length > 0) {
    for (const pos of openPositions) {
      errors.push({
        type: 'unclosed-macro',
        message: 'Unclosed macro or parenthesis',
        passage: passageName,
        line: pos.line,
        column: pos.index - content.lastIndexOf('\n', pos.index)
      });
    }
  }
  
  return errors;
}

/**
 * Find similar macro names for suggestions
 * @param {string} macroName - The invalid macro name
 * @param {Set} validMacros - Set of valid macro names
 * @returns {string|null} Suggested macro name or null
 */
function findSimilarMacro(macroName, validMacros) {
  const lowerMacro = macroName.toLowerCase();
  
  // First, check for exact case-insensitive match
  for (const valid of validMacros) {
    if (valid.toLowerCase() === lowerMacro) {
      return valid;
    }
  }
  
  // Then, check for similar names (Levenshtein distance)
  let bestMatch = null;
  let bestDistance = Infinity;
  
  for (const valid of validMacros) {
    const distance = levenshteinDistance(lowerMacro, valid.toLowerCase());
    if (distance < bestDistance && distance <= 2) {
      bestDistance = distance;
      bestMatch = valid;
    }
  }
  
  return bestMatch;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Format linting results for display
 * @param {Object} results - Linting results
 * @returns {string} Formatted output
 */
function formatResults(results) {
  let output = `\nLinting: ${results.filePath}\n`;
  output += `Passages checked: ${results.passageCount}\n\n`;
  
  if (results.errors.length === 0 && results.warnings.length === 0) {
    output += '✓ No errors found!\n';
    return output;
  }
  
  if (results.errors.length > 0) {
    output += `Errors (${results.errors.length}):\n`;
    for (const error of results.errors) {
      output += `  ${error.passage} (line ${error.line}): ${error.message}\n`;
      if (error.suggestion) {
        output += `    Did you mean: ${error.suggestion}?\n`;
      }
    }
    output += '\n';
  }
  
  if (results.warnings.length > 0) {
    output += `Warnings (${results.warnings.length}):\n`;
    for (const warning of results.warnings) {
      output += `  ${warning.passage} (line ${warning.line}): ${warning.message}\n`;
    }
  }
  
  return output;
}

module.exports = {
  lintFile,
  formatResults,
  checkUnclosedMacros,
  findSimilarMacro
};
