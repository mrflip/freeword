// == [Utility Types] -- broadly useful types

/** Lookup table / dictionary of generic properties */
export type Bag<VT> = Record<string, VT>
/** Generic bag of properties */
export type AnyBag = Bag<any>
/** Bag of strings */
export type StrBag = Bag<string>
/** String or we'll figure it out for you */
export type StringMaybe = string | null | undefined
/** A string that starts with [a-zA-Z] and has only [a-zA-Z0-9_] */
export type Fieldname = string // & { _: 'Fieldname' }

export interface ExtError extends Error {
  extensions: AnyBag,
}

/**
 * Omit the statics of a class, and replace them with the given replacement.
 * because TS is effed in the head and has a stupid type system for static methods
 * @param T - The class to omit the statics of.
 * @param Replacement - The replacement to use for the statics.
 * @returns The class with the statics omitted and replaced.
 */
export type OmitStatics<T, Replacement> =
  T extends { new(...args: infer CtorArgs): infer BaseInstanceT }
    ? Omit<T, keyof Replacement> & Replacement & {
      new(...args:  CtorArgs): BaseInstanceT
    }
    : Omit<T, keyof Replacement>

/** A type that can be an AsyncIterable or an Iterable */
export type AnyIterable<VT> = AsyncIterable<VT> | Iterable<VT>

// --