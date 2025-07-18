import type * as TY from '../types.ts'

/**
 * Helper function to create bad outcomes with consistent structure
 * @param err - The error to wrap
 * @param gist - The gist of the error (e.g. 'badPath', 'badInput', 'blankPath')
 * @param preambleMsg - A message to prepend to the error message
 * @param tmi - Additional error extensions to add to the error
 */
export function badOutcome<GT extends string = string>(preambleMsg: string, gist: GT, err?: Error | undefined, tmi?: TY.AnyBag | undefined): TY.BadOutcome<GT> {
  const extError = (err ?? throwable(preambleMsg, gist, tmi)) as TY.ExtError
  if (err) {
    const origmsg = err.message
    extError.message = `${preambleMsg}: ${origmsg}`
    extError.extensions = { ...tmi, origmsg, gist }
  }
  const result = { ok: false, gist, err: extError } as TY.BadOutcome<GT>
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
  Error.captureStackTrace?.(extError, throwable)
  return extError
}