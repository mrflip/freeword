import      _                                /**/ from 'lodash'
// import   * as UF                               from './UF.ts'
import type * as TY                               from '../types.ts'
import      * as WordbitsTables                   from './WordbitsTables.ts'
//

const BITS_SMALLEST_26 = 0b11_1111_1111_1111_1111_1111_1111
const BITS_SMALLEST_14 = 0b11_1111_1111_1111
const BITS_SMALLEST_12 =    0b1111_1111_1111
const BITS_SMALLEST_8  =         0b1111_1111
const BITS_SMALLEST_2  =                0b11
const WordbitsMask     = BITS_SMALLEST_26

/** Which letters in A are missing from B?            | `A - B`     | Wordbits | Difference           | `A & ~B & WordbitMask`     | */
export function aMinusB(aBits: TY.WordbitsT, bBits: TY.WordbitsT):          TY.WordbitsT {
  return aBits & ~bBits & WordbitsMask
}

/** Which letters appear in either A or B (or both)?  | `A ∪ B`     | Wordbits | Union                | `A \| B`                   | */
export function union(aBits: TY.WordbitsT, bBits: TY.WordbitsT):         TY.WordbitsT {
  return aBits | bBits
}

/** Which letters do both A and B have in common?     | `A ∩ B`     | Wordbits | Intersection         | `A & B`                    | */
export function inBoth(aBits: TY.WordbitsT, bBits: TY.WordbitsT):           TY.WordbitsT {
  return aBits & bBits
}

/** Which letters are in A, or in B, but not in both? | `A ∆ B`     | Wordbits | Symmetric Difference | `A ^ B`                    | */
export function inEitherNotBoth(aBits: TY.WordbitsT, bBits: TY.WordbitsT):  TY.WordbitsT {
  return aBits ^ bBits
}

/** Do A and B share any letters at all?              | `A ∩ B ≠ ∅` | boolean  | Overlap              | `(A & B) !== 0`            | */
export function hasOverlap(aBits: TY.WordbitsT, bBits: TY.WordbitsT): boolean  {
  return (aBits & bBits) !== 0
}

/** Do A and B have no letters in common?             | `A ∩ B = ∅` | boolean  | Disjoint             | `(A & B) === 0`            | */
export function hasNoOverlap(aBits: TY.WordbitsT, bBits: TY.WordbitsT): boolean  {
  return (aBits & bBits) === 0
}
/** Do A and B use exactly the same letters?          | `A = B`     | boolean  | Equality             | `A === B`                  | */
export function isEqual(aBits: TY.WordbitsT, bBits: TY.WordbitsT): boolean  {
  return aBits === bBits
}

export function missingLtrs(wordbits: TY.WordbitsT): TY.MissingBits {
  return ~wordbits & BITS_SMALLEST_26
}

/** @returns a mask suitable for use in s1MaskContainsS2 */
export const containsMaskFor = missingLtrs

/** @returns a mask suitable for use in s1MaskContainsS2 */
export function containsMaskForWord(word: TY.Word | TY.Letter[]): TY.MissingBits {
  return missingLtrs(wordbitsForWord(word))
}

/** @returns true if s1 contains s2 -- NOTE: you must pass in `~s1`, not `s1` */
export function aHasAllOfBMasked(maskA: TY.MissingBits, bitsB: TY.WordbitsT): boolean {
  // maskA has a bit set for each element maskA does not have,
  // so if maskA & bitsB has anything set, then bitsB has an element that maskA does not have
  return (maskA & bitsB) === 0
}

/** Does A include *all* of the letters in B?         | `A ⊆ B`     | boolean  | Subset               | `(A & B) === A`            | */
export function aHasAllOfB(aBits: TY.WordbitsT, bBits: TY.WordbitsT): boolean  {
  return (aBits & bBits) === bBits
}

/** Does A include all the letters in B *and more*?   | `A ⊊ B`     | boolean  | Strict Subset        | `(A & B) === A && A !== B` | */
export function aHasAllAndMoreB(aBits: TY.WordbitsT, bBits: TY.WordbitsT): boolean  {
  return (aBits & bBits) === aBits && aBits !== bBits
}

/** Is at least one letter in A missing from B?       | `A ⊄ B`     | boolean  | Not Subset           | `(A & B) !== A`            | */
export function aHasMissingFromB(aBits: TY.WordbitsT, bBits: TY.WordbitsT): boolean  {
  return (aBits & bBits) !== aBits
}

