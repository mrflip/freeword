import      _                                /**/ from 'lodash'
import type * as TY from '../types.ts'
import { throwable } from './Outcome.ts'

export function   keyStar(obj: any[]):                                                 Generator<number, any, number | undefined>
export function   keyStar<VT extends object, KT extends keyof VT = keyof VT>(obj: VT): Generator<KT,     any, KT     | undefined>
export function * keyStar<VT extends object, KT extends keyof VT = keyof VT>(obj: VT): Generator<KT,     any, KT     | undefined> {
  if (_.isArray(obj)) {
    for (let seq = 0; seq < obj.length; seq++) { yield seq as KT }
    return undefined
  }
  yield* _.keys(obj) as KT[]
  return undefined
}

export function   valuesStar<IT>(obj: IT[]):                                              Generator<IT,     any, IT     | undefined>
export function   valuesStar<VT extends object, KT extends keyof VT = keyof VT>(obj: VT): Generator<VT[KT], any, VT[KT] | undefined>
export function * valuesStar<VT extends object, KT extends keyof VT = keyof VT>(obj: VT): Generator<VT[KT], any, VT[KT] | undefined> {
  for (const key of keyStar(obj)) {
    yield obj[key as KT] as VT[KT]
  }
  return undefined
}

export function   entriesStar<IT>(obj: IT[]):                                              Generator<[number, IT, number], any, [number, IT, number] | undefined>
export function   entriesStar<VT extends object, KT extends keyof VT = keyof VT>(obj: VT): Generator<[KT, VT[KT], number], any, [KT, VT[KT], number] | undefined>
export function * entriesStar<VT extends object, KT extends keyof VT = keyof VT>(obj: VT): Generator<[KT, VT[KT], number], any, [KT, VT[KT], number] | undefined> {
  let seq = 0
  for (const key of keyStar(obj)) {
    yield [key as KT, obj[key as KT] as VT[KT], seq++]
  }
  return undefined
}

export function classifyIterable(obj: any): false | 'iterable' | 'iterator' | 'asyncIterator' {
  if (! obj) { return false }
  if (_.isFunction(obj?.next) && _.isFunction(obj?.return)) { return 'iterator' }
  if (_.isFunction(obj[Symbol.iterator]))      { return 'iterable'      }
  if (_.isFunction(obj[Symbol.asyncIterator])) { return 'asyncIterator' }
  return false
}
export function isAnyIter<IT>(obj: any): obj is Iterator<IT> | AsyncIterator<IT> | Iterable<IT> | AsyncIterable<IT> {
  return (!! classifyIterable(obj))
}
/** @returns true if `obj` is a sync iterable -- @see {@link isAsyncIterable}, {@link iteratorFor} */
export function isSyncIterable<IT>(obj:  any): obj is Iterable<IT>      { return obj && (_.isFunction(obj[Symbol.iterator]))      }
/** @returns true if `obj` is an async iterable  -- @see {@link isSyncIterable}, {@link asyncIteratorFor} */
export function isAsyncIterable<IT>(obj: any): obj is AsyncIterable<IT> { return obj && (_.isFunction(obj[Symbol.asyncIterator])) }

/** yields objects from the beg'th to the end'th index, using the same sematics as @see {@link Array.slice}.
 * NOTE: if either index is negative, and you do not provide a length, this will have to buffer some or all of the
 * result set (though not the entire input set), as we won't know when the indices have been reached.
 */
export function   sliceStar<IT                                               >(obj: Iterable<IT>, beg?: number | undefined, end?: number | undefined, opts?: { len?: number | undefined, treatAs?: 'stream' | undefined }): Generator<IT, any, IT | undefined>
export function   sliceStar<VT extends object, KT extends keyof VT = keyof VT>(obj: VT,           beg?: number | undefined, end?: number | undefined, opts?: { len?: number | undefined, treatAs?: 'object' | undefined }): Generator<VT[KT], any, VT[KT] | undefined>
export function * sliceStar<VT extends object, KT extends keyof VT = keyof VT>(
  obj: VT, beg?: number | undefined, end?: number | undefined, { len, treatAs }: { len?: number | undefined, treatAs?: 'object' | 'stream' | undefined } = {},
): Generator<VT[KT], any, VT[KT] | undefined> {
  if (_.isArray(obj))    {
    yield* obj.slice(beg, end); return ['array', beg, end, obj.length]
  }
  if ((treatAs === 'stream') || (isAnyIter(obj) && (treatAs !== 'object'))) {
    yield* sliceStream(obj as Iterable<VT[KT]>, beg, end, len); return ['iterable', beg, end, len]
  }
  yield* sliceStream(valuesStar(obj), beg, end, len)
  return ['object', beg, end, len]
}

function saneSliceArg0(arg0: number | undefined, len: number | undefined): number {
  if (! arg0)              { return 0            }
  if (isNegInfinity(arg0)) { return 0            }
  if (arg0 >= 0)           { return arg0         }
  if (len !== undefined)   { return (len + arg0) }
  return arg0
}
function isPosInfinity(val: number | undefined): boolean {
  return val === Number.POSITIVE_INFINITY
}
function isNegInfinity(val: number | undefined): boolean {
  return val === Number.NEGATIVE_INFINITY
}

