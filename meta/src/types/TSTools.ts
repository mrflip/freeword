// import type   * as TSTB                                      from 'ts-toolbelt'
// import type { A as TSTA, O as TSTO }                         from 'ts-toolbelt'
// export type { Any as TSTA, List as TSTL, Object as TSTO, Tuple as TSTT, Union as TSTU } from 'ts-toolbelt' // eslint-disable-line import/no-extraneous-dependencies

// For the Static Factory pattern -- https://tsplay.dev/w8Dkpw

type Bag<TT>     = { [key: string]: TT }
export type ArrRO<T>            = readonly T[]
export type ArrNZRO<T>          = readonly [T, ...T[]]
export type StrArrNZRO          = ArrNZRO<string>
export type ArrNZ<T>            = [T, ...T[]]
export type StrArrNZ            = ArrNZ<string>
export type NonEmptyArray<T>    = ArrNZ<T>
export type NonEmptyStringArray = StrArrNZ

export type Optionally<T> = { [P in keyof T]?: T[P] | undefined; }
export type Nullablize2<OT,    KT extends keyof OT> = Omit<OT, KT> & { [P in KT]:          OT[P] | null }
export type Optionalize2<OT,   KT extends keyof OT> = Omit<OT, KT> & { [P in KT]?:         OT[P] | undefined }
export type Optnullablize2<OT, KT extends keyof OT> = Omit<OT, KT> & { [P in KT]?:         OT[P] | undefined | null }
export type Unnullablize2<OT,  KT extends keyof OT> = Omit<OT, KT> & { [P in KT]:   Exclude<OT[P], null> }
export type Unoptionalize2<OT, KT extends keyof OT> = Omit<OT, KT> & { [P in KT]-?: Exclude<OT[P], undefined> }
export type Requireize2<OT,    KT extends keyof OT = keyof OT> = Omit<OT, KT> & { [P in KT]-?: Exclude<OT[P], undefined | null> }

export type Nullablize<OT,      KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]:          OT[P] | null }
export type Partialize<OT,      KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]?:         OT[P] }
export type Optionalize<OT,     KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]?:         OT[P] | undefined }
export type Optnullablize<OT,   KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]?:         OT[P] | undefined | null }
export type Unnullablize<OT,    KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]:   Exclude<OT[P], null> }
export type Unoptionalize<OT,   KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]-?: Exclude<OT[P], undefined> }
export type UnPartialize<OT,    KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]-?:         OT[P] }
export type Requireize<OT,      KT extends string = keyof OT & string> = Omit<OT, KT> & { [P in KT & keyof OT]-?: Exclude<OT[P], undefined | null> }
export type OptionalizePick<OT, KT extends keyof OT> = Pick<OT, KT> & { [P in Exclude<keyof OT, KT>]?: OT[P] | undefined }

export type Invert<BagT extends Record<string, string>>   = { [KT in keyof BagT as BagT[KT]]: KT }

/** Get the inner keys of a Bag of Bags */ // the placeholder `true` is just so there's something to keyof
export type BagBagKeys<BBT extends Bag<Bag<any>>> = keyof { [K in keyof BBT as keyof BBT[K]]: true }
export type BagBagMerge<BBT extends Bag<Bag<any>>> = {
  [InnerKey in BagBagKeys<BBT>]: {
    [OuterKey in keyof BBT]: InnerKey extends keyof BBT[OuterKey] ? BBT[OuterKey][InnerKey] : never
  }[keyof BBT]
}
export type MapKeys<BBT extends Bag<Bag<any>>, InnerKey extends keyof BBT[keyof BBT]> = { [IK in BBT[keyof BBT][InnerKey]]: { [KT in keyof BBT]: BBT[KT][InnerKey] extends IK ? BBT[KT] : never }[keyof BBT] }
// { [GK in PokeGenkey]: { [region in keyof PokeRegionsT]: PokeRegionsT[region]['genkey'] extends GK ? PokeRegionsT[region] : never }[keyof PokeRegionsT] }

// const _bagbag     = { Loc: { loc1: { id: 'loc1' }, loc2: { id: 'loc2' } }, Tag: { tag1: { id: 'tag1' }, tag2: { id: 'tag2' } } } as const
// type _bagbagKeys  = BagBagKeys<typeof _bagbag>
// type _bagbagMerge = BagBagMerge<typeof _bagbag>

