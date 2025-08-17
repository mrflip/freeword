import      _ from 'lodash'
import      { prng_alea as SeededRNGFactory, type AleaPRNGenerator as PRNGenerator } from 'esm-seedrandom'
import { throwable }                     from '../utils/OutcomeUtils.ts'
import * as Consts                       from '../UtilityConsts.ts'
import { MAX_UINT32 } from '../UtilityConsts.ts'

export type      RNGSeed = string
export type      RNGSpecQ = RNGSeed | RNGFunction
export type      RNGSpec   = RNGSeed | RNGFunction | undefined
export type      RNGFunction = () => number
export interface HiLo       { lo?: number | undefined, hi?: number | undefined }
export interface CharHiLo   { lo?: string | undefined, hi?: string | undefined }
export interface HiLoCt     extends HiLo     { count: number }
export interface CharHiLoCt extends CharHiLo { count: number }
export interface HiLoSeed   extends HiLo     { seed: RNGSeed }
export interface HiLoCtSeed extends HiLoCt   { seed: RNGSeed }
// /** RNGOpts; you are trusted to specify either `seed` or `rng`, not both */
// export interface RNGOpts    { using?: RNGSpec }
// /** specify a range `lo <= x < hi` and the RNG to generate them */
// export interface HiLoRNG   extends HiLo, RNGOpts { }
// /** specify a range `lo <= x < hi`, the RNG to generate them, and the number of values to generate */
// export interface HiLoCtRNG extends HiLoCt, RNGOpts { }
/** The possible reasons for a throwable error */
export type      RNGGist = 'badSeed' | 'badRNG'

export type CharCode = number
export const CHARCODE_0 = '0'.charCodeAt(0) // = 48
export const CHARCODE_9 = '9'.charCodeAt(0) // = 57
export const CHARCODE_A = 'A'.charCodeAt(0) // = 65
export const CHARCODE_Z = 'Z'.charCodeAt(0) // = 90
export const CHARCODE_a = 'a'.charCodeAt(0) // = 97
export const CHARCODE_z = 'z'.charCodeAt(0) // = 122

const CharCodeA52m1     = 52 + CHARCODE_A - 1 // 26 upper and 26 lower
const CharCodeA62m1     = 62 + CHARCODE_A - 1 // 26 upper,  26 lower, and 10 digits
// we baseline on 'A': 65-90 -> A-Z, 91-117 -> 97-122 (a-z), 117-126 -> 48-57 (0-9)
const CharOffsetA52toa  =  1 + CHARCODE_Z - CHARCODE_a // if we are at 'Z+1',  we want to be at 'a': Z+1-(Z+1-a) -> a
const CharOffsetA62to0  = 27 + CHARCODE_Z - CHARCODE_0 // if we are at 'Z+27', we want to be at '0': Z+27-(Z+27-0) -> 0

const SINT32_TO_UINT32 = 2 ** 31

export class BaseRandomFactory {
  declare readonly rng: RNGFunction

  // == [Construction]
  constructor(rng: RNGFunction) {
    Object.defineProperty(this, 'rng', { value: rng, configurable: true, enumerable: false })
  }
  static make<CT extends { new (rng: RNGFunction): RandomFactory, rngFor(rng?: RNGSpec): RNGFunction }>(this: CT, rngspec?: RNGSpec | undefined) {
    return new this(this.rngFor(rngspec))
  }
  static rngFor(rngspec: RNGSpec = Math.random): RNGFunction {
    if (typeof rngspec === 'function') { return rngspec }
    if (rngspec && (typeof rngspec === 'string')) {
      return this._seededRNG(rngspec)
    }
    throw throwable('RNG must be a non-blank string, a function, or undefined', 'badRNG', { given: rngspec })
  }
  protected static _seededRNG(seed: string): RNGFunction {
    return SeededRNGFactory(seed).double
  }
  // --

  // == [One-shot numeric methods]
  /** Random float, `0 <= x < 1` */
  rand01() {  return this.rng()  }
  /** Random float, `lo <= x < hi` */
  rand({ lo = 0, hi:hiIn = lo + 1 }: HiLo = {}) {
    const range = _.max([lo, hiIn])! - lo
    return lo + (this.rng() * range)
  }
  /** Random integer, `lo <= x <= hi` */
  int(opts: HiLo = {}) {
    const { lo = 0, hi = lo + 9 } = opts
    return Math.floor(this.rand({ lo, hi: hi + 1 }))
  }
  /** Random integer, `0 <= x <= 2^32 - 1`. On some factories this is more efficient than `int({ hi: MAX_UINT32 })`. */
  uint32() {
    return Math.floor(this.rand01() * MAX_UINT32)
  }
  /** Random integer, `0 <= x <= 2^32 - 1`. On some factories this is more efficient than `int({ hi: MAX_UINT32 })`. */
  sint32() {
    return this.uint32() - SINT32_TO_UINT32
  }
  /** Random boolean */
  bool() { return (this.rand01() < 0.5) }
  // --

