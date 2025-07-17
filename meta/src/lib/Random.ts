import      _ from 'lodash'
import      { prng_alea as SeededRNGFactory, type AleaPRNGenerator as PRNGenerator } from 'esm-seedrandom'
import { throwable }                     from './Outcome.ts'
import * as Consts                       from '../UtilityConsts.ts'
import { MAX_UINT32 } from '../UtilityConsts.ts'

export type      RNGSeed = string
export type      RNGSpecQ = RNGSeed | RNGFunction
export type      RNGSpec   = RNGSeed | RNGFunction | undefined
export type      RNGFunction = () => number
export interface HiLo       { lo?: number | undefined, hi?: number | undefined }
export interface HiLoCt extends HiLo { count: number }
// /** RNGOpts; you are trusted to specify either `seed` or `rng`, not both */
// export interface RNGOpts    { using?: RNGSpec }
// /** specify a range `lo <= x < hi` and the RNG to generate them */
// export interface HiLoRNG   extends HiLo, RNGOpts { }
// /** specify a range `lo <= x < hi`, the RNG to generate them, and the number of values to generate */
// export interface HiLoCtRNG extends HiLoCt, RNGOpts { }
/** The possible reasons for a throwable error */
export type      RNGGist = 'badSeed' | 'badRNG'

const CHAR_a = 'a'.charCodeAt(0)
const CHAR_z = 'z'.charCodeAt(0)
const CHAR_A = 'A'.charCodeAt(0)
const CHAR_Z = 'Z'.charCodeAt(0)
const CHAR_0 = '0'.charCodeAt(0)
const CHAR_9 = '9'.charCodeAt(0)

export class RandomFactory {
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

  // == [One-shot methods]
  /** Random float, `0 <= x < 1` */
  rand01() {  return this.rng()  }
  /** Random float, `lo <= x < hi` */
  rand({ lo = 0, hi = 1 }: HiLo = {}) { return lo + (this.rng() * (hi - lo)) }
  /** Random integer, `lo <= x < hi` */
  randInt(opts: HiLo = {}) { return Math.floor(this.rand(opts)) }
  /** Random integer, `0 <= x < 2^32`. On some factories this is more efficient than `randInt({ hi: MAX_UINT32 })`. */
  randUint32() { return this.randInt({ lo: 0, hi: MAX_UINT32 }) }
  /** Random boolean */
  randBool() { return (this.rand01() < 0.5) }
  /** Random character between `lo` and `hi` */
  randChar(lo: number, hi: number) { return String.fromCharCode(this.randInt({ lo, hi })) }
  /** Random lower-case letter */
  randLower() { return String.fromCharCode(this.randInt({ lo: CHAR_a, hi: CHAR_z })) }
  /** Random upper-case letter */
  randUpper() { return String.fromCharCode(this.randInt({ lo: 65, hi: 91 })) }
  /** Random letter */
  randLetter() { return String.fromCharCode(this.randInt({ lo: 65, hi: 91 })) }
  /** Random numeral */

  /** Random float, `0 <= x < 1`. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static rand01(rngspec?: RNGSpec) { return this.rngFor(rngspec)() }
  /** Random float, `lo <= x < hi`. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static rand({ lo = 0, hi = 1 }: HiLo = {}, rngspec?: RNGSpec) { return lo + ((hi - lo) * this.rand01(rngspec)) }
  /** Random integer, `lo <= x < hi`. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static randInt(opts: HiLo = {}, rngspec?: RNGSpec) { return Math.floor(this.rand(opts, rngspec)) }
  /** Random integer, `0 <= x < 2^32`. @note: this makes a new factory for each call. But if you're making enough numbers to matter, you should choose one of the subclasses anduse the stream methods. */
  static randUint32(rngspec?: RNGSpec) { return Math.floor(this.rand01(rngspec) * MAX_UINT32) }
  // --

  // == [Fundamental Stream methods] -- these do the work, other stuff is sugar

  /** Stream of `count` random numbers, `0 <= x < 1` */
  * starRand01s(count: number): Generator<number, undefined, number | undefined> {
    for (let seq = 0; seq < count; seq++) {
      yield this.rng()
    }
  }
  /** Stream of `count` random numbers, `lo <= x < hi` */
  * starRands(opts: HiLoCt): Generator<number, undefined, number | undefined> {
    const { lo = 0, hi = 1, count } = opts
    if (lo === 0 && hi === 1) { yield * this.starRand01s(count); return }
    const range = hi - lo
    for (const num01 of this.starRand01s(count)) {
      yield lo + (num01 * range)
    }
  }
  /** Stream of `count` random integers, `lo <= x < hi` */
  * starRandInts(opts: HiLoCt): Generator<number, undefined, number | undefined> {
    for (const num01 of this.starRands(opts)) {
      yield Math.floor(num01)
    }
  }
  /** Stream of `count` random integers, `0 <= x < 2^32` */
  * starRandUint32s(count: number): Generator<number, undefined, number | undefined> {
    yield * this.starRandInts({ lo: 0, hi: MAX_UINT32, count })
  }
  /** Stream of `count` random numbers with **32 bits of randomness**, `0 <= x < 1`.
   * (Some subclasses can be more efficient if only 32 bits of randomness are needed.
   */
  * starFloat32s01(count: number): Generator<number, undefined, number | undefined> {
    yield * this.starRand01s(count)
  }
  /** Stream of `count` random numbers with **32 bits of randomness**, `lo <= x < hi`.
   * (Some subclasses can be more efficient if only 32 bits of randomness are needed.
   */
  * starFloat32s(opts: HiLoCt): Generator<number, undefined, number | undefined> {
    const { lo = 0, hi = 1, count } = opts
    if (lo === 0 && hi === 1) { yield * this.starFloat32s01(count); return }
    const range = hi - lo
    for (const num01 of this.starFloat32s01(count)) { yield lo + (num01 * range) }
  }
  // --