/**
 * Use this to strip a static method from the parent class
 * to work around TY's broken static inheritance
 *
 * Ex:
 * ```ts
 *   class Animal { static make(props: AnimalProps): Animal { return new Animal(props) } }
 *   class Dog extends (Animal as OmitStatics<typeof Animal, { make(props: DogProps): Dog }>) { static make(...) { ...; return super.make(props) } }
 * ```
 *
 */
export type OmitStatics<T, Replacement> =
  T extends { new(...args: infer CtorArgs): infer BaseInstanceT }
    ? Omit<T, keyof Replacement> & Replacement & {
      new(...args:  CtorArgs): BaseInstanceT
    }
    : Omit<T, keyof Replacement>


// /**
//  * Omit the statics of a class, and replace them with the given replacement.
//  * because TS is effed in the head and has a stupid type system for static methods
//  * @param T - The class to omit the statics of.
//  * @param Replacement - The replacement to use for the statics.
//  * @returns The class with the statics omitted and replaced.
//  */
// export type OmitStatics<T, Replacement> =
//   T extends { new(...args: infer CtorArgs): infer BaseInstanceT }
//     ? Omit<T, keyof Replacement> & Replacement & {
//       new(...args:  CtorArgs): BaseInstanceT
//     }
//     : Omit<T, keyof Replacement>


// export type MergeUnion<T>  = { [K in keyof T]: T[K] } & {}
// export type LooseMerge<T>  = { [K in keyof T as K extends keyof T ? K : never]: T extends Record<K, infer V> ? V : never }
// export type AnyOf<T>       = MergeUnion<LooseMerge<T>>

export type BlendUnion<U> = {
  [K in (U extends unknown ? keyof U : never)]:
  U extends unknown ? K extends keyof U ? U[K] : never : never
}

export type NotNil  = NonNullable<unknown>
export type NotNull = NotNil | null
export type NotUnd  = NotNil | undefined
export type Idk     = NotNull
// I can't find a way to get NaN excluded o well
// function _demoWhatevses() {
//   function _compareWhatevses(aa: [axx: any,  unk: unknown, idk: Idk,  anyNN: AnyNonNull, anyNU: AnyNonUnd, anyNX: AnyNonNil, nn: 1]) { return aa }
//   const _aa =  _compareWhatevses([undefined,  undefined,    undefined, undefined,         undefined,        undefined,         1])
//   const _bb =  _compareWhatevses([null,       null,         null,      null,              null,             null,              1])
//   const _cc =  _compareWhatevses([NaN,        NaN,          NaN,       NaN,               NaN,              NaN,               1])
//   const _dd =  _compareWhatevses([1,          1,            1,         1,                 1,                1,                 1])
// }

/** Scrub undefined values from an array */
export type ArrDefinedVals<A extends readonly unknown[]> =
  A extends readonly [infer First, ...infer Rest]
    ? [undefined] extends [First]
      ? [First] extends [undefined]
        ? ArrDefinedVals<Rest>
        : [...([] | [First]), ...ArrDefinedVals<Rest>]
      : [First, ...ArrDefinedVals<Rest>]
    : A extends readonly []
      ? []
      : Exclude<A[number], undefined>[]

/** Scrub undefined values from an object */
export type ObjDefinedVals<O extends object> = {
  [K in keyof O as O[K] extends undefined ? never : K]: Exclude<O[K], undefined>
}

/** Scrub undefined values from a collection */
export type DefinedVals<O extends unknown[] | object> =
  O extends unknown[]
    ? ArrDefinedVals<O>
    : O extends object
      ? ObjDefinedVals<O>
      : never

// eslint-disable-next-line @typescript-eslint/ban-types
export type Simplify<TooManyBags> = { [KeyType in keyof TooManyBags]: TooManyBags[KeyType] } & { }

// export type DeepOptional<OT extends object> = TSTO.Optional<OT, TSTA.Key, 'deep'>
// export type DeepPartial<OT  extends object> =  TSTO.Partial<OT, 'deep'>

export type MapNth<Arr extends readonly (readonly unknown[])[], Idx extends number> =
  Arr extends readonly [infer Curr, ...infer Rest]
    ? Rest extends readonly unknown[][]
      ? Curr extends readonly unknown[]
        ? [Curr[Idx], ...MapNth<Rest, Idx>]
        : [never, ...MapNth<Rest, Idx>]
      : never
    : []