  // == [One-shot character methods]

  /** Random character `loCharCode <= x < hiCharCode` */
  char({ lo = CHARCODE_a, hi = CHARCODE_z }: HiLo = {}) {
    return String.fromCharCode(this.int({ lo, hi }))
  }
  /** Random character `loChar <= x < hiChar` */
  charBetween({ lo:loChar = 'a', hi:hiChar = 'z' }: CharHiLo = {}) {
    const lo = loChar.charCodeAt(0)
    const hi = hiChar.charCodeAt(0)
    return this.char({ lo, hi })
  }
  /** Random lower-case letter `'a'…'z'` */
  lower() { return this.charBetween({ lo: 'a', hi: 'z' }) }
  /** Random upper-case letter `'A'…'Z'` */
  upper() { return this.charBetween({ lo: 'A', hi: 'Z' }) }
  /** Random letter `'A'…'Z'` */
  azAZ() {
    const charCode = this.int({ lo: CHARCODE_A, hi: CharCodeA52m1 })
    if (charCode <= CHARCODE_Z)  { return String.fromCharCode(charCode) }
    return String.fromCharCode(charCode - CharOffsetA52toa)
  }
  /** Random character `'0'..'9'…'A'..'Z'…'a'…'z'` */
  azAZ09() {
    const charCode = this.int({ lo: CHARCODE_A, hi: CharCodeA62m1 })
    if (charCode <= CHARCODE_Z)  { return String.fromCharCode(charCode) }
    if (charCode <= CharCodeA52m1) { return String.fromCharCode(charCode - CharOffsetA52toa) }
    return String.fromCharCode(charCode - CharOffsetA62to0)
  }
  /** Random numeral `'0'…'9'` */
  numeral() { return this.charBetween({ lo: '0', hi: '9' }) }
  // --

  // == [Streming character methods]

  /** Stream of `count` random characters, `lo <= x <= hi` */
  * charsStar(opts: HiLoCt) {
    for (const charCode of this.intsStar(opts)) {
      yield String.fromCharCode(charCode)
    }
  }
  /** Stream of `count` random characters, `lo <= char <= hi` */
  * charsBetweenStar({ lo = 'a', hi = 'z', ...opts }: CharHiLoCt) {
    const loCharCode = lo.charCodeAt(0)
    const hiCharCode = hi.charCodeAt(0)
    for (const charCode of this.intsStar({  ...opts, lo: loCharCode, hi: hiCharCode })) {
      yield String.fromCharCode(charCode)
    }
  }

  * lowersStar(count: number) { yield * this.charsStar({ lo: CHARCODE_a, hi: CHARCODE_z, count }) }
  * uppersStar(count: number) { yield * this.charsStar({ lo: CHARCODE_A, hi: CHARCODE_Z, count }) }
  * numeralsStar(count: number)   { yield * this.charsStar({ lo: CHARCODE_0, hi: CHARCODE_9, count }) }
  * azAZStar(count: number)    {
    for (const charCode of this.intsStar({ lo: CHARCODE_A, hi: CharCodeA52m1, count })) {
      if (charCode <= CHARCODE_Z) { yield String.fromCharCode(charCode); continue }
      yield String.fromCharCode(charCode - CharOffsetA52toa)
    }
  }
  * azAZ09Star(count: number)    {
    for (const charCode of this.intsStar({ lo: CHARCODE_A, hi: CharCodeA62m1, count })) {
      if (charCode <= CHARCODE_Z)    { yield String.fromCharCode(charCode); continue }
      if (charCode <= CharCodeA52m1) { yield String.fromCharCode(charCode - CharOffsetA52toa); continue }
      yield String.fromCharCode(charCode - CharOffsetA62to0)
    }
  }
  // --