/** Which letters are *not* in A?                     | `¬A`        | Wordbits | Complement           | `~A & WordbitMask`         | */
export function missingFrom(aBits: TY.WordbitsT): TY.WordbitsT { return ~aBits & WordbitsMask }

/** @returns letters that are in both A and B -- as wordbits */
export function inBothAandB(bitsA: TY.WordbitsT, bitsB: TY.WordbitsT): TY.WordbitsT {
  return bitsA & bitsB
}

/** @returns letters that are in either A, or B, or both -- as wordbits */
export function unionAorB(bitsA: TY.WordbitsT, bitsB: TY.WordbitsT): TY.WordbitsT {
  return bitsA | bitsB
}

/** @returns the wordbit mask for a single letter */
export function wordbitForLtr(ltr: TY.AtoZlo): number {
  return WordbitsTables.ltrToWordbitsTable[ltr]
}

const MAGIC_NUMBER14x  =     0x2000_4000_8001n
const MAGIC_NUMBER14m  = 0x111_1111_1111_1111n
const MAGIC_NUMBER14r  = 0b1111n

// 1. The multiply step repeats the bitfield four times, shifted by 2^15
//    (the fourteen, and an extra one each time).
//    That is, bit 0 will land at bits 3, 2, 1, 0 in their nybble.
// 2. The AND masks out all but the bottom bit in each nybble
// 3. The modulo 15 "sums" the nybbles
// We need to use a bigint to avoid overflow for over 8 bits
//
export function countBits14Magic(wordbits: bigint | number): number {
  // mult by x, mask by m, read by r
  return Number((((BigInt(wordbits) * MAGIC_NUMBER14x) & MAGIC_NUMBER14m) % MAGIC_NUMBER14r))
}

/** @returns the number of bits set in the bitfield */
export function countUniqLtrs(wordbits: TY.WordbitsT): number {
  const bits00to14 =  wordbits        & BITS_SMALLEST_14
  const bits15to25 = (wordbits >> 14) & BITS_SMALLEST_12
  return countBits14Magic(bits00to14) + countBits14Magic(bits15to25)
}
export const countBits28 = countUniqLtrs

// == [Convert strings to/from wordbits]

/** @returns a string of only lowercase letters; given nil, returns '' */
export function normalizeWord(str: TY.StringMaybe): TY.Word {
  return str?.toLowerCase().replace(/[^a-z]/g, '') ?? ''
}

/** @returns the wordbits encoding for a word:
 * bit 0 (least significant / rightmost) is set if the word has an 'a',
 * bit 1 is set if the word has a 'b', etc.
 * ...
 * bit 25 (most significant / leftmost) is set if the word has a 'z'
 */
export function wordbitsForWord(word: TY.Word | TY.Letter[]): TY.WordbitsT {
  let bitfield = 0
  for (const ltr of word) {
    bitfield |= WordbitsTables.ltrToWordbitsTable[ltr as TY.AtoZlo]
  }
  return bitfield
}

/** @returns the wordbits encoding for a word. @see {wordbitsForWord} */
export function wordbitsForWordSafe(str: TY.StringMaybe): TY.WordbitsT {
  return wordbitsForWord(normalizeWord(str))
}

export function missingWordbits(wordbits: TY.WordbitsT): TY.WordbitsT {
  return ~wordbits & BITS_SMALLEST_26
}

const rot13WordbitsMaskA2M = 0b00000000000011111111111111
const rot13WordbitsMaskN2Z = 0b11111111111100000000000000

/** ROT-13: trivially obscure/decode a string: a->n, b->o, ..., m->z, n->a, ..., z->m.
 * Installation is the reverse of removal.
 * @see {rot13Word} */
export function rot13Wordbits(wordbits: TY.WordbitsT): TY.WordbitsT {
  const a2m  = wordbits & rot13WordbitsMaskA2M
  const n2z  = wordbits & rot13WordbitsMaskN2Z
  return (a2m << 13) | (n2z >>> 13)
}

/** @returns the unique letters in the word, in alphabetical order */
export function ltrsForWordbits(wordbits: TY.WordbitsT): TY.Shingle {
  const bits00_06 =  wordbits        & 0b111_1111 as TY.AtoZnum
  const bits07_13 = (wordbits >>  7) & 0b111_1111 as TY.AtoZnum
  const bits14_20 = (wordbits >> 14) & 0b111_1111 as TY.AtoZnum
  const bits21_25 = (wordbits >> 21) &   0b1_1111 as TY.AtoZnum
  const uniqs = (
    WordbitsTables.abcdefgFor00_06[bits00_06]! +
    WordbitsTables.hijklmnFor07_13[bits07_13]! +
    WordbitsTables.opqrstuFor14_20[bits14_20]! +
    WordbitsTables.vwxyzFor21_25[bits21_25]!
  )
  return uniqs
}

