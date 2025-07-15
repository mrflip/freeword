# opendict

Open dictionary with word forms list.

## Installation

```bash
npm install opendict
```

## Usage

### JavaScript

```javascript
import { WordformsList } from 'opendict';

// Use WordformsList as needed
console.log(WordformsList[0]); // First word form entry
```

### TypeScript

```typescript
import { WordformsList, WordformT, Poskind, Stemkind } from 'opendict';

// TypeScript provides full type safety
const entry: WordformT = WordformsList.find(w => w.word === 'aardvark')!;
console.log(entry.gloss); // "an African mammal"

// You can also use specific stemkind types for better type safety
import { VerbStemkind, NounStemkind } from 'opendict';
const verbEntry: WordformT & { stemkind: VerbStemkind } = WordformsList.find(w => w.pos === 'verb')!;

// Import constants and types directly from src
import { Poskinds, StemkindsForPos, AdjStemkind } from 'opendict/src';
```

## API

### WordformsList

The main export from this package. Provides access to word forms data.

### WordformT

TypeScript interface for individual word form entries:

```typescript
interface WordformT {
  word: string;        // The actual word form
  core: string;        // The core/base form of the word
  pos: Poskind;        // Part of speech (noun, verb, adj, etc.)
  stemkind: Stemkind;  // Type of stem (e.g., 'v_core', 'v_ed', 'n_core', 'n_pl_s')
  suffix: string;      // Suffix added to the core
  stemcore: string;    // The stem core
  stemsplit: string;   // The stem with split marker
  wordbits?: number;   // Binary word bits for morphological analysis
  freq?: number;       // Frequency of the word form
  gloss: string;       // Definition or gloss of the word
  tmi?: Record<string, any>; // Additional properties
}
```

### Type Definitions

The package also exports specific types for better type safety:

- `Poskind`: Union type of all parts of speech
- `Stemkind`: Union type of all stem kinds
- `VerbStemkind`, `NounStemkind`, `AdjStemkind`, etc.: Specific stemkind types for each part of speech
- `Word`, `Wordpart`, `Wordstem`, `Wordbits`: Specialized string and number types

### Constants

The package also exports constants that can be imported from the `/src` subpath:

```typescript
import { Poskinds, StemkindsForPos } from 'opendict/src';

// Poskinds: Array of all part of speech types
// StemkindsForPos: Mapping of part of speech to available stemkinds
```

## License

MIT