  // == [Array methods]
  /** Array of `count` random numbers, `0 <= x < 1` */
  rand01s(count: number) { return [...this.starRand01s(count)] }
  /** Array of `count` random numbers, `lo <= x < hi` */
  rands(opts: HiLoCt) { return [...this.starRands(opts)] }
  /** Array of `count` random integers, `lo <= x < hi` */
  randInts(opts: HiLoCt) { return [...this.starRandInts(opts)] }
  /** Array of `count` random integers, `0 <= x < 2^32` */
  randUint32s(count: number) { return [...this.starRandUint32s(count)] }
  // --

  // == [Typed Array methods]

  /** Uint32Array of `count` random integers, `0 <= x < 2^32` */
  randUint32Array(count: number): Uint32Array {
    const array = new Uint32Array(count)
    let index = 0
    for (const value of this.starRandUint32s(count)) { array[index++] = value }
    return array
  }
  /** Float32Array of `count` random numbers, `0 <= x < 1` */
  randFloat32Array01(count: number): Float32Array {
    const array = new Float32Array(count)
    let index = 0
    for (const value of this.starFloat32s01(count)) { array[index++] = value }
    return array
  }
  /** Float32Array of `count` random numbers, `0 <= x < 1` */
  randFloat32Array(opts: HiLoCt): Float32Array {
    const { lo = 0, hi = 1, count } = opts
    if (lo === 0 && hi === 1) { return this.randFloat32Array01(count) }
    const array = new Float32Array(count)
    let index = 0
    for (const value of this.starFloat32s({ lo, hi, count })) { array[index++] = value }
    return array
  }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `0 <= x < 1`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  randFloat64Array01(count: number): Float64Array {
    const array = new Float64Array(count)
    let index = 0
    for (const value of this.starRand01s(count)) { array[index++] = value }
    return array
  }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `0 <= x < 1`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  randFloat64Array(opts: HiLoCt): Float64Array {
    const { lo = 0, hi = 1, count } = opts
    if (lo === 0 && hi === 1) { return this.randFloat64Array01(count) }
    const array = new Float64Array(count)
    let index = 0
    for (const value of this.starRands(opts)) { array[index++] = value }
    return array
  }
  // --

  // == [static methods for rand01s] -- stream of `count` numbers, `0 <= x < 1`]

  /** Stream of `count` random numbers, `0 <= x < 1` */
  static * starRand01s(opts:      HiLoCt, rngspec?: RNGSpec)      { const factory = this.make(rngspec); yield * factory.starRand01s(opts.count) }
  /** Array of `count` random numbers, `0 <= x < 1` */
  static rand01s(opts:            HiLoCt, rngspec?: RNGSpec)            { const factory = this.make(rngspec); return factory.rand01s(opts.count) }
  /** Float32Array of `count` random numbers, `0 <= x < 1` */
  static randFloat32Array01(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat32Array01(opts.count) }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `0 <= x < 1`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  static randFloat64Array01(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat64Array01(opts.count) }
  // --

  // == [static methods for rands] -- stream of `count` numbers, `lo <= x < hi`]

