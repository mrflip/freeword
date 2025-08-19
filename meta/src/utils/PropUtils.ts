import      _                                /**/ from 'lodash'

type Fieldname = string; type Bag<VT> = Record<string, VT>; type AnyBag = Bag<any>

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
export function ownProps(obj: object | null | undefined): Bag<TypedPropertyDescriptor<any>> {
  if (_.isNil(obj)) { return {} }
  return Object.getOwnPropertyDescriptors(obj)
}

/** Get the own property names of an object
 *
 * @param   obj - The object to get the own property names of
 * @returns       The own property names of the object; empty array if nil
 */
export function ownPropnames(obj: object | null | undefined): string[] {
  if (_.isNil(obj)) { return [] }
  return Object.getOwnPropertyNames(obj)
}

/** Get the property names of the **first parent prototype** of an object
 *
 * @param   obj - The object to get the prototype property names of
 * @returns       The prototype property names of the object; empty array if nil
 */
export function protoPropnames(obj: object | null | undefined): string[] {
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
export function protoProp<VT>(obj: object, propname: Fieldname): TypedPropertyDescriptor<VT> | undefined {
  return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), propname)
}

/** Get the property descriptor of a property of an object
 *
 * @param   obj       - The object to get the property descriptor of
 * @param   propname  - The name of the property to get the descriptor of
 * @returns           The property descriptor of the property; undefined if not found
 */
export function ownProp<VT>(obj: object, propname: Fieldname): TypedPropertyDescriptor<VT> | undefined {
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
export function getProp<VT>(obj: object, propname: Fieldname, depth: number = 0): TypedPropertyDescriptor<VT> | undefined {
  if (depth < 0) { return undefined }
  const val = Object.getOwnPropertyDescriptor(obj, propname)
  if (val) { return val }
  const proto = Object.getPrototypeOf(obj)
  if  (! proto) { return undefined }
  return getProp(proto, propname, depth - 1)
}

export function bagsize(bag: AnyBag | any[]): number {
  if (_.isArray(bag)) { return bag.length }
  return _.keys(bag).length
}

export function scrubNil<VT>(vals: (VT | undefined)[]): NonNullable<VT>[]
export function scrubNil<VT>(vals: VT): { [KT in keyof VT]: NonNullable<VT[KT]> }
export function scrubNil<VT>(vals: (VT | undefined)[]): NonNullable<VT>[] {
  if (_.isArray(vals)) { return _.reject(vals, _.isNil) as NonNullable<VT>[] }
  return _.omitBy(vals, _.isNil) as any
}

export function scrubVoid<VT>(vals: (VT | undefined)[]): NonNullable<VT>[]
export function scrubVoid<VT>(vals: VT): { [KT in keyof VT]: NonNullable<VT[KT]> }
export function scrubVoid<VT>(vals: (VT | undefined)[]): NonNullable<VT>[] {
  if (_.isArray(vals)) { return _.reject(vals, isVoid) as NonNullable<VT>[] }
  return _.omitBy(vals, isVoid) as any
}

const BLANKS = new Set([null, undefined, ''])

/** Returns `true` for null, undefined, empty string, {}, and [], empty map, empty set, empty buffer. Returns **`false`** for zero 0, false, and NaN
 *  Boolean and Number values are never void: `false`, `0`, `-0`, `+-` and `Nan` are all non-void,
 *  @param obj - The object to check
 *  @returns true if the object is void, false otherwise
 */
export function isVoid(obj: any): boolean {
  if (_.isNumber(obj) || _.isBoolean(obj)) { return false  }                         // common-case non-void items
  if (BLANKS.has(obj) || _.isEqual(obj, {}) || _.isEqual(obj, [])) { return true   } // common-case void items
  if (_.isMap(obj) || _.isSet(obj) || _.isBuffer(obj)) {  return _.isEmpty(obj) }    // empty maps, sets and buffers are void
  // anything else is non-void
  return false
}

// returns true if you're likely to have success spreading arr into an array: [...arr]
export function arrayish(arr: any): boolean {
  if (_.isArray(arr)) { return true }
  if (_.isMap(arr) || _.isString(arr)) { return false }
  return (!! arr?.[Symbol.iterator])
}

export function isAnyIterable(obj: any): boolean {
  return (!! (obj?.[Symbol.iterator] || obj?.[Symbol.asyncIterator]))
}

// true for objects and Maps that are not Useful.arrayish and not RegExp, Function, String, Class or other decoys
export function baggish<RT extends AnyBag>(obj: any): obj is RT {
  if (_.isPlainObject(obj))  { return true }
  if (! _.isObjectLike(obj)) { return false }
  if ('isBaggish' in obj)    { return obj.isBaggish }
  if (isAnyIterable(obj))    { return false }
  if (_.isRegExp(obj) || (obj instanceof Promise)) { return false }
  return _.isObject(obj)
}

export function objectish<RT extends AnyBag | Map<any, any>>(obj: any): obj is RT {
  return baggish(obj) || _.isMap(obj)
}

export function arrayOrBag(objOrArr: any): boolean {
  return _.isArray(objOrArr) || baggish(objOrArr)
}
