import      _                                /**/ from 'lodash'
import      * as NodeUtil                         from 'node:util'
import type * as TY                               from '../types.ts'
// import      { nextTick }                       from 'node:process'
import      { AtoZlos }                           from '../lexicon/LexiconConsts.ts'
import      * as JSPrintf                         from 'sprintf-js'
//
export      *                                     from './BaseUtils.ts'
export type *                                     from '../types.ts'
export      *                                     from '../lib/Streaming.ts'
export      *                                     from '../lib/Random.ts'
export      *                                     from '../UtilityConsts.ts'
export      *                                     from '../lib/Rot13.ts'
export      { badOutcome, throwable }             from './OutcomeUtils.ts'
export      *                                     from './CollectionUtils.ts'
export      *                                     from './Logging.ts'
export      *                                     from './PromiseUtils.ts'

export const { sprintf, vsprintf } = JSPrintf

export type ObjKey        = string          | symbol
export type ClxnKey       = string | number | symbol
export type ReadonlyCollection<KT extends ClxnKey = string, VT = any> = Record<KT,         VT> | readonly VT[]
export type ObjKVFunc<RT,  VT = any, KT extends ClxnKey = string> = (value: VT, keyOrIndex: KT,          index: number, ...args: any) => RT
export type ArrKVFunc<RT,  VT = any>                              = (value: VT, keyOrIndex: number,      index: number, ...args: any) => RT
export type KVFunc<RT,     VT = any, KT = string | number>        = (value: VT, keyOrIndex: KT, index: number, ...args: any) => RT

/** @returns a bag with keys a, b, ... z and values of type VT */
export function alphabetLookupBag<VT>(seed: VT | ((ltr: TY.AtoZlo) => VT)): Record<TY.AtoZlo, VT> {
  if (_.isFunction(seed)) {
    return objectify(AtoZlos, (ltr) => seed(ltr))
  }
  return objectify(AtoZlos, () => (seed))
}

export interface PrettifyFieldOpts {
  /** per line for arrays    */ chunkSize?: number | undefined
  /** width per arr item     */ colwd?:     number | undefined
  /** primary key width      */ keywd?:     number | undefined
  /** prefix bag with key    */ key?:       string | undefined
  /** omit the brackets?     */ naked?:     boolean | undefined
  /** indent for arrays      */ indent?:    string | number | undefined,
}
export interface PrettifyOpts extends PrettifyFieldOpts {
  /** omit the brackets?        */ naked?:        boolean | undefined,
  /** always align array slots? */ chunkArrays?:  boolean | undefined,
  /** stringify tables?         */ stringify?:    boolean | undefined,
}

function indentPaddingFor(indent: string | number | undefined) {
  if (! indent) { return '' }
  if (_.isString(indent)) { return indent }
  return _.repeat(' ', indent)
}

/**
 * Pretty-print an array of strings in chunks
 *
 * @param   arr - The array to pretty-print
 * @param   opts - The options for pretty-printing
 * @returns       The pretty-printed array
 */
export function prettifyStrings(arr: readonly string[], { chunkSize = 20, colwd = 12, key, indent = 2, naked = false }: PrettifyOpts = {}) {
  const indentPadding = indentPaddingFor(indent)
  const lines = _.chunk(arr, chunkSize).map((chunk) => chunk.map((val) => _.padEnd(val + ',', colwd)).join(' '))
  const body = lines.join('\n' + indentPadding)
  const bracketed = naked ? body : '[\n    ' + body + '\n]'
  return (key ? kfy(key) : '') + bracketed
}
/**
 * Pretty-print an array of strings in chunks
 *
 * @param   arr - The array to pretty-print
 * @param   opts - The options for pretty-printing
 * @returns       The pretty-printed array
 */
export function prettifyInChunks(arr: readonly any[], { chunkSize = 20, colwd = 12, key, indent = 2, stringify = true }: PrettifyOpts = {}) {
  const stringified = stringify ? _.map(arr, (val) => inspectify(val)) : arr
  return prettifyStrings(stringified, { chunkSize, colwd, key, indent })
}
export function prettifyArray(arr: readonly any[], opts: PrettifyOpts = {}) {
  const inspected = inspectify(arr)
  if ((inspected.length < 180) && (! opts.chunkArrays)) { return opts.naked ? inspected.slice(1, -1).trim() : inspected }
  return prettifyInChunks(arr, opts)
}
export function prettifySet(set: Set<any>, { key, ...opts }: PrettifyOpts = {}) {
  const elements = prettifyArray(Array.from(set), opts)
  return (key ? kfy(key) : '') + 'new Set(' + elements + ')'
}
export function inspectify(val: any, _opts: NodeUtil.InspectOptions = {}) {
  return NodeUtil.inspect(val, { depth: 10, colors: false, breakLength: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity, compact: true, numericSeparator: true })
}
const FieldnameRE = /^[a-zA-Z_]\w*$/
export function kfy(key: any, opts: PrettifyOpts = {}) {
  const str = FieldnameRE.test(key) ? key : inspectify(key)
  return _.padEnd(str + ':', opts.keywd)
}

