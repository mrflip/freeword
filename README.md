# Freeword

Open dictionary with word forms list.

## Installation

```bash
npm install @freeword/freeword-all-byword
```

## Usage

### JavaScript

```javascript
import { Wordforms } from '@freeword/freeword-all-byword';

// Use WordformsList as needed
console.log(Wordforms.monkeyshines);
```
Name it what you like, or use the namespaced version:
```
import { Wordforms as Dictionary } from '@freeword/freeword-all-byword';
```

### TypeScript

```typescript
import { Wordforms, type WordformT, type Poskind, type Stemkind } from '@freeword/freeword-all-byword';

// TypeScript provides full type safety
const entry: WordformT = Wordforms.aardvark;
console.log(entry?.gloss); // "an African mammal"

// You can also use specific stemkind types for better type safety
import type { VerbStemkind, NounStemkind } from '@freeword/freeword-all-byword';
const verbEntry: WordformT & { stemkind: VerbStemkind } = Object.values(Words).filter((word) => (word.pos === 'verb')));

// Import constants and types directly from src
import { Poskinds, PosStemkinds, AdjStemkind } from '@freeword/freeword-all-byword';
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
import { Poskinds, PosStemkinds } from 'freeword/src';

// Poskinds: Array of all part of speech types
// PosStemkinds: Mapping of part of speech to available stemkinds
```

## License

MIT