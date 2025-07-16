import      _                                /**/ from 'lodash'
import NodeFSP                                    from 'node:fs/promises'
import PathUtils                                  from 'node:path'
// import   * as UF                               from './UF.ts'
import type * as TY                               from '../types.ts'
import type * as FT                               from './FilerTypes.ts'

/**
 * Helper function to create consistent bad outcomes
 * @param err - The error to wrap
 * @param gist - The gist of the error (e.g. 'badPath', 'badInput', 'blankPath')
 * @param preambleMsg - A message to prepend to the error message
 * @param errExtensions - Additional error extensions to add to the error
 * @param pathinfo - The pathinfo object to add to the error
 */
function badOutcome<GT extends FT.FilerGist = FT.FilerGist>(err: Error, gist: GT, preambleMsg: string, errExtensions: TY.AnyBag, pathinfo:  FT.PathinfoT): FT.BadFilerResult<GT>
function badOutcome<GT extends FT.FilerGist = FT.FilerGist>(err: Error, gist: GT, preambleMsg: string, errExtensions: TY.AnyBag, pathinfo?: FT.PathinfoT | undefined): FT.BadFilerResult<GT>
function badOutcome<GT extends FT.FilerGist = FT.FilerGist>(err: Error, gist: GT, preambleMsg: string, errExtensions: TY.AnyBag, pathinfo?: FT.PathinfoT | undefined): FT.BadFilerResult<GT> {
  const origMsg = err.message
  const extError: TY.ExtError = new Error(`${preambleMsg}: ${origMsg}`) as TY.ExtError
  const extensions: Omit<FT.BadFilerResult<GT>, 'err'> = {
    ...(pathinfo || {}),
    ...errExtensions,
    ok: false,
    gist,
    origMsg,
  }
  extError.extensions = extensions
  return { ...extensions, err: extError }
}

/**
 * Creates directory recursively
 * @param anypath - The pathname or pathinfo of the directory to create -- the `abspath` is used and NOT the `dirpath`
 * @returns a GoodFilerMkdirResult or a BadFilerMkdirResult
 */
export async function mkdirp(anypath: FT.Anypath): Promise<FT.FilerMkdirResult> {
  const pathinfo = pathinfoFor(anypath)
  if (! pathinfo.ok) { return pathinfo }
  try {
    await NodeFSP.mkdir(pathinfo.dirpath, { recursive: true })
    return { ...pathinfo, ok: true, gist: 'ok', val: pathinfo }
  } catch (err) {
    return badOutcome(err as Error, 'fsErr', 'Failed to create directory', { args: anypath }, pathinfo)
  }
}

/**
 * Given a pathinfo object, assemble the absolute path
 */
export function _abspathForPathparts(pathinfo: Pick<FT.PathinfoT, 'dirpath' | 'barename' | 'fext'>): FT.Abspath {
  const dirpathStr  = (typeof pathinfo.dirpath  === 'string') ? pathinfo.dirpath.trim() : pathinfo.dirpath
  const barenameStr = (typeof pathinfo.barename === 'string') ? pathinfo.barename.trim() : pathinfo.barename
  if (! dirpathStr || ! barenameStr) { const outcome = badOutcome(new Error('Blank path provided'), 'blankPath', 'Blank path is not a reasonable input', { args: { pathinfo } }); throw outcome.err }
  const filename = pathinfo.fext ? `${barenameStr}${pathinfo.fext}` : barenameStr
  try {
    return PathUtils.resolve(dirpathStr, filename)
  } catch (err) {
    const outcome = badOutcome(err as Error, 'badPath', 'Failed to resolve path', { args: { pathinfo } })
    throw outcome.err
  }
}

/**
 * Converts a plain pathname to an absolute path
 */
export function _abspathForPathname(pathname: FT.Pathname): FT.Abspath {
  const pathnameStr = (typeof pathname === 'string') ? pathname.trim() : pathname
  if (! pathnameStr) {
    const outcome = badOutcome(new Error('Blank path provided'), 'blankPath', 'Blank path is not a reasonable input', { args: { pathname } })
    throw outcome.err
  }
  try {
    return PathUtils.resolve(pathnameStr)
  } catch (err) {
    const outcome = badOutcome(err as Error, 'badPath', 'Failed to resolve path', { args: { pathname } })
    throw outcome.err
  }
}

/** Assemble pathinfo using a (possibly relative) dirpath, a barename and a file extension
 * @param pathinfo - The pathinfo dna to assemble
 *   dirpath  - The directory path (relative or absolute)
 *   barename - The base name of the file (without extension)
 *   fext     - The file extension (including the dot)
 * @returns A complete pathinfo object, with abspath and dirpath resolved
 */
