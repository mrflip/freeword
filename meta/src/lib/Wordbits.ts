import      _                                /**/ from 'lodash'
import      * as UF                               from './UF.ts'
import type * as TY                               from '../types.ts'
import      * as WordbitsTables                   from './WordbitsTables.ts'
//

const BITS_SMALLEST_26 = 0b11_1111_1111_1111_1111_1111_1111
const BITS_SMALLEST_8  =         0b1111_1111
const BITS_SMALLEST_2  =                0b11
const WordbitsMask     = BITS_SMALLEST_26
// const BITS_SMALLEST_14 = 0b11_1111_1111_1111
// const BITS_SMALLEST_12 =    0b1111_1111_1111
// const BITS_SMALLEST_7  =          0b111_1111

/** Which letters in A are missing from B?            | `A - B`     | Wordbits | Difference           | `A & ~B & WordbitMask`     | */
export function subtract(aBits: TY.WordbitsT, bBits: TY.WordbitsT):          TY.WordbitsT {
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
  return ((aBits & bBits) === bBits) && aBits !== bBits
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

//  how this works; using Little-endian for sanity, we have:
//                           |              |              |              |
//  wb * x15 = 000000000000001000000000000001000000000000001000000000000001
//             0nmlkjihgfedcba0nmlkjihgfedcba0nmlkjihgfedcba0nmlkjihgfedcba  // multiplying by m15 puts a new copy every 15 bits
//  r2 & m15 = 000100010001000100010001000100010001000100010001000100010001  // this is 1/15 in the same way 1/9 = 0.11111...
//                l   h   d   0   k   g   c   n   j   f   b   m   i   e   a  // mask picks out each letter once
//               12   8   4  15  11   7   3  14  10   6   2  13   9   5   1  // the modulo 15 sums each nybble (4-bits) -- don't understand why yet but it's to do with it being remainder after division by 15
//   1/15 = 0.1000100010001000100010001000100010001000100010001000100010001
//      % 15   sums the nybbles
//
// Javascript does bitwise operations on 32-bit numbers,
// We can do it with a safe int if we only accept 7-bit words
//             00010001000100010001000100010001
///                gfedcbagfedcbagfedcbagfedcba
//             00010001000100010001000100010001
//                    d   g   c   f   b   e   a

// const MAGIC_NUMBER14x2  =     0x2000_4000_8001n
// const MAGIC_NUMBER14m2  = 0x0111_1111_1111_1111n
const MAGIC_NUMBER14r  = 0b1111n
//                                        45|                30|                15|                0|
//                                          |        15        |        15        |        15       |
const MAGIC_NUMBER14x =                0b0010_0000_0000_0000_0100_0000_0000_0000_1000_0000_0000_0001n
//                                      0x  2     0    0    0  4     0    0    0 8       0    0    1
//                0x    0____1____1____1____1____1____1____1____1____1____1____1____1____1____1____1
const MAGIC_NUMBER14m = 0b0001_0001_0001_0001_0001_0001_0001_0001_0001_0001_0001_0001_0001_0001_0001n
//                            |9        |        16         |         16        |         16        |

// 1. The multiply step repeats the bitfield four times, shifted by 2^15
//    (the fourteen, and an extra one each time).
//    That is, bit 0 will land at bits 3, 2, 1, 0 in their nybble.
// 2. The AND masks out all but the bottom bit in each nybble
// 3. The modulo 15 "sums" the nybbles
// We need to use a bigint to avoid overflow for over 8 bits
//
// * https://graphics.stanford.edu/%7Eseander/bithacks.html
//
export function countBits14Magic(wordbits: bigint | number): number {
  // mult by x, mask by m, read by r
  return Number((((BigInt(wordbits) * MAGIC_NUMBER14x) & MAGIC_NUMBER14m) % MAGIC_NUMBER14r))
}

//                              gfedcbAgfedcbAgfedcbAgfedcbA
const MAGIC_NUMBER13xo    = 0b000000001000000100000010000001
//                                 d   g   c   f   b   e   a
const MAGIC_NUMBER13mo    = 0b00010001000100010001000100010001
const MAGIC_NUMBER13ro    = 0b1111

/** count bits in a 7-bit number */
export function countBits7Magic(wordbitso: number): number {
  return (wordbitso * MAGIC_NUMBER13xo & MAGIC_NUMBER13mo) % MAGIC_NUMBER13ro
}

const MAGIC_NYBBLE_MASK = 0b00010001000100010001000100010001
//                          FEDCBAzyxwvutsrqponmlkjihgfedcba // mod 15 folds the nybbles into 4-bit numbers
//                             C___y___u___q___m___i___e___a
//                            D___z___v___r___n___j___f___b
//                           E___A___w___s___o___k___g___c
//                          F___B___x___t___p___l___h___d
/** count bits in a 32-bit number */
export function countBits32(wordbitso: number): number {
  const bits1 = (  wordbitso        & MAGIC_NYBBLE_MASK) // mod 15 folds the nybbles into 4-bit numbers
  const bits2 = ((wordbitso >>   1) & MAGIC_NYBBLE_MASK)
  const bits3 = ((wordbitso >>   2) & MAGIC_NYBBLE_MASK)
  const bits4 = ((wordbitso >>   3) & MAGIC_NYBBLE_MASK)
  // console.log(prettyBinaries([wordbitso, bits1, bits2, bits3, bits4]), (bits1 % 15), (bits2 % 15), (bits3 % 15), (bits4 % 15), (bits1 % 15) + (bits2 % 15) + (bits3 % 15) + (bits4% 15))
  return ((bits1 % 15) + (bits2 % 15) + (bits3 % 15) + (bits4 % 15) )
}

/** @returns the number of bits set in the bitfield */
export function countUniqLtrs(wordbits: TY.WordbitsT): number {
  return countBits32(wordbits)
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

/** ROT-13: trivially obscure/decode a string: a->n, b->o, ..., m->z, n->a, ..., z->m.
 * Installation is the reverse of removal.
 * @see {UF.rot13Word} */
export function rot13Wordbits(wordbits: TY.WordbitsT): TY.WordbitsT {
  return ((wordbits << 13)| (wordbits>> 13)) & WordbitsMask
}
/** ROT-n: trivially obscure/decode a string: a->n, b->o, ..., m->z, n->a, ..., z->m.
 * Installation is the reverse of removal.
 * @see {rotNWord} */
export function rotNWordbits(wordbits: TY.WordbitsT, by: number): TY.WordbitsT {
  // console.log(by, prettyBinaries([wordbits, (wordbits >> (26 - by)), ((wordbits << by) & WordbitsMask)], 28))
  return ((wordbits >> (26 - by)) | ((wordbits << by) & WordbitsMask)) & WordbitsMask
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
export function prettyBinary53(val: number, num = 53): string {
  return '0b' + (_.chunk(_.padStart(val.toString(2), 56, '0').slice(56 - num).split(''), 4).map((nibbles) => nibbles.join('')).join('_'))
}
export function prettyBinary32(val: number): string {
  return prettyBinary53(val, 32)
}
export function prettyBinaries(vals: (number | bigint)[], num?: number | undefined): string {
  return '\n' + vals.map((val) => prettyBinary53(Number(val), num)).join('\n')
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