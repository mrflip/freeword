# @freeword/meta

This package is the canonical source for all core types, constants, and utilities used in the Freeword project. It exports everything from the `src/` directory at the root of the monorepo.

## Usage

```js
import * as meta from '@freeword/meta';
// or import specific types/constants
import { WordformT, Consts } from '@freeword/meta';
```

## Exports
- All files from the root `src/` directory.

## Note
This package is intended for internal and downstream use by Freeword-related projects. All updates to types and constants should be made in the root `src/` directory and published via this package.