  /** Random float, `0 <= x < 1`. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static rand01(rngspec: RNGSpec = Math.random) {
    return this.rngFor(rngspec)()
  }
  /** Random float, `lo <= x < hi`. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static rand(opts: HiLo = {}, rngspec: RNGSpec = Math.random) {
    const { lo = 0, hi:hiIn = lo + 1 } = opts
    const hi = _.max([lo, hiIn])!
    return lo + ((hi - lo) * this.rand01(rngspec))
  }
  /** Random integer, `lo <= x <= hi`. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static int(opts: HiLo = {}, rngspec: RNGSpec = Math.random) {
    const { lo = 0, hi = lo + 9 } = opts
    return Math.floor(this.rand({ ...opts, lo, hi: hi + 1 }, rngspec))
  }

  /** Random integer, `0 <= x <= 2^32 - 1`. Some subclasses can do this more efficiently. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static uint32(rngspec: RNGSpec = Math.random) { return Math.floor(this.rand01(rngspec) * MAX_UINT32) }
  /** Random integer, `-2^31 <= x <= 2^31 - 1`. Some subclasses can do this more efficiently. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static sint32(rngspec: RNGSpec = Math.random) { return Math.floor(this.rand01(rngspec) * SINT32_TO_UINT32) }
  /** Random float, `lo <= x < hi`, with only 32 bits of randomness guaranteed.  Some subclasses can do this more efficiently.@note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static loose01(rngspec:    RNGSpec = Math.random) { return this.rand01(rngspec) }
  // --

  // == [Fundamental Stream methods] -- these do the work, other stuff is sugar

  /** Stream of `count` random numbers, `0 <= x < 1` */
  * rand01sStar(count: number): Generator<number, undefined, number | undefined> {
    for (let seq = 0; seq < count; seq++) {
      yield this.rng()
    }
  }
  /** Stream of `count` random numbers, `lo <= x < hi` (0 and lo + 1 by default) */
  * randsStar(opts: HiLoCt): Generator<number, undefined, number | undefined> {
    const { lo = 0, hi:hiIn = lo + 1, count } = opts
    const hi = _.max([lo, hiIn])!
    if (hi === 1) { // don't have to multiply if hi is 1
      if (lo === 0) { yield * this.rand01sStar(count); return } // don't have to multiply or add
      for (const num01 of this.rand01sStar(count)) { yield lo + num01 }; return
    }
    if (lo === 0) { // don't have to add if lo is 0
      for (const num01 of this.rand01sStar(count)) { yield num01 * hi }; return
    }
    const range = hi - lo
    for (const num01 of this.rand01sStar(count)) {
      yield lo + (num01 * range)
    }
  }
  /** Stream of `count` random integers, `lo <= x <= hi` -- (by default, `lo = 0` and `hi = lo + 9`) */
  * intsStar(opts: HiLoCt): Generator<number, undefined, number | undefined> {
    const { lo = 0, hi = lo + 9, count } = opts
    for (const float of this.randsStar({ lo, hi: hi + 1, count })) {
      yield Math.floor(float)
    }
  }
  /** Stream of `count` random integers, `0 <= x <= 2^32 - 1`. (Some subclasses can be more efficient at this than `IntsStar`.) */
  * uint32sStar(count: number): Generator<number, undefined, number | undefined> {
    for (const float of this.rand01sStar(count)) {
      yield Math.floor(float * MAX_UINT32)
    }
  }
  /** Stream of `count` random integers, `0 <= x <= 2^32 - 1`. (Some subclasses can be more efficient at this than `IntsStar`.) */
  * sint32sStar(count: number): Generator<number, undefined, number | undefined> {
    for (const uint of this.uint32sStar(count)) {
      yield uint - SINT32_TO_UINT32
    }
  }
  /** Stream of `count` random numbers with **32 bits of randomness**, `0 <= x < 1`. (Some subclasses can be more efficient if only 32 bits of randomness are needed.)
   */
  * loose01sStar(count: number): Generator<number, undefined, number | undefined> {
    yield * this.rand01sStar(count)
  }
  /** Stream of `count` random numbers with **32 bits of randomness**, `lo <= x < hi`. (Some subclasses can be more efficient if only 32 bits of randomness are needed.)
   * (Some subclasses can be more efficient if only 32 bits of randomness are needed.
   */
  * loosesStar(opts: HiLoCt): Generator<number, undefined, number | undefined> {
    const { lo = 0, hi = lo + 1, count } = opts
    if (lo === 0 && hi === 1) { yield * this.loose01sStar(count); return }
    const range = hi - lo
    for (const num01 of this.loose01sStar(count)) { yield lo + (num01 * range) }
  }
  // --

