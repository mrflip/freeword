import _                           /**/ from 'lodash'
import { throwable } from './OutcomeUtils.ts'
//
// import type { KVFunc, PromiseWalkOpts, Collection, ObjKey, OneOrMany, CollectionOrMap, ClxnKey } from '../types/UtilityTypes.ts'

// const Validate = Validator(({ arr, func, safeint }) => ({
//   AwaitTasks: {
//     items: arr, func, parallelism: safeint.min(1), otherArgs: arr,
//   },
// }))

export type ObjKey        = string          | symbol
export type ClxnKey       = string | number | symbol
export type KVFunc<RT,     VT = any, KT                 = string> = (value: VT, keyOrIndex: KT, ...args: any) => RT
export type Collection<KT              extends ClxnKey = string, VT = any> = Record<KT,         VT> | VT[]
export interface PromiseWalkOpts { parallelism?: number }
export type OneOrMany<ET = any> = ET | readonly ET[]

/**
 * Runs the given iterable, allowing no more than parallelism to be
 * awaited at any time. Results will be returned in the exact order
 * of the given list.
 *
 * Tasks will be started in order but there are no other guarantees
 * about the timing or sequence of tasks.
 *
 * @param coll        the collection to iterate over
 * @param func        iterator function
 * @param opts
 *  parallelism:     number of tasks to run in parallel
 * @param otherArgs   additional arguments to pass to the iterator function
 *
 * @returns           an array of results from the iterator function (given an array);
 *                    a bag mapping keys in the original to the results of the function (given a bag)
 *                    Returned items will always be in the same order at the input collection.
 *
 */
export function AwaitTasks<RVT = any, VT = any, KT extends number = number>(coll: readonly VT[],    func: KVFunc<RVT, VT, KT>, opts?: PromiseWalkOpts, otherArgs?: any[]): Promise<Awaited<RVT>[]>
export function AwaitTasks<RVT = any, VT = any, KT extends number = number>(coll: readonly VT[],    func: KVFunc<Promise<RVT>, VT, KT>, opts?: PromiseWalkOpts, otherArgs?: any[]): Promise<Awaited<RVT>[]>
export function AwaitTasks<RVT = any, VT = any, KT extends string = string>(coll: Record<KT, VT>,   func: KVFunc<RVT, VT, KT>, opts?: PromiseWalkOpts, otherArgs?: any[]): Promise<Awaited<RVT>[]>
export async function AwaitTasks<RVT = any, VT = any, KT extends string = string>(coll: Collection, func: KVFunc<RVT, VT, KT>, { parallelism = 4 }: PromiseWalkOpts = {}, otherArgs: any[] = []): Promise<RVT[]> {
  const keys: KT[] | number[]  = _.isArray(coll) ? _.range(coll.length) : _.keys(coll) as KT[]
  const items        = _.values(coll)
  // Validate.AwaitTasks({ items, func, parallelism, otherArgs })
  let idx            = 0
  const workerIDs    = _.range(parallelism)
  const tasks: RVT[] = []
  //
  const workerTasks = Promise.all(_.map(workerIDs, async (_workerID) => {
    while (idx < items.length) {
      const ptr     = idx
      idx          += 1
      const item    = items[ptr]
      tasks[ptr]    = await func(item, keys[ptr] as KT, ptr, ...otherArgs)
    }
    return tasks
  }))
  await workerTasks
  return tasks
}

/**
 *
 * Applies a function with given parallelism
 *  if given a bag, returns a bag mapping keys in the original to the results of the function
 *  if given an array, returns an array holding the results of the function
 *  Returned items will always be in the same order at the input collection.
 *  Tasks will be started in order but there are no other guarantees
 *  about the timing or sequence of tasks.
 *
 * @param coll        the collection to iterate over
 * @param func        iterator function
 * @param opts
 *   parallelism:     number of tasks to run in parallel
 * @param otherArgs   additional arguments to pass to the iterator function
 *
 */
export function PromiseWalk<OT extends Record<string, any>, FT extends KVFunc<any, OT[keyof OT], keyof OT>>(coll: OT,        func: FT,  opts?: PromiseWalkOpts, otherArgs?: any[]): Promise<{ [key in keyof OT]: Awaited<ReturnType<FT>> }>
export function PromiseWalk<RVT = any, VT = any, KT extends ObjKey  = string>(coll: Record<KT, VT>,          func: KVFunc<RVT, VT, KT>, opts?: PromiseWalkOpts, otherArgs?: any[]): Promise<Record<string, Awaited<RVT>>>
export function PromiseWalk<RVT = any, VT = any, KT extends number  = number>(coll: VT[],                    func: KVFunc<RVT, VT, KT>, opts?: PromiseWalkOpts, otherArgs?: any[]): Promise<Awaited<RVT>[]>
export function PromiseWalk<RVT = any, VT = any, KT extends ClxnKey = string>(coll: Collection<KT, VT>,      func: KVFunc<RVT, VT, KT>, opts?: PromiseWalkOpts, otherArgs?: any[]): Promise<Awaited<RVT>[]>
export async function PromiseWalk<RVT, VT,       KT extends string  = string>(coll: Collection<KT, VT>,      func: KVFunc<RVT, VT, KT | number> = _.identity, opts: OneOrMany<any> = [], otherArgs: any[] = []): Promise<Collection<KT, RVT>> {
  if (_.isMap(coll)) { throw throwable('no walkies for Map type yet', 'notYet', coll) }
  if (_.isArray(coll)) {
    const result =  AwaitTasks<RVT, VT, number>(coll as VT[], func, opts, otherArgs)
    return result
  }
  const result = await AwaitTasks<RVT, VT, KT>(coll, func, opts, otherArgs)
  return _.zipObject(_.keys(coll), result) as Collection<KT, RVT>
}

export async function AwaitBag<OT extends object>(obj: OT, opts: PromiseWalkOpts = {}): Promise<{ [key in keyof OT]: Awaited<OT[key]> }> {
  const results = PromiseWalk(obj, _.identity, opts)
  return results as { [key in keyof OT]: Awaited<OT[key]> }
}

// // Applies a function returning pairs [key, val] with given parallelism
// // returns a bag using the given key/val pairs
// //
// // Returned items will always be in the same order at the input collection.
// // Tasks will be started in order but there are no other guarantees
// // about the timing or sequence of tasks.
// //
// export async function PromiseBagify(coll, func, opts = {}, otherArgs = []) {
//   const result = await AwaitTasks(coll, func, opts, otherArgs)
//   return _.fromPairs(result)
// }