export type MapPick<Key extends KT, Arr extends readonly NT[], KT extends string = string, NT extends Record<KT, unknown> = Record<KT, unknown>> =
  Arr extends readonly [infer Curr, ...infer Rest]
    ? Rest extends readonly NT[]
      ? Curr extends NT
        ? [Pick<Curr, Key>, ...MapPick<Key, Rest, KT, NT>]
        : [never, ...MapPick<Key, Rest, KT, NT>]
      : never
    : []
//

export type ListLength<Arr extends readonly unknown[]> = Arr["length"]
export type MapHeads<Arr   extends readonly (readonly unknown[])[]> = MapNth<Arr, 0>
export type MapSeconds<Arr extends readonly (readonly unknown[])[]> = MapNth<Arr, 1>
export type UnzipPairs<Arr extends readonly (readonly unknown[])[]> = IfEmpty<Arr, [], [MapHeads<Arr>, MapSeconds<Arr>]>
export type IfEmpty<Arr    extends readonly unknown[], EmptyCase, SomeCase> = ListLength<Arr> extends 0 ? EmptyCase : SomeCase

// // Order of this is not reliable.
// export type KeysOf<Obj extends Record<KT, any>, KT extends string = string> = TSTB.Union.ListOf<keyof Obj>

// export type ValsAt<Obj extends Record<string, any>, Keylist extends readonly (keyof Obj)[]> =
//   Keylist extends readonly [infer Currkey, ...infer Restkeys]
//     ? Restkeys extends readonly (keyof Obj)[]
//       ? [Obj[Currkey & keyof Obj], ...ValsAt<Obj, Restkeys>]
//       : never
//     : []
// export type KVsAt<Obj extends Record<KT, any>, Keylist extends readonly KT[], KT extends string = string> =
//   Keylist extends readonly [infer Currkey, ...infer Restkeys]
//     ? Restkeys extends KT[]
//       ? [[Currkey, Obj[Currkey & KT]], ...KVsAt<Obj, Restkeys>]
//       : never
//     : []
// export type EntriesOf<Obj extends Record<KT, any>, KT extends string = string, Keylist extends KeysOf<Obj, KT> = KeysOf<Obj, KT>> =
//   Record<never, unknown> extends Obj
//     ? []
//     : KVsAt<Obj, Keylist>
// export type ValuesOf<Obj extends Record<KT, any>, KT extends string = string, Keylist extends KeysOf<Obj, KT> = KeysOf<Obj, KT>> =
//   Record<never, unknown> extends Obj
//     ? []
//     : ValsAt<Obj, Keylist>
//

/*
 * Scrub undefined from a union type
 */
export type Defined<VT> = VT extends undefined ? never : VT

/*
 * Testing Helpers
 */

/** Use as
 *  const __ckConst1 = [[1, 1], [true, true]] as const
 *  type  __ckConst2 = CheckTests<typeof __ckConst1>
 *  type  __ckTypes1 = [[CrazyDerivedType<...>, string], [...]]
 *  type  __ckTypes2 = CheckTests<__ckTypes1>
 *
 * The quality of these goes down sharply if your tsconfig has lax settings.
 */
export type CheckTests<Tests extends readonly unknown[]>  = AllTestsPassed<EqualPairs<Tests>>

// true if all tests pass, the failing pairs otherwise
// I think CheckTests is this but better but I could be wrotn -- if that is
// having trouble showing you an answer try this
export type AsExpected<Tests extends readonly unknown[]> = EqualPairs<Tests> extends true[] ? true : EqualPairs<Tests>

// True if it is an array of all 'true' values
export type AllTestsPassed<Tests> = Tests extends true[] ? true : Tests

// For each [actual, wanted] pair in the array:
// * true if IsEqual<actual, wanted>
// * ['unequal', actual, wanted] if they are not equal
// * a warning if it's not a 2-element tuple
export type EqualPairs<Tests extends readonly unknown[]> =
  Tests extends readonly [infer First, ...infer Rest]
    ? First extends [infer A, infer B, ...infer R2] | readonly [infer A, infer B, ...infer R2]
      ? IsEqual<A, B> extends (R2[1] extends boolean ? R2[1] : true) // supply "false" to demand they are unequal
        ? EqualPairs<Rest>
        : [['oops', A, B, ...R2], ...EqualPairs<Rest>]
      : [['not an [actual, wanted] pair', First], ...EqualPairs<Rest>]
    : [true]

