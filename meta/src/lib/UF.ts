import      _                                /**/ from 'lodash'
import      * as NodeUtil                         from 'node:util'
import type * as TY                               from '../types.ts'
export      { sprintf, vsprintf }                 from 'sprintf-js'
import      { nextTick }                          from 'node:process'
import      { A2Zlos }                      from '../lexicon/LexiconConsts.ts'
//
export      *                                      from './Rot13.ts'

export type ObjKey        = string          | symbol
export type ClxnKey       = string | number | symbol
export type ReadonlyCollection<KT extends ClxnKey = string, VT = any> = Record<KT,         VT> | readonly VT[]
export type ObjKVFunc<RT,  VT = any, KT extends ClxnKey = string> = (value: VT, keyOrIndex: KT,          index: number, ...args: any) => RT
export type ArrKVFunc<RT,  VT = any>                              = (value: VT, keyOrIndex: number,      index: number, ...args: any) => RT
export type KVFunc<RT,     VT = any, KT = string | number>        = (value: VT, keyOrIndex: KT, index: number, ...args: any) => RT

/** @returns a bag with keys a, b, ... z and values of type VT */
export function alphabetLookupBag<VT>(seed: VT | ((ltr: TY.A2Zlo) => VT)): Record<TY.A2Zlo, VT> {
  if (_.isFunction(seed)) {
    return objectify(A2Zlos, (ltr) => seed(ltr))
  }
  return objectify(A2Zlos, () => (seed))
}

/** Assign a **non-enumerable**, writable, configurable property to an object
 * See also {@link setNormalProp} and {@link decorate}
 * @param   obj     - The object to decorate
 * @param   key     - The key to decorate the object with
 * @param   value   - The value to decorate the object with
 * @returns           The value
 */
export function adorn<VT>(obj: object, key: string, value: VT): VT {
  Object.defineProperty(obj, key, { value, enumerable: false, writable: false, configurable: true })
  return value
}
/** Assign an enumerable, writable, configurable property to an object
 * See also {@link adorn} and {@link decorate}
 * @param   obj     - The object to decorate
 * @param   key     - The key to decorate the object with
 * @param   value   - The value to decorate the object with
 * @returns           The value
 */
export function setNormalProp<VT>(obj: object, key: string, value: VT): VT {
  Object.defineProperty(obj, key, { value, enumerable: true, writable: true, configurable: true })
  return value
}

export function setNormalProps<OT extends Record<string, any>, VT extends Record<string, any>>(obj: OT, vals: VT): OT & VT {
  Object.entries(vals).forEach(([key, value]) => {
    Object.defineProperty(obj, key, { value, enumerable: true, writable: true, configurable: true })
  })
  return obj as OT & VT
}

export function setHiddenProps<OT extends Record<string, any>, VT extends Record<string, any>>(obj: OT, vals: VT): OT & VT {
  Object.entries(vals).forEach(([key, value]) => {
    Object.defineProperty(obj, key, { value, enumerable: false, writable: true, configurable: true })
  })
  return obj as OT & VT
}
/** Assign non-enumerable, writable, configurable properties to an object
 * See also {@link adorn} and {@link decorate}
 * @param   obj - The object to decorate
 * @param   vals - The values to decorate the object with
 * @returns The decorated object
 */
export function decorate<OT extends Record<string, any>, VT extends Record<string, any>>(obj: OT, vals: VT): OT & VT {
  Object.entries(vals).forEach(([key, value]) => {
    Object.defineProperty(obj, key, { value, enumerable: false, writable: false, configurable: true })
  })
  return obj as OT & VT
}

/** Get the own properties of an object
 *
 * @param   obj - The object to get the own properties of
 * @returns       The own properties of the object; empty object if nil
 */
export function ownProps(obj: object): TY.Bag<TypedPropertyDescriptor<any>> {
  if (_.isNil(obj)) { return {} }
  return Object.getOwnPropertyDescriptors(obj)
}

/** Get the own property names of an object
 *
 * @param   obj - The object to get the own property names of
 * @returns       The own property names of the object; empty array if nil
 */
export function ownPropnames(obj: object): string[] {
  if (_.isNil(obj)) { return [] }
  return Object.getOwnPropertyNames(obj)
}

/** Get the property names of the **first parent prototype** of an object
 *
 * @param   obj - The object to get the prototype property names of
 * @returns       The prototype property names of the object; empty array if nil
 */
export function protoPropnames(obj: object): string[] {
  if (_.isNil(obj)) { return [] }
  const proto = Object.getPrototypeOf(obj)
  return ownPropnames(proto)
}