  /** Stream of `count` random numbers, `lo <= x < hi` */
  static * starRands(opts:      HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); yield * factory.starRands(opts) }
  /** Array of `count` random numbers, `lo <= x < hi` */
  static rands(opts:            HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.rands(opts) }
  /** Float32Array of `count` random numbers, `lo <= x < hi` */
  static randFloat32Array(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat32Array(opts) }
  /** Float64Array of `count` random numbers with 56 bits of randomness, `lo <= x < hi`. **NOTE: that's 56 bits of randomness, not 64 bits**. */
  static randFloat64Array(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randFloat64Array(opts) }
  // --

  // == [static methods for randInts] -- stream of `count` integers, `lo <= x < hi`]

  /** Stream of `count` random integers, `lo <= x < hi` */
  static * starRandInts(opts: HiLoCt, rngspec?: RNGSpec) { const factory = this.make(rngspec); yield * factory.starRandInts(opts) }
  /** Array of `count` random integers, `lo <= x < hi` */
  static randInts(opts: HiLoCt,      rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randInts(opts) }
  // --

  // == [static methods for randUint32s] -- stream of `count` integers, `0 <= x < 2^32`]
  /** Stream of `count` random integers, `0 <= x < 2^32` */
  static * starRandUint32s(count: number, rngspec?: RNGSpec) { const factory = this.make(rngspec); yield * factory.starRandUint32s(count) }
  /** Array of `count` random integers, `0 <= x < 2^32` */
  static randUint32s(count: number,       rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randUint32s(count) }
  /** Uint32Array of `count` random integers, `0 <= x < 2^32` */
  static randUint32Array(count: number,   rngspec?: RNGSpec) { const factory = this.make(rngspec); return factory.randUint32Array(count) }
  // --

  // == [Random Selection methods] --

  * starRandomIndices(items: readonly any[], opts: { count: number }): Generator<number, undefined, number | undefined> {
    const { count } = opts
    yield * this.starRandInts({ lo: 0, hi: items.length, count })
  }
  * starRandomChoices<VT>(items: readonly VT[], opts: { count: number }): Generator<VT, undefined, VT | undefined> {
    for (const index of this.starRandomIndices(items, opts)) {
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
    for (const index of this.starRandomIndices(items, { count: Infinity })) {
      if (seen.has(index)) { continue }
      seen.add(index)
      result.push(items[index]!)
      if (result.length >= count) { break }
    }
    return result
  }


  * starTuples<VT>(items: readonly VT[], opts: { count: number, itemLen: number}) {
    const { count, itemLen } = opts
    const generator = this.starRandInts({ lo: 0, hi: items.length, count: count * itemLen })
    for (let seq = 0; seq < count; seq++) {
      const tuple = [] as VT[]
      for (let pos = 0; pos < itemLen; pos++) {
        tuple.push(items[generator.next().value!]!)
      }
      yield tuple
    }
  }
  * starSequences<VT>(items: readonly VT[], opts: { count: number, lo?: number | undefined, hi: number }) {
    const { count, lo = 1, hi } = opts
    const generator = this.starRandInts({ lo: 0, hi: items.length, count: Infinity })
    for (let seq = 0; seq < count; seq++) {
      const tuple = [] as VT[]
      const itemLen = generator.next().value!
      for (let pos = 0; pos < itemLen; pos++) {
        tuple.push(items[generator.next().value!]!)
      }
      yield tuple
    }
  }
  // --

  // == [Accessories for randStrings] -- string built of `count` independently chosen entries from `dictionary`]

  * starRandStrs(substrings: readonly string[] = Consts.CharsAZ09Bar, opts: { count: number, itemLen: number}) {
    for (const segs of this.starTuples(substrings, opts)) {
      yield segs.join('')
    }
  }
  * starRandLenStrs(substrings: readonly string[] = Consts.CharsAZ09Bar, opts: { count: number, lo?: number | undefined, hi: number }) {

  }
  // --
}

interface SeededRNGDNA { seed: string }

export class SeededRandomFactory extends RandomFactory {
  declare readonly rng: PRNGenerator
  constructor(seed: string) {
    const rng = SeededRNGFactory(seed)
    super(rng.double)
    Object.defineProperty(this, 'rng', { value: rng, configurable: true, enumerable: false })
  }
  static override   make(seed: string) { return new this(seed) }
  static override rngFor(seed: string) { return SeededRNGFactory(seed).double }

  /** Random float, `0 <= x < 1`. @note: this makes a new factory for each call */
  static override rand01(opts: SeededRNGDNA) { return this.rngFor(opts)() }
  /** Random float, `lo <= x < hi`. @note: this makes a new factory for each call */
  static override rand(opts: SeededRNGDNA, lo: number, hi: number) { return lo + ((hi - lo) * this.rand01(opts)) }
  /** Random integer, `lo <= x < hi`. @note: this makes a new factory for each call */
  static override randInt(opts: SeededRNGDNA, lo: number, hi: number) { return this.rngFor(opts)(lo, hi) }
  /** Random integer, `0 <= x < 2^32`. @note: this makes a new factory for each call */
  static override randUint32(opts: SeededRNGDNA) { const factory = this.make(opts); return factory.randUint32() }

  override * starFloat32s01(count: number): Generator<number, undefined, number | undefined> {
    for (let index = 0; index < count; index++) {
      yield this.rng.quick()
    }
  }
  * starFloat64s(opts: HiLoCt): Generator<number, void, unknown> {
    const { lo = 0, hi = 1, count } = opts
    if (lo === 0 && hi === 1) { yield * this.starFloat32s(count); return }
    const range = hi - lo
    for (const num01 of this.starQuickRand01s(count)) {
      yield lo + (num01 * range)
    }
  }
  override * starRandUint32s(count: number): Generator<number, void, unknown> {
    for (let index = 0; index < count; index++) {
      yield this.rng.int32()
    }
  }
}