// Leaving this older version in, as sometime having fancy features makes typescript bork
export type EqualPairsBasic<Tests extends readonly unknown[]> =
  Tests extends readonly [infer First, ...infer Rest]
    ? First extends [infer A, infer B] | readonly [infer A, infer B]
      ? IsEqual<A, B> extends true
        ? EqualPairs<Rest>
        : [['unequal', A, B], ...EqualPairs<Rest>]
      : [['not an [actual, wanted] pair', First], ...EqualPairs<Rest>]
    : []

export type Expect<VT      extends true>  = VT
export type ExpectTrue<VT  extends true>  = VT
export type ExpectFalse<VT extends false> = VT
export type IsTrue<VT      extends true>  = VT
export type IsFalse<VT     extends false> = VT
export type XExpect<VT> = VT // for debugging only

// How the diff thing works:
// ```
// export type ClashingFields<AA, BB> = {
//   [K in keyof AA & keyof BB as AA[K] extends BB[K]
//     ? (BB[K] extends AA[K] ? never : K)
//     : K]: [AA[K], BB[K]]
// }
// ```
// 1. **`keyof AA & keyof BB`**:
//    - Iterates over the keys that exist in both `AA` and `BB`.
// 2. **Conditional Type**:
//    - For each key `K`, compare the type of `AA[K]` and `BB[K]`.
//    - If `AA[K]` is assignable to `BB[K]` **and** `BB[K]` is assignable to `AA[K]`, then the types match, so exclude `K` using `never`.
//    - Otherwise, include `K` in the resulting type.
// 3. **Mapped Type**: The `[K in keyof AA & keyof BB as ...]` syntax maps over the keys and filters them based on the conditional type logic.
// 4. **Output Type**: The resulting object contains only the keys where `AA[K]` and `BB[K]` differ.
//
export type ClashingFields<AA, BB> = {
  [K in keyof AA & keyof BB as AA[K] extends BB[K]
    ? (BB[K] extends AA[K] ? never : K)
    : K]: [AA[K], BB[K]]
}
export type AOnlyFieldNames<AA, BB> = Exclude<keyof AA, keyof BB>
export type BOnlyFieldNames<AA, BB> = Exclude<keyof BB, keyof AA>
export type AOnlyFields<AA, BB> = { [KT in Exclude<keyof AA, keyof BB>]: [AA[KT], 'aonly'] }
export type BOnlyFields<AA, BB> = { [KT in Exclude<keyof BB, keyof AA>]: ['bonly', BB[KT]] }
export type TSDiff<AA, BB> = Debug<AOnlyFields<AA, BB> &  BOnlyFields<AA, BB> & ClashingFields<AA, BB>>

export type SimplePropertyNames<OT> = { [K in keyof OT]: OT[K] extends Function ? never : K }[keyof OT] & string // eslint-disable-line @typescript-eslint/ban-types

export type MergeInsertions<VT> =
  VT extends object
    ? { [K in keyof VT]: MergeInsertions<VT[K]> }
    : VT

export type Alike<X, Y> = IsEqual<MergeInsertions<X>, MergeInsertions<Y>>

export type ExpectExtends<VALUE, EXPECTED> = EXPECTED extends VALUE ? true : false
export type ExpectValidArgs<FUNC extends (...args: any[]) => any, ARGS extends any[]> = ARGS extends Parameters<FUNC>
  ? true
  : false

export type  AextendsB<AA, BB>  =  AA extends BB ? true : false
export type  TSCompare<AA, BB> = [AA extends BB ? true : false, BB extends AA ? true : false, IsEqual<AA, BB>]

export type IsEqual<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false
export type NotEqual<X, Y> = true extends IsEqual<X, Y> ? false : true

// https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
export type IsAny<VT>  = 0    extends (1 & VT)  ? true : false
export type NotAny<VT> = true extends IsAny<VT> ? false : true

export type ConflictingKeys<T, U> = {
  [K in keyof T & keyof U]: T[K] extends U[K] ? never : K
}[keyof T & keyof U]

export type ConflictingFields<T, U> = Pick<T & U, ConflictingKeys<T, U>>

export type Debug<VT>  = { [K in keyof VT]: VT[K] }
export type Bake<VT>   = { [K in keyof VT]: VT[K] }

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type PrefixCapfirst<prefix extends string, thingName extends string> = `${prefix}${Capitalize<thingName>}`