/** Get the property descriptor of a property of the **first parent prototype** of an object
 *
 * @param   obj       - The object to get the property descriptor of
 * @param   propname  - The name of the property to get the descriptor of
 * @returns           The property descriptor of the property; undefined if not found
 */
export function protoProp<VT>(obj: object, propname: TY.Fieldname): TypedPropertyDescriptor<VT> | undefined {
  return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), propname)
}

/** Get the property descriptor of a property of an object
 *
 * @param   obj       - The object to get the property descriptor of
 * @param   propname  - The name of the property to get the descriptor of
 * @returns           The property descriptor of the property; undefined if not found
 */
export function ownProp<VT>(obj: object, propname: TY.Fieldname): TypedPropertyDescriptor<VT> | undefined {
  return Object.getOwnPropertyDescriptor(obj, propname)
}

/** Get the first property descriptor found ascending the prototype chain
 * for a given property name
 *
 * @param   obj       - The object to get the property descriptor of
 * @param   propname  - The name of the property to get the descriptor of
 * @param   depth     - The depth of the prototype chain to search
 * @returns             The property descriptor of the property; undefined if not found
 */
export function getProp<VT>(obj: object, propname: TY.Fieldname, depth: number = 0): TypedPropertyDescriptor<VT> | undefined {
  if (depth < 0) { return undefined }
  const val = Object.getOwnPropertyDescriptor(obj, propname)
  if (val) { return val }
  const proto = Object.getPrototypeOf(obj)
  if  (! proto) { return undefined }
  return getProp(proto, propname, depth - 1)
}

export function bagsize(bag: TY.AnyBag | any[]): number {
  if (_.isArray(bag)) { return bag.length }
  return _.keys(bag).length
}

export function isNode(): boolean {
  return (typeof process !== 'undefined' && process.release && process.release.name === 'node')
}

export function isBrowser(): boolean {
  // if (isNode()) { return false }
  return (!! (import.meta as any).client)
}

export interface PrettifyFieldOpts {
  chunkSize?: number | undefined
  colwd?:     number | undefined
  keywd?:     number | undefined
  key?:       string | undefined
  naked?:     boolean | undefined
  indent?:    string | number | undefined
}
export interface PrettifyOpts extends PrettifyFieldOpts {
  naked?:        boolean | undefined,
  chunkArrays?:  boolean | undefined,
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
export function prettifyInChunks(arr: readonly string[], { chunkSize = 20, colwd = 12, key, indent = 2 }: PrettifyOpts = {}) {
  const indentPadding = indentPaddingFor(indent)
  const lines = _.chunk(arr, chunkSize).map((chunk) => chunk.map((val) => _.padEnd(inspectify(val) + ',', colwd)).join(' '))
  const body = lines.join('\n' + indentPadding)
  return (key ? kfy(key) : '') + '[\n    ' + body + '\n]'
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
export function rebag<RVT = any, OT extends TY.AnyBag = TY.AnyBag, RKT extends ObjKey = string, IKT = any>(clxn: OT,  func: ObjKVFunc<[RKT, RVT], OT[keyof OT], keyof OT>): Record<RKT, RVT>
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

/**
 * Sleep for one tick (i.e. let everyone else have a turn)
 * @returns true
 */
export async function sleepNextTick(): Promise<true> {
  return new Promise((yay) => { nextTick(() => yay(true)) })
}

/**
 * Sleep for a given number of milliseconds
 * @param ms       - The number of milliseconds to sleep
 * @param nextTick - Whether to sleep for one tick before starting the sleep
 * @note IMPORTANT: if nextTick is true, the sleep will be delayed by
 *   the duration given PLUS an unknowable amount of time
 * @returns true
 */
export async function sleep(ms: number, nextTick: boolean = false): Promise<true> {
  if (nextTick) { await sleepNextTick() }
  return new Promise((resolve) => setTimeout(resolve, ms)).then(() => true)
}

/** @returns an array of all the values in the iterable */
export async function slurp<VT>(iter: AsyncIterable<VT> | Iterable<VT>): Promise<VT[]> {
  const vals: VT[] = []
  for await (const val of iter) { vals.push(val) }
  return vals
}

/** @returns an array of all the values in the iterable */
export async function slurpWithResult<VT, RT>(iter: AsyncIterator<VT> | Iterator<VT> | Generator<VT, RT> | AsyncGenerator<VT, RT>): Promise<{ vals: VT[], ret: any }> {
  const vals: VT[] = []
  let   ret: any
  while (true) {
    const { done, value } = await iter.next()
    if (done) { ret = value; break }
    vals.push(value)
  }
  return { vals, ret }
}

export async function * catiters(...iters: TY.AnyIterable<any>[]) {
  for (const iter of iters) {
    yield * iter
  }
}