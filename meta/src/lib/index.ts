
/**
 * | Goal                                              | functionName     | Operation   | Datatype | Javascript                 | Terminology          |
 * | ------------------------------------------------- | ---------------- | ----------- | -------- | -------------------------- | -------------------- |
 * | Which letters in A are missing from B?            | aMinusB          | `A - B`     | Wordbits | `A & ~B & WordbitMask`     | Difference           |
 * | Which letters in B are missing from A?            | aMinusB          | `B - A`     | Wordbits | `B & ~A & WordbitMask`     | Difference           |
 * | Which letters appear in either A or B (or both)?  | InEither         | `A ∪ B`     | Wordbits | `A \| B`                   | Union                |
 * | Which letters do both A and B have in common?     | InBoth           | `A ∩ B`     | Wordbits | `A & B`                    | Intersection         |
 * | Which letters are in A, or in B, but not in both? | InEitherNotBoth  | `A ∆ B`     | Wordbits | `A ^ B`                    | Symmetric Difference |
 * | Do A and B share any letters at all?              | HasOverlap       | `A ∩ B ≠ ∅` | boolean  | `(A & B) !== 0`            | Overlap              |
 * | Do A and B have no letters in common?             | HasNoOverlap     | `A ∩ B = ∅` | boolean  | `(A & B) === 0`            | Disjoint             |
 * | Do A and B use exactly the same letters?          | IsEqual          | `A = B`     | boolean  | `A === B`                  | Equality             |
 * | Does A include *all* of the letters in B?         | aHasAllOfB       | `A ⊆ B`     | boolean  | `(A & B) === A`            | Subset               |
 * | Does A include all the letters in B *and more*?   | aHasAllAndMoreB  | `A ⊊ B`     | boolean  | `(A & B) === A && A !== B` | Strict Subset        |
 * | Are *all* the letters in A found in B?            | aHasAllOfB       | `A ⊇ B`     | boolean  | `(A & B) === B`            | Superset             |
 * | Does B include all the letters in A *and more*?   | aHasAllAndMoreB  | `A ⊃ B`     | boolean  | `(A & B) === B && A !== B` | Strict Superset      |
 * | Is at least one letter in A missing from B?       | aHasMissingFromB | `A ⊄ B`     | boolean  | `(A & B) !== A`            | Not Subset           |
 * | Is at least one letter in B missing from A?       | aHasMissingFromB | `A ⊅ B`     | boolean  | `(A & B) !== B`            | Not Superset         |
 * | Which letters are *not* in A?                     | missingFrom      | `¬A`        | Wordbits | `~A & WordbitMask`         | Complement           |
 * | What if each letter is ROT13'd before comparison? | rot13Wordbits    | `rot13(A)`  | Wordbits | `rot13(A)`                 | ROT13                |
 *
 */
export * as Wordbits                          from './Wordbits.ts'
export * as UF                                from './UF.ts'
export * as Filer                             from './Filer.ts'
export * as Streaming                         from './Streaming.ts'
export { RandomFactory, SeededRandomFactory } from './Random.ts'