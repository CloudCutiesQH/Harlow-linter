# Harlowe Linter

A linter for validating Harlowe code in Twee files. This tool scans your Twee story files and checks for invalid macro names and syntax errors according to the official Harlowe documentation.

## Features

- ✅ Validates macro names against Harlowe 3.3.8 documentation
- ✅ Detects unclosed macros and unmatched parentheses
- ✅ Provides helpful suggestions for misspelled macro names
- ✅ Reports line and column numbers for errors
- ✅ Supports both single files and directories
- ✅ Works with `.twee` and `.tw` file extensions
- ✅ Can parse and lint from strings (for programmatic use)

## Installation

### From Source

```bash
git clone <repository-url>
cd Harlow-linter
npm install
npm link  # Optional: makes harlowe-lint available globally
```

### Usage

#### Lint a single file:
```bash
node src/cli.js examples/example.twee
# or if installed globally:
harlowe-lint examples/example.twee
```

#### Lint all files in a directory:
```bash
node src/cli.js ./stories
# or if installed globally:
harlowe-lint ./stories
```

#### Show help:
```bash
node src/cli.js --help
```

## Examples

### Valid Twee File
```twee
:: Start
Welcome to the story!

(set: $name to "Player")
(set: $health to 100)

Your name is $name and you have $health health points.

[[Next->Chapter1]]
```

Running the linter:
```bash
$ node src/cli.js examples/example.twee

Linting: examples/example.twee
Passages checked: 6

✓ No errors found!
```

### File with Errors
```twee
:: Start
(sett: $name to "Player")
(invalidmacro: "test")
(set: $value to 10
```

Running the linter:
```bash
$ node src/cli.js examples/example-with-errors.twee

Linting: examples/example-with-errors.twee
Passages checked: 3

Errors (5):
  Start (line 7): Unknown macro name: 'sett'
    Did you mean: set?
  Start (line 14): Unknown macro name: 'invalidmacro'
  Start (line 12): Unclosed macro or parenthesis
  Start (line 17): Unclosed macro or parenthesis
  Chapter1 (line 24): Unclosed macro or parenthesis
```

## Error Types

The linter detects the following types of errors:

1. **invalid-macro**: Unknown or misspelled macro names
   - Includes suggestions for similar valid macro names
   
2. **unclosed-macro**: Macros with unmatched opening parentheses
   
3. **unmatched-parenthesis**: Unexpected closing parentheses

## Supported Macros

The linter validates against all macros documented in Harlowe 3.3.8, including:

- **Basics**: set, put, move, print, display, if, unless, else-if, else, for, etc.
- **Data structures**: a, dm, ds, array, datamap, dataset, etc.
- **Links**: link, link-goto, link-reveal, click, etc.
- **Styling**: text-colour, bg, font, align, etc.
- **And many more** (291 total macros including aliases)

See `HarloweDocs.md` for the complete list of supported macros.

## Programmatic Usage

You can use the linter as a library in your Node.js projects:

### Linting from a string

```javascript
const { lintString } = require('harlowe-linter');

const tweeContent = `:: Start
(set: $name to "Player")
(print: $name)

:: Chapter1
(sett: $health to 100)
`;

const results = lintString(tweeContent, 'my-story.twee');

console.log('Errors found:', results.errors.length);
console.log('Is valid:', results.isValid);

// Access specific errors
results.errors.forEach(error => {
  console.log(`${error.passage} (line ${error.line}): ${error.message}`);
  if (error.suggestion) {
    console.log(`  Did you mean: ${error.suggestion}?`);
  }
});
```

### Linting from a file

```javascript
const { lintFile } = require('harlowe-linter');

const results = lintFile('./story.twee');

if (results.isValid) {
  console.log('No errors found!');
} else {
  console.log(`Found ${results.errors.length} errors`);
}
```

### Available Functions

- `lintString(content, sourceName)` - Lint Twee content from a string
  - `content` (string): The Twee file content
  - `sourceName` (string, optional): Name for the source (defaults to `'<string>'`)
  - Returns: Linting results object

- `lintFile(filePath)` - Lint a Twee file
  - `filePath` (string): Path to the Twee file
  - Returns: Linting results object

- `formatResults(results)` - Format linting results as a readable string
  - `results` (object): Linting results from `lintString` or `lintFile`
  - Returns: Formatted string

### Results Object

Both `lintString` and `lintFile` return an object with:

```javascript
{
  filePath: string,        // Source name or file path
  errors: Array,           // Array of error objects
  warnings: Array,         // Array of warning objects
  passageCount: number,    // Number of passages found
  isValid: boolean         // true if no errors found
}
```

Each error object contains:

```javascript
{
  type: string,           // Error type: 'invalid-macro', 'unclosed-macro', etc.
  message: string,        // Human-readable error message
  passage: string,        // Name of the passage containing the error
  line: number,           // Line number in the file
  column: number,         // Column number in the file
  suggestion: string      // Optional suggestion for fixing the error
}
```

## Development

### Run Tests
```bash
npm test
```

### Project Structure
```
Harlow-linter/
├── src/
│   ├── cli.js          # Command-line interface
│   ├── linter.js       # Main linting logic
│   ├── macroParser.js  # Parses HarloweDocs.md for valid macros
│   └── tweeParser.js   # Parses Twee files
├── test/
│   └── linter.test.js  # Test suite
├── examples/
│   ├── example.twee              # Valid example
│   └── example-with-errors.twee  # Example with errors
├── HarloweDocs.md      # Harlowe 3.3.8 documentation
└── README.md           # This file
```

## How It Works

1. **Macro Extraction**: The linter parses `HarloweDocs.md` to extract all valid macro names
2. **Twee Parsing**: It parses your `.twee` files to identify passages and their content
3. **Validation**: Each macro call in the passages is validated against the list of valid macros
4. **Error Reporting**: Any invalid macros or syntax errors are reported with line numbers and suggestions

## Limitations

- The linter focuses on macro name validation and basic syntax checking
- It does not validate:
  - Macro argument types or counts
  - Variable naming conventions
  - Passage link targets
  - Complex nested macro structures beyond parenthesis matching
  - Runtime logic errors

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Credits

Based on the Harlowe story format for Twine 2, created by Leon Arnott.