export type UnderscoreType<TNT> =
  TNT extends `${infer A}${infer Rest}`          // ?? More than one character?
    ? Rest extends Uncapitalize<Rest>            // ?? Abxxx or abxxx?
      ? `${Lowercase<A>}${UnderscoreType<Rest>}` //    => Abxxx or abxxx => abxxx
      : A extends Capitalize<A>                  // ?? ABxxx
        ? Rest extends `${infer B}${infer Tail}` // ?? three letters?
          ? Tail extends Capitalize<Tail>      // ?? ABcxx
            ? `${Lowercase<A>}${UnderscoreType<Rest>}`
            : `${Lowercase<A>}_${Lowercase<B>}${UnderscoreType<Tail>}` // ABcxx => a_b<cxx>
          : `${Lowercase<A>}${Lowercase<Rest>}`
        : `${Lowercase<A>}_${UnderscoreType<Rest>}`
    : TNT

export type Casing = 'Cap' | 'uncap' | 'UP' | 'low' | 'keep'
export type Recase<T extends string, CC extends Casing> =
  | CC extends 'Cap' ? Capitalize<T> : CC extends 'uncap' ? Uncapitalize<T>
    : CC extends 'UP'  ? Uppercase<T>  : CC extends 'low'   ? Lowercase<T>
      : CC extends 'keep' ? T : `WeirdShouldNotGetHere${T}`

const CamelSpecialsVals = (
  [
    'ASIN',             'DID',              'ID',               'ISODuration',
    'GUID',             'HSL',              'HSLA',
    'IBAN',             'ISBN',             'JWT',              'MAC',              'RGB',              'RGBA',
    'UUID',             'JSON',             'URL',
    //
    'DNA',
  ] as const
)
type SpecialCasing = typeof CamelSpecialsVals[number]
export type TypeSuffixes = 'Connection' | 'DNA' | 'Core' | 'Inst' | 'Dry' | 'Full'

export type RecaseUpperSpecials<T extends string, CC extends Casing = 'keep'> =
  Uppercase<T> extends SpecialCasing
    ? Uppercase<T>
    : Uppercase<T> extends `${SpecialCasing}S`
      ? Lowercase<T> extends `${infer Seg}s`
        ? `${Uppercase<Seg>}s`
        : 'OOPS'
      : Recase<T, CC>

export type CamelUnderscoredType<TNT extends string, CC extends 'Cap' | 'uncap' | 'keep' = 'Cap'> =
  TNT extends '_' ? '_' : TNT extends SpecialCasing ? TNT : TNT extends `${infer A}_${infer B}`
    ? `${A extends '' ? '_' : RecaseUpperSpecials<A, CC>}${B extends '' ? '_' : CamelType<B, 'Cap'>}`
    : RecaseUpperSpecials<TNT, CC>

export type CamelType<TNT extends string, CC extends 'Cap' | 'uncap' | 'keep' = 'Cap'> =
  TNT extends SpecialCasing
    ? TNT
    : TNT extends `${infer Body}_${TypeSuffixes}`
      ? TNT extends `${Body}_${infer SS}` ? `${CamelType<Body, CC>}${SS}` : `OOPS: ${TNT} ${Body}`
      : TNT extends `${infer Body}${TypeSuffixes}`
        ? TNT extends `${Body}${infer SS}` ? `${CamelType<Body, CC>}${SS}` : `OOPS: ${TNT} ${Body}`
        : CamelUnderscoredType<UnderscoreType<TNT>, CC>

export type SnakeType<KT extends string> = CamelType<KT, 'uncap'>

export type CompareTypes<TA, TB> = [Exclude<TA, TB>, Exclude<TB, TA>]

/*
 * Turns A | B | C into A & B & C -- use when eg flattening a bag of bags
 */
export type FlattenBagbag1<U> = (
  U extends U ? (u: U) => 0 : never
) extends (i: infer I) => 0 ? Extract<I, U> : never
export type FlattenBagbag<U> = Simplify<FlattenBagbag1<U>>

export type U2I<U> = FlattenBagbag<U>

export type EqualStrPairs<Tests extends readonly unknown[]> =
  Tests extends readonly [infer First, ...infer Rest]
    ? First extends [infer A, infer B, infer C] | [infer A, infer B]
      ? IsEqual<A, B> extends true
        ? EqualStrPairs<Rest>
        : [['unequal', Exclude<A, B>, Exclude<B, A>, C], ...EqualStrPairs<Rest>]
      : [['not an [actual, wanted] pair', First], ...EqualStrPairs<Rest>]
    : []