export function prettifyField(val: any, opts: PrettifyOpts = {}) {
  if (_.isArray(val))  { return prettifyArray(val, opts) }
  if (_.isSet(val))    { return prettifySet(val,   opts) }
  return inspectify(val)
}

export function prettify(obj: object, { key, naked = false, ...opts }: PrettifyOpts = {}) {
  const firstkey     = _.isNil(key) ? '' : (kfy(key) + ' ')
  const startBracket = naked ? '' : '{'
  const endBracket   = naked ? '' : '}'
  const lines: string[] = []
  const indentPadding = indentPaddingFor(opts.indent)
  _.each(obj, (val, key) => {
    const keypart = kfy(key, { keywd: 12, ...opts })
    const valpart = prettifyField(val, opts)
    lines.push(indentPadding + keypart + ' ' + valpart)
  })
  return firstkey + startBracket +'\n' + lines.join(',\n') + ',\n' + endBracket
}

/**
 * Calls func with every element of collection (array, object, etc)
 * producing a bag using the [key, value] pairs returned by func
 *
 * * func: a function that accepts (val, collectionKey, seq, collection) => [resultKey, resultVal]
 *   - val: the value of the element in the collection
 *   - key: the key of the element in the collection: a number (for arrays) or string (for objects)
 *   - seq: the index of the element in the collection, 0...size
 *   - collection: the collection being processed
 *   - returns [resultKey, resultVal]
 * @returns bag with keys of type KT and values of type RVT (the return value of func)
 *
 * @example
 *
 *     rebag(bag, (val, key) => { const obj = lookup(key); return [obj.id, obj] }
 *     // { 'mbr.lotr:sam': { ... }, 'mbr.lotr:frodo': { ... } }
 */
export function rebag<RVT = any, IVT = any,                        RKT extends ObjKey = string>(clxn: readonly IVT[], func: ArrKVFunc<[RKT, RVT], IVT>): Record<RKT, RVT>
export function rebag<RVT = any, OT extends object = object, RKT extends ObjKey = string, IKT = any>(clxn: OT,  func: ObjKVFunc<[RKT, RVT], OT[keyof OT], keyof OT>): Record<RKT, RVT>
export function rebag<RVT = any, IVT = any, RKT extends ObjKey = ObjKey, IKT extends ObjKey = string>(clxn: ReadonlyCollection<IKT, IVT>, func: KVFunc<[RKT, RVT], IVT, IKT>): Record<RKT, RVT>
export function rebag<RVT = any, IVT = any, RKT extends ObjKey = ObjKey, IKT extends ObjKey = string>(clxn: ReadonlyCollection<IKT, IVT>, func: KVFunc<[RKT, RVT], IVT, IKT>): Record<RKT, RVT> {
  let seq = 0
  return Object.fromEntries(_.map<IVT, [RKT, RVT]>(clxn as any, (val, key) => func(val, key as any, seq++, clxn))) as Record<RKT, RVT>
}

/**
 * Calls func with every element of collection (array, object, etc)
 * and returns an object with the result, using the values of the original
 * elements as keys of the new bag.
 *
 * func should expect same args as map and return the value for each prop
 *    func(val, key/ii, collection) => val // for an object
 *
 * * func: a function that accepts (val, collectionKey, seq, collection) => val
 *   - val: the value of the element in the collection
 *   - key: the key of the element in the collection: a number (for arrays) or string (for objects)
 *   - seq: the index of the element in the collection, 0...size
 *   - collection: the collection being processed
 * @returns bag with keys of type KT and values of type RVT (the return value of func)
 *   - given an array of KT[],               returns a record with keys of type KT and values of type RVT
 *   - given a bag with values of type VT,   returns a record with keys of type VT and values of type RVT
 *   - given a bag with string keys,         returns a record with keys of type string and values of type RVT
 *
 * In all cases, the **values** of the collection become the **keys** of the new bag.
 *
 * @example
 *   objectify(['a', 'b'],   (vv, ii, ii, clxn) => vv + ii)      // { a: 'a0', b: 'b1' }
 *   objectify({x: 1, y: 2}, (vv, kk, ii, clxn) => vv * ii)      // { x: 0, y: 2 }
 *   objectify(['sam', 'frodo'], (name) => `${name}_id`)         // { sam: 'sam_id', frodo: 'frodo_id' }
 */
