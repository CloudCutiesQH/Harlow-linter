/**
 * Simple tests for the Harlowe linter
 */

const { lintFile, lintString } = require('../src/linter');
const { loadMacroNames } = require('../src/macroParser');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testLoadMacroNames() {
  console.log('Testing macro name loading...');
  const macros = loadMacroNames();
  
  assert(macros.size > 0, 'Should load macro names');
  assert(macros.has('set'), 'Should include "set" macro');
  assert(macros.has('if'), 'Should include "if" macro');
  assert(macros.has('print'), 'Should include "print" macro');
  assert(macros.has('go-to'), 'Should include "go-to" macro');
  assert(macros.has('link'), 'Should include "link" macro');
  
  console.log(`✓ Loaded ${macros.size} macro names`);
}

function testValidFile() {
  console.log('Testing valid Twee file...');
  const filePath = path.join(__dirname, '../examples/example.twee');
  const results = lintFile(filePath);
  
  assert(results.isValid, 'Valid file should have no errors');
  assert(results.errors.length === 0, 'Should have 0 errors');
  assert(results.passageCount === 6, 'Should have 6 passages');
  
  console.log('✓ Valid file test passed');
}

function testInvalidFile() {
  console.log('Testing file with errors...');
  const filePath = path.join(__dirname, '../examples/example-with-errors.twee');
  const results = lintFile(filePath);
  
  assert(!results.isValid, 'Invalid file should have errors');
  assert(results.errors.length > 0, 'Should have errors');
  
  // Check for specific errors
  const invalidMacroErrors = results.errors.filter(e => e.type === 'invalid-macro');
  assert(invalidMacroErrors.length >= 2, 'Should detect invalid macros');
  
  const unclosedErrors = results.errors.filter(e => e.type === 'unclosed-macro');
  assert(unclosedErrors.length >= 3, 'Should detect unclosed macros');
  
  console.log(`✓ Invalid file test passed (found ${results.errors.length} errors)`);
}

function testLintString() {
  console.log('Testing lintString function...');
  
  // Test with valid content
  const validContent = `:: Start
(set: $name to "Player")
(print: $name)
[[Next->Chapter1]]

:: Chapter1
Chapter content here.
`;
  
  const validResult = lintString(validContent, 'test-string.twee');
  assert(validResult.isValid, 'Valid string should have no errors');
  assert(validResult.errors.length === 0, 'Should have 0 errors');
  assert(validResult.passageCount === 2, 'Should have 2 passages');
  
  // Test with invalid content
  const invalidContent = `:: Start
(sett: $name to "Player")
(invalidmacro: "test")
`;
  
  const invalidResult = lintString(invalidContent);
  assert(!invalidResult.isValid, 'Invalid string should have errors');
  assert(invalidResult.errors.length >= 2, 'Should detect invalid macros');
  
  const firstError = invalidResult.errors[0];
  assert(firstError.type === 'invalid-macro', 'Should identify error type');
  assert(firstError.suggestion === 'set', 'Should suggest correct macro');
  
  console.log('✓ lintString test passed');
}

function runTests() {
  console.log('\n=== Running Harlowe Linter Tests ===\n');
  
  try {
    testLoadMacroNames();
    testValidFile();
    testInvalidFile();
    testLintString();
    
    console.log('\n✓ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error(`\n✗ Test failed: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