export function pathinfoFor(anypath: FT.Anypath): FT.PathinfoT | FT.BadFilerResult<'badPath' | 'badInput' | 'blankPath'> {
  const pathnameStr = (typeof anypath === 'string') ? anypath.trim() : anypath
  if (! pathnameStr) {
    return badOutcome(new Error('Blank path provided'), 'blankPath', 'Blank path is not a reasonable input', { args: { anypath } })
  }
  try {
    const abspath = (typeof anypath === 'string') ? _abspathForPathname(anypath) : _abspathForPathparts(anypath)
    const dirpath  = PathUtils.dirname(abspath)
    const basename = PathUtils.basename(abspath)
    const fext     = PathUtils.extname(basename)
    const barename = fext ? basename.slice(0, (- fext.length)) : basename
    return {
      ok:   true,
      barename,
      fext,
      dirpath,
      abspath,
    }
  } catch (err) {
    return badOutcome(err as Error, 'badPath', 'Failed to parse path', { anypath })
  }
}

/**
 * Async generator that reads a file and yields each line
 * Returns AsyncGenerator<string, FilerReadResult, unknown>
 */
export async function* starlines(anypath: FT.Anypath): AsyncGenerator<string, FT.FilerReadResult<FT.PathinfoT, FT.CoreReadGist>, unknown> {
  const pathinfo = pathinfoFor(anypath)
  if (! pathinfo.ok) { return pathinfo }
  let fileHandle
  try {
    fileHandle = await NodeFSP.open(pathinfo.abspath, 'r')
  } catch (err) {
    return badOutcome(err as Error, 'readErr', 'Issue opening file', { args: anypath }, pathinfo)
  }
  try {
    const buffer = Buffer.alloc(4096)
    let leftover = ''
    while (true) {
      const { bytesRead } = await fileHandle.read(buffer, 0, buffer.length, null)
      if (bytesRead === 0) { break }
      const chunk = leftover + buffer.toString('utf8', 0, bytesRead)
      const lines = chunk.split('\n')
      leftover = lines.pop()!
      // Yield all complete lines except the last one (which might be incomplete)
      for (const line of lines) {
        try {
          yield line
        } catch (err) {
          const outcome = badOutcome(err as Error, 'callerErr', 'Error processing line', { filepath: pathinfo.abspath, args: anypath })
          throw outcome.err
        }
      }
    }
    // Yield the final line if there's anything left
    if (leftover) {
      try {
        yield leftover
      } catch (err) {
        const outcome = badOutcome(err as Error, 'callerErr', 'Error processing final line', { filepath: pathinfo.abspath, args: anypath })
        throw outcome.err
      }
    }
  } finally {
    await fileHandle.close()
  }
  return { ...pathinfo, ok: true, gist: 'ok', val: pathinfo }
}

/**
 * Creates directory and writes each line from an iterable/async iterable to a file
 * Returns FilerResult<PathinfoT>
 */
export async function dumptext(anypath: FT.Anypath, lines: Iterable<string> | AsyncIterable<string>): Promise<FT.FilerWriteResult<FT.PathinfoT, 'writeErr' | 'fsErr' | 'badPath' | 'badInput' | 'blankPath'>> {
  const pathinfo = pathinfoFor(anypath)
  if (! pathinfo.ok) {return pathinfo }
  const mkdirResult = await mkdirp({ ...pathinfo, abspath: pathinfo.dirpath })
  if (! mkdirResult.ok) { return mkdirResult }
  try {
    const fileHandle = await NodeFSP.open(pathinfo.abspath, 'w')
    try {
      for await (const line of lines) {
        await fileHandle.write(line + '\n')
      }
    } finally {
      await fileHandle.close()
    }
    return { ...pathinfo, ok: true, gist: 'ok', val: pathinfo }
  } catch (err) {
    return badOutcome(err as Error, 'writeErr', 'Failed to write file', { args: anypath }, pathinfo)
  }
}

/**
 * Pretty prints JSON and calls dumptext. Returns FilerResult<PathinfoT>
 */
export async function dumpjson(anypath: FT.Anypath, data: any): Promise<FT.FilerWriteResult<FT.PathinfoT, FT.CoreWriteGist>> {
  let jsonString: string
  try {
    jsonString = JSON.stringify(data, null, 2)
  } catch (err) {
    return badOutcome(err as Error, 'parseErr', 'Failed to stringify data to JSON', { args: anypath })
  }
  return await dumptext(anypath, [jsonString])
}