  // == [Array methods]
  /** Array of `count` random numbers, `0 <= x < 1` */
  rand01s(count: number) { return [...this.rand01sStar(count)] }
  /** Array of `count` random numbers, `lo <= x < hi` */
  rands(opts: HiLoCt) { return [...this.randsStar(opts)] }
  /** Array of `count` random integers, `lo <= x <= hi` */
  randInts(opts: HiLoCt) { return [...this.intsStar(opts)] }
  /** Array of `count` random integers, `0 <= x <= 2^32 - 1` */
  randUint32s(count: number) { return [...this.uint32sStar(count)] }
  // --

  // == [Typed Array methods]

  /** Uint32Array of `count` random integers, `0 <= x < 2^32 - 1` */
  randUint32Array(count: number): Uint32Array {
    const array = new Uint32Array(count)
    let index = 0
    for (const value of this.uint32sStar(count)) { array[index++] = value }
    return array
  }
  /** Float32Array of `count` random numbers, `0 <= x < 1` */
  randFloat32Array01(count: number): Float32Array {
    const array = new Float32Array(count)
    let index = 0
    for (const value of this.loose01sStar(count)) { array[index++] = value }
    return array
  }
  /** Float32Array of `count` random numbers, `0 <= x < 1` */
  randFloat32Array(opts: HiLoCt): Float32Array {
    const array = new Float32Array(opts.count)
    let index = 0
    for (const value of this.loosesStar(opts)) { array[index++] = value }
    return array
  }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `0 <= x < 1`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  randFloat64Array01(count: number): Float64Array {
    const array = new Float64Array(count)
    let index = 0
    for (const value of this.rand01sStar(count)) { array[index++] = value }
    return array
  }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `0 <= x < 1`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  randFloat64Array(opts: HiLoCt): Float64Array {
    const array = new Float64Array(opts.count)
    let index = 0
    for (const value of this.randsStar(opts)) { array[index++] = value }
    return array
  }
  // --

  // == [static methods for rand01s] -- stream of `count` numbers, `0 <= x < 1`]

  /** Stream of `count` random numbers, `0 <= x < 1` */
  static * rand01sStar(count: number, rngspec?: RNGSpec): Generator<number, undefined, number | undefined> {
    if (! _.isNumber(count)) { throw throwable('count must be a number', 'absentVal', count) }
    if (count < 0) { return }
    const factory = this.make(rngspec)
    yield * factory.rand01sStar(count)
  }
  /** Array of `count` random numbers, `0 <= x < 1` */
  static rand01s(count:       number, rngspec?: RNGSpec) { return [...this.rand01sStar(count, rngspec)] }
  /** Float32Array of `count` random numbers, `0 <= x < 1` */
  static randFloat32Array01(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat32Array01(opts.count) }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `0 <= x < 1`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  static randFloat64Array01(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat64Array01(opts.count) }
  // --

  // == [static methods for rands] -- stream of `count` numbers, `lo <= x < hi`]