export function objectify<RT = any, KT extends ClxnKey   = string>(clxn: readonly KT[],                            func: ArrKVFunc<RT, KT>): Record<KT, RT>
export function objectify<RT = any, OT extends TY.AnyBag = TY.AnyBag, VT extends ClxnKey = OT[keyof OT]>(clxn: OT, func: ObjKVFunc<VT, OT[keyof OT], keyof OT>): Record<VT, RT>
export function objectify<RT = any, KT extends ClxnKey   = string, VT = any>(clxn: ReadonlyCollection<KT, VT>,     func: KVFunc<RT, KT, VT>): Record<KT, RT>
export function objectify<RT = any, KT extends ClxnKey   = string, VT = any>(clxn: ReadonlyCollection<KT, VT>,     func: KVFunc<RT, KT, VT>): Record<KT, RT> {
  return rebag(clxn as any, (val: any, key: any, seq: number, ...args: any): [any, any] => [val, func(val, key, seq, ...args)])
}

export function bagslice<VT extends object>(bag: VT, start: number | undefined, end: number | undefined): Partial<VT> {
  const keys = _.keys(bag).slice(start, end)
  return _.pick(bag, keys)
}

type PairSortFn<VT extends object, KT extends keyof VT = keyof VT> = ((entry: [key: KT, val: VT[KT]]) => any)

export function sortOnKeys<VT    extends object, KT extends keyof VT = keyof VT>([key, _val]: [KT, VT[KT]]) { return key }
export function sortOnNumkeys<VT extends object, KT extends keyof VT = keyof VT>([key, _val]: [KT, VT[KT]]) { return Number(key) }

/** Sort a bag by a funtion -- by default, its keys.
 * @note **by default, keys that parse as positive integers (1, 2, 3, ...) will appear first in retrieval order**.
 * This is part of the spec for Object.
 * @example { '1': 1, '2': 2, '-1': -1, '0.9': 0.9, '1.1': 1.1 }
 * If you use the magic function `sortOnNumkeys`,
 * keys that stringify as integers will be reinserted as `x.0`:
 * @example { '-1.0': -1, '0.9': 0.9, '1.0': 1, '1.1': 1.1, '2.0': 2 }
 */
export function bagsort<VT extends object, KT extends keyof VT = keyof VT>(bag: VT, sortfn: PairSortFn<VT, KT> = sortOnKeys, { mungeNumKeys = true, sortdirs }: { mungeNumKeys?: boolean, sortdirs?: ('asc' | 'desc')[] } = {}): VT {
  const result = {} as VT
  const sorted = _.orderBy(_.entries(bag), sortfn, sortdirs) as [KT, VT[KT]][]
  if (! mungeNumKeys) {
    return _.fromPairs(sorted) as VT
  }
  for (const [key, val] of sorted) {
    const mungedKey = (Number.isInteger(Number(key))) ? (String(key) + '.0') : key
    result[mungedKey as KT] = val as VT[KT]
  }
  return result
}

const nextTicker = (globalThis as any).nextTick ?? ((func: () => void) => (func()))

/**
 * Sleep for one tick (i.e. let everyone else have a turn)
 * @returns true
 */
export async function sleepNextTick(): Promise<true> {
  return new Promise((yay) => { nextTicker(() => yay(true)) })
}

/**
 * Sleep for a given number of milliseconds
 * @param ms       - The number of milliseconds to sleep
 * @param nextTick - Whether to sleep for one tick before starting the sleep
 * @note IMPORTANT: if nextTick is true, the sleep will be delayed by
 *   the duration given PLUS an unknowable amount of time
 * @returns true
 */
export async function sleep(ms: number, awakeNextTick: boolean = false): Promise<true> {
  if (awakeNextTick) { await sleepNextTick() }
  return new Promise((resolve) => setTimeout(resolve, ms)).then(() => true)
}

export async function * catiters(...iters: TY.AnyIterable<any>[]) {
  for (const iter of iters) {
    yield * (iter as Iterable<any>)
  }
}

export function isNode(): boolean {
  return (typeof process !== 'undefined' && process.release && process.release.name === 'node')
}

export function isBrowser(): boolean {
  return typeof globalThis.window !== 'undefined'
}