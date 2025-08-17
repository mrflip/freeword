import type { AnyBag }                            from './PrimTypeAliases.ts'

// == [Utility Types] -- broadly useful types

// Have a set of these that are, or extend, their StorageResult counterparts
export interface Outcome<VT = any, GT extends string = string> {
  /** Can the result be trusted (that is, were there no unexpected issues?) */
  ok:          boolean
  /** A message about the outcome, if any */
  msg?:        string      | undefined
  /** What was achieved / what went wrong / what was the final state, if known? */
  gist?:       GT          | undefined
  /** Return value of a GoodOutcome; absent in a BadOutcome */
  val?:        VT          | undefined
  /** Summary of the input to the process */
  given?:      any         | undefined
  /** the error that occurred, if it is a BadOutcome */
  err?:        ExtError | undefined
  /** Additional information about the process outcome */
  tmi?:        Record<string, any> | undefined
}

export interface BadOutcome<GT extends string = string> extends Outcome<never, GT> {
  /** False: the result cannot be trusted, as there were unexpected issues */
  ok:       false
  /** What went wrong / what was the final state, if known? */
  gist:     GT
  /** the throwable error that occurred, if it is a BadOutcome.
   * err.tmi holds the tmi, gist, and the original error's message (as origmsg)
   */
  err:      ExtError
  /** Return value of a GoodOutcome; absent in a BadOutcome */
  val?:     never
}

/** result can be trusted: but val is strongly typed and nothing broke.
 * You might not like the result -- eg 'we successfully retrieved a 404 missing result' --
 * but the code worked as expected. */
export interface GoodOutcome<VT = any, GT extends string = string> extends Outcome<VT, GT> {
  /** True, since the result can be trusted (that is, were there no unexpected issues) */
  ok:       true
  val:      VT
  err?:     never
}

export interface ExtError extends Error {
  /** Additional information about the process. Compatible with typing of BadOutcome but otherwise unrestricted */
  extensions: AnyBag & {
    ok?: boolean, gist?: string | undefined, origmsg?: string | undefined, given?: any | undefined,
    message?: string, name?: string, stack?: string,
  }
  code?: string
}

/** A type that can be an Iterable, Iterator, or Generator */
export type AnySyncIterable<VT, RT = any>  = Iterable<VT> | Iterator<VT> | Generator<VT, RT, VT | undefined>
/** A type that can be an AsyncIterable, AsyncIterator, or AsyncGenerator */
export type AnyAsyncIterable<VT, RT = any> = AsyncIterable<VT> | AsyncIterator<VT> | AsyncGenerator<VT, RT, VT | undefined>
/** A type that can be an AsyncIterable or an Iterable */
export type AnyIterable<VT, RT = any>      = AnySyncIterable<VT, RT> | AnyAsyncIterable<VT, RT>

// --