/** @returns a fixed-width string of the wordbits, eg 0b00_0000_0100_1001_0001_1000_0100 for 'chimps' */
export function prettyWordbits(wordbits: TY.WordbitsT): string {
  const bit00to07  =  wordbits       & BITS_SMALLEST_8
  const bit08to15 = (wordbits >>  8) & BITS_SMALLEST_8
  const bit16to23 = (wordbits >> 16) & BITS_SMALLEST_8
  const bit24to27 = (wordbits >> 24) & BITS_SMALLEST_2
  return '0b' + [
    WordbitsTables.prettyBinaryTable2[bit24to27],
    WordbitsTables.prettyBinaryTable8[bit16to23],
    WordbitsTables.prettyBinaryTable8[bit08to15],
    WordbitsTables.prettyBinaryTable8[bit00to07],
  ].join('_')
  // return WordbitsTables.prettyBinaryTable26[wordbits]
}

export type DigestedWord = {
  /** the original word                    */ word:      TY.Word,
  /** array of the word's letters, sorted  */ ltrs:      TY.AtoZlo[],
  /** the first letter in the word         */ beg:       TY.AtoZlo,
  /** the last letter in the word          */ end:       TY.AtoZlo,
  /** wordbits of word's unique letters    */ wordbits:  TY.WordbitsT,
  /** wordbits of letters absent from word */ missbits:  TY.WordbitsT,
  /** wordbit mask of the initial letter   */ begbit:    TY.WordbitsT,
  /** wordbit mask of the final letter     */ endbit:    TY.WordbitsT,
  /** uniq letters, sorted and joined      */ uniqarr:   TY.AtoZlo[],
  /** duplicated letters, in alphabetic order; the first occurrence goes in uniqstr,
   * all remaining occurrences go in dupearr. `uniqstr.length + dupearr.length === word.length`
   * @example for 'minimises', uniqstr: 'eimns', dupestr: 'iims'
   * @example for 'mines',     uniqstr: 'eimns', dupestr: ''
   *                                       */ dupearr:   TY.AtoZlo[],
}

/** @returns {DigestedWord} a summary of the wordbits encoding for a word
 * @see {DigestedWord}
 */
export function digestWord(word: TY.Word): DigestedWord {
  let wordbits   = 0
  let dupearr    = [] as TY.AtoZlo[]
  let uniqarr    = [] as TY.AtoZlo[]
  const ltrs = word.split('') as TY.AtoZlo[]
  const beg = ltrs[0] as TY.AtoZlo
  const end = ltrs[ltrs.length - 1] as TY.AtoZlo
  ltrs.sort()
  for (const ltr of ltrs) {
    const ltrmask = WordbitsTables.ltrToWordbitsTable[ltr]
    if (wordbits & ltrmask) { dupearr.push(ltr); continue }
    uniqarr.push(ltr)
    wordbits |= ltrmask
  }
  const missbits  = (~wordbits & BITS_SMALLEST_26)
  const begbit   = WordbitsTables.ltrToWordbitsTable[beg]
  const endbit   = WordbitsTables.ltrToWordbitsTable[end]
  // const headbits  = wordbits &            ~endbits & BITS_SMALLEST_12
  // const tailbits  = wordbits & ~begbits            & BITS_SMALLEST_12
  // const midbits   = headbits & ~begbits            & BITS_SMALLEST_12
  return { word, ltrs, uniqarr, dupearr, beg, end, wordbits, missbits, begbit, endbit }
}

// export function wayDigestGameword(word: TY.Word, gamebitsTable: TY.GamebitsTable): WayDigestedWord {
//   const gameltrs = _.keys(gamebitsTable) as readonly TY.Letter[]
//   const digested = digestGameword(word, gamebitsTable)
//   const { uniqarr, dupearr, gamebits, missbits, midbits, headbits, tailbits } = digested
//   return {
//     ...digested, // uniqstr: uniqarr.join(''),
//     uniqstr:  ltrsForGamebits(gamebits, gameltrs).join(''),
//     dupestr:  dupearr.join(''),
//     missstr:  ltrsForGamebits(missbits, gameltrs).join(''),
//     headstr:  ltrsForGamebits(headbits, gameltrs).join(''),
//     midstr:   ltrsForGamebits(midbits,  gameltrs).join(''),
//     tailstr:  ltrsForGamebits(tailbits, gameltrs).join(''),
//   }
// }