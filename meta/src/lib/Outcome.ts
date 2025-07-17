import type * as TY from '../types.ts'

// Have a set of these that are, or extend, their StorageResult counterparts
export interface Outcome<VT = any, GT extends string = string> {
  /** Can the result be trusted (that is, were there no unexpected issues?) */
  ok:          boolean
  /** What was achieved / what went wrong / what was the final state, if known? */
  gist?:       GT          | undefined
  /** Return value of a GoodOutcome; absent in a BadOutcome */
  val?:        VT          | undefined
  /** Summary of the input to the process */
  given?:      any         | undefined
  /** the error that occurred, if it is a BadOutcome */
  err?:        TY.ExtError | undefined
  /** Additional information about the process outcome */
  tmi?:        Record<string, any> | undefined
}
export interface BadOutcome<GT extends string = string> extends Outcome<never, GT> {
  /** False: the result cannot be trusted, as there were unexpected issues */
  ok:       false
  /** What went wrong / what was the final state, if known? */
  gist:     GT
  /** the throwable error that occurred, if it is a BadOutcome.
   * err.extensions holds the tmi, gist, and the original error's message (as origmsg)
   */
  err:      TY.ExtError
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

/**
 * Helper function to create bad outcomes with consistent structure
 * @param err - The error to wrap
 * @param gist - The gist of the error (e.g. 'badPath', 'badInput', 'blankPath')
 * @param preambleMsg - A message to prepend to the error message
 * @param tmi - Additional error extensions to add to the error
 */
export function badOutcome<GT extends string = string>(preambleMsg: string, gist: GT, err?: Error | undefined, tmi?: TY.AnyBag | undefined): BadOutcome<GT> {
  const extError = (err ?? throwable(preambleMsg, gist, tmi)) as TY.ExtError
  if (err) {
    const origmsg = err.message
    extError.message = `${preambleMsg}: ${origmsg}`
    extError.extensions = { ...tmi, origmsg, gist }
  }
  const result = { ok: false, gist, err: extError } as BadOutcome<GT>
  if (tmi) {
    // we're going to all this trouble so we may distinguish
    // between given=undefined and "don't include given in this report"
    // it also is more convenient to let it bubble up to the caller,
    // and less likely to be swapped with tmi in the args
    const { given, ...restTMI } = tmi
    if ('given' in tmi)   { result.given = given }
    if (Object.keys(restTMI).length > 0) { result.tmi = restTMI }
  }
  return result
}
export function throwable<GT extends string = string>(msg: string, gist: GT, tmi?: TY.AnyBag | undefined): TY.ExtError {
  const extError      = new Error(msg) as TY.ExtError
  extError.extensions = { ...tmi, gist }
  return extError
}