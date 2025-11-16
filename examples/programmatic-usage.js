/**
 * Example of using harlowe-linter programmatically
 */

const { lintString, lintFile, formatResults } = require('../src/linter');

console.log('=== Example 1: Linting from a string ===\n');

const tweeContent = `:: Start
(set: $name to "Player")
(set: $health to 100)

Your name is $name and you have $health health.

[[Next->Chapter1]]

:: Chapter1
(if: $health > 50)[
  You're feeling good!
]

(link: "Continue")[
  (sett: $health to $health - 10)
  (go-to: "End")
]
`;

const stringResults = lintString(tweeContent, 'inline-story.twee');

console.log('Source:', stringResults.filePath);
console.log('Passages found:', stringResults.passageCount);
console.log('Valid:', stringResults.isValid);
console.log('Errors:', stringResults.errors.length);

if (stringResults.errors.length > 0) {
  console.log('\nErrors found:');
  stringResults.errors.forEach(error => {
    console.log(`  ${error.passage} (line ${error.line}): ${error.message}`);
    if (error.suggestion) {
      console.log(`    Suggestion: ${error.suggestion}`);
    }
  });
}

console.log('\n=== Example 2: Linting from a file ===\n');

const fileResults = lintFile('./examples/example.twee');
console.log(formatResults(fileResults));

console.log('=== Example 3: Checking multiple strings ===\n');

const stories = [
  { name: 'story1', content: ':: Start\n(set: $x to 1)\n' },
  { name: 'story2', content: ':: Start\n(sett: $x to 1)\n' },
  { name: 'story3', content: ':: Start\n(print: "Hello")\n' }
];

stories.forEach(story => {
  const result = lintString(story.content, story.name);
  console.log(`${story.name}: ${result.isValid ? '✓ Valid' : '✗ Invalid'}`);
  if (!result.isValid) {
    result.errors.forEach(error => {
      console.log(`  - ${error.message}`);
    });
  }
});
