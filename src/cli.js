#!/usr/bin/env node

/**
 * Command-line interface for Harlowe linter
 */

const { lintFile, formatResults } = require('./linter');
const fs = require('fs');
const path = require('path');

function printUsage() {
  console.log(`
Harlowe Linter - Validate Harlowe code in Twee files

Usage:
  harlowe-lint <file.twee>
  harlowe-lint <directory>

Options:
  -h, --help     Show this help message
  -v, --version  Show version information

Examples:
  harlowe-lint story.twee
  harlowe-lint ./stories
`);
}

function printVersion() {
  const packageJson = require('../package.json');
  console.log(`Harlowe Linter v${packageJson.version}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }
  
  if (args.includes('-v') || args.includes('--version')) {
    printVersion();
    process.exit(0);
  }
  
  const target = args[0];
  
  if (!fs.existsSync(target)) {
    console.error(`Error: File or directory not found: ${target}`);
    process.exit(1);
  }
  
  const stats = fs.statSync(target);
  let files = [];
  
  if (stats.isDirectory()) {
    // Find all .twee files in directory
    files = findTweeFiles(target);
    if (files.length === 0) {
      console.log(`No .twee files found in ${target}`);
      process.exit(0);
    }
  } else if (stats.isFile()) {
    if (!target.endsWith('.twee') && !target.endsWith('.tw')) {
      console.error('Error: File must have .twee or .tw extension');
      process.exit(1);
    }
    files = [target];
  }
  
  let hasErrors = false;
  
  for (const file of files) {
    try {
      const results = lintFile(file);
      console.log(formatResults(results));
      
      if (!results.isValid) {
        hasErrors = true;
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      hasErrors = true;
    }
  }
  
  process.exit(hasErrors ? 1 : 0);
}

/**
 * Recursively find all .twee files in a directory
 * @param {string} dir - Directory to search
 * @returns {Array<string>} Array of file paths
 */
function findTweeFiles(dir) {
  const files = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findTweeFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.twee') || entry.name.endsWith('.tw'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

if (require.main === module) {
  main();
}

module.exports = { main };