/** yields objects from the beg'th to the end'th index, using the same sematics as @see {@link Array.slice}.
 * NOTE: if either index is negative, and you do not provide a length, this will have to buffer some or all of the
 * result set (though not the entire input set), as we won't know when the indices have been reached.
 */
export function * sliceStream<IT>(stream: Iterable<IT>, arg0?: number | undefined, arg1?: number | undefined, len?: number | undefined): Generator<IT, any, IT | undefined> {
  if ((arg1 === 0) || (isPosInfinity(arg0) || isNegInfinity(arg1))) { return ['empty', arg0, arg1, 0] }
  if ((len !== undefined) && ((arg0! >= len) || (len <= 0))) { return ['empty', arg0, arg1, len] }
  if (_.isArray(stream)) { yield* stream.slice(arg0, arg1); return ['array', arg0, arg1, stream.length] }
  const ii = saneSliceArg0(arg0, len)
  if (ii === 0 && ((arg1 === undefined) || (isPosInfinity(arg1)))) { yield* stream; return ['full', arg0, arg1] }
  const jj = ((! arg1) ? Infinity : (arg1 >= 0) ? arg1 : len ? (len + arg1) : arg1)
  if (ii >= 0) {   // "slice from beg'th index ..."
    if (jj >= 0) { // "slice from beg'th index, stopping at end'th index"
      if (jj <= ii) { return ['empty', arg0, arg1, ii, jj] }
      yield* _sliceStarPosPos(stream, ii, jj); return ['pospos', arg0, arg1, ii, jj]
    } //           // "slice from beg'th index, dropping dropend items"
    yield* _sliceStarPosNeg(stream, ii, -jj)
    return ['posneg', arg0, arg1, ii, -jj]
  } // else:      // "keep at most the last horizon items..."
  if (jj >= 0) {  // "keep at most the last horizon items, stopping at end'th index"
    yield* _sliceStarNegPos(stream, -ii, jj)
    return ['negpos', arg0, arg1, -ii, jj]
  } //            // "keep at most the last horizon items, dropping dropend items"
  if (ii >= jj) { return ['empty', arg0, arg1, ii, jj] }
  yield* _sliceStarNegNeg(stream, -ii, -jj)
  return ['negneg', arg0, arg1, -ii, -jj]
}

/** Return items starting from the beg'th index and ending at the end'th index
 *
 * Ensure that `items` is not an array, is sync iterable,
 * has beg >= 0, and end > beg.
 *
 */
export function * _sliceStarPosPos<IT>(stream: Iterable<IT>, beg: number, end: number): Generator<IT, any, IT | undefined> {
  let seq = 0
  for (const item of stream) { // order of the below is important. Incrementing first makes the comparisons less intuitive but saves an if
    seq += 1
    if (seq <= beg)  { continue }
    yield item
    if (seq >= end)  { break    }
  }
  return ['_sliceStarPosPos', seq, beg, end]
}

/** Keep at most the last `horizon` items in the stream, additionally dropping the last `dropend` of them
 * NOTE: this will have to buffer some or all of the result set:
 * * buffer size: `horizon` -- (or stream length, if less)
 * * result size: `min(horizon, stream len, horizon + dropend - len)`
 *
 * Ensure that `items` is not an array, is sync iterable, if horizon >= 0, and if dropend > 0
 *
 * Strategy: examine all items
 * * push each item into the buffer
 * * if seq > horizon, shift and discard the first item; it will be too old
 *   the buffer will be at most `horizon` items
 * once the stream is exhausted,
 * yield * all but the last `dropend` items in the buffer
 */
export function * _sliceStarNegNeg<VT>(items: Iterable<VT>, horizon: number, dropend: number): Generator<VT, any, VT | undefined> {
  let bucket = [] as VT[]
  for (const item of items) {
    bucket.push(item)
    if (bucket.length > horizon) { bucket.shift() }
  }
  yield* bucket.slice(0, -dropend)
  return ['_sliceStarNegNeg', horizon, dropend, bucket.length, bucket.length - dropend]
}

/** Yield items starting from the beg'th index, but always omitting the last `dropend` items.
 * Unless more than `dropend` items are available, none will be streamed.
 * NOTE: this will have to buffer some or all of the result set:
 * * buffer size: `dropend`
 * * result size: `len - dropend - beg` -- if negative, none will be streamed
 *
 * Ensure that `items` is not an array, is sync iterable, if beg >= 0, and if omit > 0
 *
 * * ignore the first `beg` items
 * * push each item after that into the buffer
 * * if more than `dropend` items are in the buffer,
 *   shift+yield the earliest item. (the buffer stops growing at this point)
 * * once the end is reached, the buffer (holding the last `dropend` items) is discarded
 */
