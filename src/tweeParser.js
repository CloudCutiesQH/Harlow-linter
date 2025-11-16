/**
 * Parse Twee files and extract Harlowe code
 */

const fs = require('fs');

/**
 * Parse Twee content string into passages
 * @param {string} content - Twee file content as string
 * @returns {Array} Array of passage objects
 */
function parseTweeContent(content) {
  const passages = [];
  
  // Twee format: :: PassageName [tags]
  // Followed by passage content until the next :: or end of file
  const passagePattern = /^::\s*(.+?)(\s+\[([^\]]*)\])?\s*$/gm;
  
  let match;
  let lastIndex = 0;
  
  while ((match = passagePattern.exec(content)) !== null) {
    // Save previous passage content if exists
    if (passages.length > 0) {
      const previousPassage = passages[passages.length - 1];
      previousPassage.content = content.substring(lastIndex, match.index).trim();
      previousPassage.startLine = countLines(content.substring(0, lastIndex));
    }
    
    // Create new passage
    const passageName = match[1].trim();
    const tags = match[3] ? match[3].split(/\s+/).filter(t => t) : [];
    
    passages.push({
      name: passageName,
      tags: tags,
      content: '',
      startLine: countLines(content.substring(0, match.index))
    });
    
    lastIndex = match.index + match[0].length + 1;
  }
  
  // Handle last passage
  if (passages.length > 0) {
    const lastPassage = passages[passages.length - 1];
    lastPassage.content = content.substring(lastIndex).trim();
    lastPassage.startLine = countLines(content.substring(0, lastIndex));
  }
  
  return passages;
}

/**
 * Parse a Twee file into passages
 * @param {string} filePath - Path to the Twee file
 * @returns {Array} Array of passage objects
 */
function parseTweeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseTweeContent(content);
}

/**
 * Count lines in a string
 * @param {string} str - String to count lines in
 * @returns {number} Number of lines
 */
function countLines(str) {
  return (str.match(/\n/g) || []).length + 1;
}

/**
 * Extract all Harlowe macros from passage content
 * @param {string} content - Passage content
 * @returns {Array} Array of macro objects with name and position
 */
function extractMacros(content, startLine = 1) {
  const macros = [];
  
  // Match Harlowe macro calls: (macroName: arguments)
  // This regex handles nested parentheses up to a reasonable depth
  const macroPattern = /\(([a-zA-Z0-9-]+)\s*:/g;
  
  let match;
  while ((match = macroPattern.exec(content)) !== null) {
    const macroName = match[1];
    const position = match.index;
    const line = startLine + countLines(content.substring(0, position)) - 1;
    const column = position - content.lastIndexOf('\n', position);
    
    macros.push({
      name: macroName,
      position: position,
      line: line,
      column: column,
      fullMatch: match[0]
    });
  }
  
  return macros;
}

module.exports = {
  parseTweeFile,
  parseTweeContent,
  extractMacros,
  countLines
};