  /** Stream of `count` random numbers, `lo <= x < hi` */
  static * randsStar(opts:      HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); yield * factory.randsStar(opts) }
  /** Array of `count` random numbers, `lo <= x < hi` */
  static rands(opts:            HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.rands(opts) }
  /** Float32Array of `count` random numbers, `lo <= x < hi` */
  static randFloat32Array(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat32Array(opts) }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `lo <= x < hi`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  static randFloat64Array(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat64Array(opts) }
  // --

  // == [static methods for randInts] -- stream of `count` integers, `lo <= x <= hi`]

  /** Stream of `count` random integers, `lo <= x <= hi` */
  static * intsStar(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); yield * factory.intsStar(opts) }
  /** Array of `count` random integers, `lo <= x <= hi` */
  static randInts(opts: HiLoCt,      rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randInts(opts) }
  // --

  // == [static methods for randUint32s] -- stream of `count` integers, `0 <= x < 2^32 - 1`]
  /** Stream of `count` random integers, `0 <= x <= 2^32 - 1` */
  static * uint32sStar(count: number, rngspec?: RNGSpec) { const factory = this.make(rngspec); yield * factory.uint32sStar(count) }
  /** Array of `count` random integers, `0 <= x <= 2^32 - 1` */
  static randUint32s(count: number,       rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randUint32s(count) }
  /** Uint32Array of `count` random integers, `0 <= x < 2^32 - 1` */
  static randUint32Array(count: number,   rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randUint32Array(count) }
  // --

  // == [Random Selection methods] --

  * RandIndicesStar(items: readonly any[] | number, opts: { count: number }): Generator<number, undefined, number | undefined> {
    const { count } = opts
    const hi = (typeof items === 'number') ? items : items.length
    for (const float of this.rand01sStar(count)) {
      yield Math.floor(hi * float)
    }
  }
  * RandChoicesStar<VT>(items: readonly VT[], opts: { count: number }): Generator<VT, undefined, VT | undefined> {
    for (const index of this.RandIndicesStar(items, opts)) {
      yield items[index]!
    }
  }
  /** Naive sampling function storing the already picked values in a Set.
   * Performance of this function will decrease dramatically when `k` is a
   * high proportion of `n`.
   */
  naiveSample<VT>(items: readonly VT[], opts: { count: number }): VT[] {
    const { count } = opts
    if (count >= items.length) { return Array.from(items) }
    const seen = new Set<number>()
    const result = [] as VT[]
    for (const index of this.RandIndicesStar(items, { count: Infinity })) {
      if (seen.has(index)) { continue }
      seen.add(index)
      result.push(items[index]!)
      if (result.length >= count) { break }
    }
    return result
  }
  * TuplesStar<VT>(items: readonly VT[], opts: { count: number, itemLen: number}) {
    const { count, itemLen } = opts
    const generator = this.intsStar({ lo: 0, hi: items.length, count: count * itemLen })
    for (let seq = 0; seq < count; seq++) {
      const tuple = [] as VT[]
      for (let pos = 0; pos < itemLen; pos++) {
        tuple.push(items[generator.next().value!]!)
      }
      yield tuple
    }
  }
  /** Stream of `count` random sequences, each having `lo <= len <= hi` elements from `items`; by default, `lo = 1` and `hi = lo + 9`. Note: lo and hi are **inclusive**. */
  * SequencesStar<VT>(items: readonly VT[], opts: { count: number, lo?: number | undefined, hi: number }): Generator<VT[], undefined, VT[] | undefined> {
    const tupleLens = this.intsStar({ ...opts, count: Infinity })
    const elements  = this.RandChoicesStar(items, { count: Infinity })
    const { count } = opts
    for (let seq = 0; seq < count; seq++) {
      const tuple  = [] as VT[]
      const len    = tupleLens.next().value!
      for (let pos = 0; pos < len; pos++) {
        tuple.push(elements.next().value!)
      }
      yield tuple
    }
  }
  // --

  // == [Accessories for randStrings] -- string built of `count` independently chosen entries from `dictionary`]

  * RandStrsStar(substrings: readonly string[] = Consts.CharsAZ09Bar, opts: { count: number, itemLen: number}) {
    for (const segs of this.TuplesStar(substrings, opts)) {
      yield segs.join('')
    }
  }
  * RandLenStrsStar(substrings: readonly string[] = Consts.CharsAZ09Bar, opts: { count: number, lo?: number | undefined, hi: number }) {
    for (const segs of this.SequencesStar(substrings, opts)) {
      yield segs.join('')
    }
  }
  // --
}

export class RandomFactory extends BaseRandomFactory {

}

export class SeededRandomFactory extends RandomFactory {
  declare readonly rng: PRNGenerator
  constructor(seed: RNGSeed) {
    const rng = SeededRNGFactory(seed)
    super(rng.double)
    Object.defineProperty(this, 'rng', { value: rng, configurable: true, enumerable: false })
  }
  static override   make(seed: RNGSeed)    { return new this(seed) }
  static override rngFor(seed: RNGSeed)    { return SeededRNGFactory(seed).double }

  /** Random float, `0 <= x < 1`. @note: this makes a new factory for each call */
  static override loose01(seed: RNGSeed)    { return SeededRNGFactory(seed).quick() }
  /** Random integer, `0 <= x <= 2^32 - 1`. @note: this makes a new factory for each call */
  static override uint32(seed: RNGSeed)     { return SeededRNGFactory(seed).int32() + SINT32_TO_UINT32  }
  /** Random integer, `0 <= x <= 2^32 - 1`. @note: this makes a new factory for each call */
  static override sint32(seed: RNGSeed)     { return SeededRNGFactory(seed).int32() }

  override * loose01sStar(count: number): Generator<number, undefined, number | undefined> {
    for (let index = 0; index < count; index++) {
      yield this.rng.quick()
    }
  }
  override * loosesStar(opts: HiLoCt): Generator<number, undefined, number | undefined> {
    const { lo = 0, hi = lo + 1, count } = opts
    if (lo === 0 && hi === 1) { yield * this.loose01sStar(count); return }
    const range = hi - lo
    for (const num01 of this.loose01sStar(count)) { yield lo + (num01 * range) }
  }
  override * uint32sStar(count: number): Generator<number, undefined, number | undefined> {
    for (let index = 0; index < count; index++) {
      yield this.rng.int32()
    }
  }
}