export function * _sliceStarPosNeg<VT>(items: Iterable<VT>, beg: number, dropend: number): Generator<VT, any, VT | undefined> {
  let bucket = [] as VT[]
  let   seq  = 0
  for (const item of items) {
    seq += 1
    if (seq <= beg) { continue } // gte `<=` is because we did the `++` increment first
    bucket.push(item)
    if (bucket.length > dropend) { yield bucket.shift()! }
  }
  // last `dropend` items are discarded
  return ['_sliceStarPosNeg', seq, beg, dropend, bucket.length, bucket.length - dropend]
}

/** Yield items starting from the horizon'th before the end,
 * but always stopping at and discarding the end'th item.
 * This will have to buffer up to `horizon` items:
 * * buffer size: `horizon`
 * * result size: `min([horizon, len, horizon + len - end])` -- if negative, none will be streamed
 *
 * Ensure that `items` is not an array, is sync iterable,
 * has horizon > 0, and end > 0.
 *
 * 0123456789 horz endx  len  begx  stopx  01234 56789
 * ABCDEFGHIJ    3   12   10   7      9    xxxxx xxHIJ
 * ABCDEFGHIJ    3 >=10   10   7      9    xxxxx xxHIJ
 * ABCDEFGHIJ    3    9   10   7      8    xxxxx xxHIx
 * ABCDEFGHIJ    3    8   10   7      7    xxxxx xxHxx
 * ABCDEFGHIJ    8 >=10   10   2      9    xxCDE FGHIJ
 * ABCDEFGHIJ    8    4   10   2      4    xxCDx xxxxx
 * ABCDEFGHIJ   10 >=10   10   0      9    ABCDE FGHIJ
 * ABCDEFGHIJ   10    9   10   0      8    ABCDE FGHIx
 * ABCDEFGHIJ    3    4   10   2      4    xxCDE xxxxx
 * ABCD          3    4    4   1      3    xBCD
 * ABCD          4   10    4   1      3    xBCD
 * ABC           3    4    3   0      2    ABC
 * A             3    4    1   0      0    A
 * ABCDEFGHIJ    3    3                    (not a valid call)
 *
 * Strategy:
 * * if seq < end, push the item (it might age out later)
 * * if seq > horizon, shift the first item; it will be too old
 * * if seq > end + horizon, break.
 * yield * all the items in the buffer (we'll have already
 * aged out those past the horizon, and never added the ones past the end)
 *
 */
export function * _sliceStarNegPos<VT>(items: Iterable<VT>, horizon: number, end: number): Generator<VT, any, VT | undefined> {
  let bucket = [] as VT[]
  let   seq  = 0
  const maxseq = end + horizon
  for (const item of items) {
    if (seq >= horizon) { bucket.shift() }
    if (seq  < end)     { bucket.push(item) }
    if (seq >= maxseq)  { break }
    seq += 1
  }
  yield* bucket
  return ['_sliceStarNegPos', seq, horizon, end, bucket.length]
}

/** @returns an array of all the values in the iterable; works if iterable is async or sync */
export async function slurp<VT>(iter: AsyncIterable<VT> | Iterable<VT>): Promise<VT[]> {
  const vals: VT[] = []
  for await (const val of iter) { vals.push(val) }
  return vals
}

export function iteratorFor<VT>(iter: TY.AnySyncIterable<VT>): Iterator<VT>
export function iteratorFor<VT>(iter: TY.AnyAsyncIterable<VT> | TY.AnySyncIterable<VT>): AsyncIterator<VT> | Iterator<VT>
export function iteratorFor<VT>(iter: TY.AnyAsyncIterable<VT> | TY.AnySyncIterable<VT>): AsyncIterator<VT> | Iterator<VT> {
  if (! _.isObject(iter)) { throw throwable('iter must be an object', 'mistype', { given: iter }) }
  if (isSyncIterable(iter))  { return iter[Symbol.iterator]() }
  if (isAsyncIterable(iter)) { return iter[Symbol.asyncIterator]() }
  return iter
}

/** @returns an array of all the values in the iterable */
export async function slurpWithResult<VT, RT = any>(streamable: TY.AnyAsyncIterable<VT, RT> | TY.AnySyncIterable<VT, RT>): Promise<{ vals: VT[], ret: RT }> {
  const vals: VT[] = []
  let   ret: RT
  const stream = iteratorFor(streamable)
  while (true) {
    const { done, value } = await stream.next()
    if (done) { ret = value; stream.return?.(undefined); break }
    vals.push(value)
  }
  return { vals, ret }
}

/** @returns an array of all the values in the iterable */
export function slurpWithResultSync<VT, RT = any>(streamable: TY.AnySyncIterable<VT, RT>): { vals: VT[], ret: RT } {
  const stream = iteratorFor(streamable)
  const vals: VT[] = []
  let   ret: RT
  while (true) {
    const { done, value } = stream.next()
    if (done) { ret = value; stream.return?.(undefined); break }
    vals.push(value)
  }
  return { vals, ret }
}