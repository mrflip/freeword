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

## Wordbits

| Goal                                              | functionName     | Operation   | Datatype | Javascript                 | Terminology          |
| ------------------------------------------------- | ---------------- | ----------- | -------- | -------------------------- | -------------------- |
| Which letters in A are missing from B?            | aMinusB          | `A - B`     | Wordbits | `A & ~B & WordbitMask`     | Difference           |
| Which letters in B are missing from A?            | aMinusB          | `B - A`     | Wordbits | `B & ~A & WordbitMask`     | Difference           |
| Which letters appear in either A or B (or both)?  | union         | `A ∪ B`     | Wordbits | `A \| B`                   | Union                |
| Which letters do both A and B have in common?     | intersection           | `A ∩ B`     | Wordbits | `A & B`                    | Intersection         |
| Which letters are in A, or in B, but not in both? | inEitherNotBoth  | `A ∆ B`     | Wordbits | `A ^ B`                    | Symmetric Difference |
| Do A and B share any letters at all?              | overlaps       | `A ∩ B ≠ ∅` | boolean  | `(A & B) !== 0`            | Overlap              |
| Do A and B have no letters in common?             | disjoint     | `A ∩ B = ∅` | boolean  | `(A & B) === 0`            | Disjoint             |
| Do A and B use exactly the same letters?          | equals          | `A = B`     | boolean  | `A === B`                  | Equality             |
| Does A include *all* of the letters in B?         | contains       | `A ⊆ B`     | boolean  | `(A & B) === A`            | Subset               |
| Does A include all the letters in B *and more*?   | aHasAllAndMoreB  | `A ⊊ B`     | boolean  | `(A & B) === A && A !== B` | Strict Subset        |
| Are *all* the letters in A found in B?            | contains       | `A ⊇ B`     | boolean  | `(A & B) === B`            | Superset             |
| Does B include all the letters in A *and more*?   | aHasAllAndMoreB  | `A ⊃ B`     | boolean  | `(A & B) === B && A !== B` | Strict Superset      |
| Is at least one letter in A missing from B?       | aHasMissingFromB | `A ⊄ B`     | boolean  | `(A & B) !== A`            | Not Subset           |
| Is at least one letter in B missing from A?       | aHasMissingFromB | `A ⊅ B`     | boolean  | `(A & B) !== B`            | Not Superset         |
| Which letters are *not* in A?                     | missingFrom      | `¬A`        | Wordbits | `~A & WordbitMask`         | Complement           |
| How many uniq letters are in A?                   | countUniqs       | `\|A\|`     | Wordbits | `((A*cn)&bn) % 15`         | ROT13                |
| What if each letter is ROT13'd before comparison? | rot13Wordbits    | `rot13(A)`  | Wordbits | `rot13(A)`                 | ROT13                |

## Note
This package is intended for internal and downstream use by Freeword-related projects. All updates to types and constants should be made in the root `src/` directory and published via this package.

