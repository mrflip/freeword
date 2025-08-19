import      _                                /**/ from 'lodash'
import readline                                   from 'node:readline'
import { Readable }                               from 'node:stream'
import * as Zlib                                  from 'node:zlib'
import NodeFS                                     from 'node:fs'
import NodeFSP                                    from 'node:fs/promises'
import PathUtils                                  from 'node:path'
import   * as UF                                  from '../utils/UF.ts'
import type * as TY                               from '../types/index.ts'
import type * as FT                               from '../types/FilerTypes.ts'
import { throwable } from '../utils/OutcomeUtils.ts'

/**
 * Helper function to create consistent bad outcomes
 * @param err - The error to wrap
 * @param gist - The gist of the error (e.g. 'badPath', 'badInput', 'blankPath')
 * @param preambleMsg - A message to prepend to the error message
 * @param tmi - Additional error extensions to add to the error
 * @param pathinfo - The pathinfo object to add to the error
 */
function badOutcome<GT extends FT.FilerGist = FT.FilerGist>(err: Error, gist: GT, preambleMsg: string, tmi: TY.AnyBag, pathinfo:  FT.PathinfoT): FT.BadFilerResult<GT>
function badOutcome<GT extends FT.FilerGist = FT.FilerGist>(err: Error, gist: GT, preambleMsg: string, tmi: TY.AnyBag, pathinfo?: FT.PathinfoT | undefined): FT.BadFilerResult<GT>
function badOutcome<GT extends FT.FilerGist = FT.FilerGist>(err: Error, gist: GT, preambleMsg: string, tmi: TY.AnyBag, pathinfo?: FT.PathinfoT | undefined): FT.BadFilerResult<GT> {
  const origmsg = err.message
  const extError: TY.ExtError = new Error(`${preambleMsg}: ${origmsg}`) as TY.ExtError
  const errTMI: Omit<FT.BadFilerResult<GT>, 'err'> = {
    ...(pathinfo || {}),
    ...tmi,
    ok: false,
    gist,
    origmsg,
  }
  extError.extensions = errTMI
  return { ...errTMI, err: extError }
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
export function _abspathForPathparts(pathinfo: Pick<FT.PathinfoT, 'dirpath' | 'barename' | 'fext'>, ...pathsegs: TY.StringMaybe[]): FT.Abspath {
  if (! _.isEmpty(pathsegs)) { const outcome = badOutcome(new Error('Cannot have path object and path segments'), 'badInput', 'Path segments are not a reasonable input', { args: { pathinfo, pathsegs } }); throw outcome.err }
  const dirpathStr  = (typeof pathinfo.dirpath  === 'string') ?  pathinfo.dirpath.trim() : pathinfo.dirpath
  const barenameStr = (typeof pathinfo.barename === 'string') ? pathinfo.barename.trim() : pathinfo.barename
  if (! dirpathStr || ! barenameStr) { const outcome = badOutcome(new Error('Blank path provided'), 'blankPath', 'Blank path is not a reasonable input', { args: { pathinfo } }); throw outcome.err }
  const filename = pathinfo.fext ? `${barenameStr}.${pathinfo.fext}` : barenameStr
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
export function _abspathForPathname(pathname: FT.Pathname, ...pathsegs: TY.StringMaybe[]): FT.Abspath {
  const pathnameStr = (typeof pathname === 'string') ? pathname.trim() : pathname
  if (! pathnameStr) {
    const outcome = badOutcome(new Error('Blank path provided'), 'blankPath', 'Blank path is not a reasonable input', { args: { pathname } })
    throw outcome.err
  }
  try {
    return PathUtils.resolve(pathnameStr, ...UF.scrubNil(pathsegs))
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
 * @param pathsegs - Additional path segments to append to the pathname
 * @returns A complete pathinfo object, with abspath and dirpath resolved
 */
export function pathinfoFor(anypath: FT.Anypath, ...pathsegs: TY.StringMaybe[]): FT.PathinfoT | FT.BadFilerResult<'badPath' | 'badInput' | 'blankPath'> {
  const pathnameStr = (typeof anypath === 'string') ? anypath.trim() : anypath
  if (! pathnameStr) {
    return badOutcome(new Error('Blank path provided'), 'blankPath', 'Blank path is not a reasonable input', { args: { anypath } })
  }
  try {
    const abspath = (typeof anypath === 'string') ? _abspathForPathname(anypath, ...pathsegs) : _abspathForPathparts(anypath, ...pathsegs)
    const dirpath  = PathUtils.dirname(abspath)
    const basename = PathUtils.basename(abspath)
    const fext     = PathUtils.extname(basename).slice(1)
    const barename = fext ? basename.slice(0, (-1 - fext.length)) : basename
    return {
      ok:        true,
      barename,
      fext,
      dirpath,
      abspath,
    }
  } catch (err) {
    return badOutcome(err as Error, 'badPath', 'Failed to parse path', { anypath })
  }
}

export function dirpathFor(anypath:  FT.Anypath): FT.Abspath  { return pathinfoFor(anypath).dirpath! }
export function abspathFor(anypath:  FT.Anypath): FT.Abspath  { return pathinfoFor(anypath).abspath! }
export function barenameFor(anypath: FT.Anypath): FT.Barename { return pathinfoFor(anypath).barename! }
export function fextFor(anypath:     FT.Anypath): FT.Fext     { return pathinfoFor(anypath).fext! }

export function __dirname(importMetaURL: TY.URLStr, ...relpaths: (TY.Relpath | undefined)[]): FT.Abspath {
  const callerpath = String(importMetaURL).replace(/^file:\/\//, '/')
  const pathinfo = pathinfoFor(PathUtils.dirname(callerpath), ...relpaths)
  if (! pathinfo.ok) { throw pathinfo.err }
  return pathinfo.abspath
}
export function __relname(importMetaURL: TY.URLStr, ...relpaths: (TY.Relpath | undefined)[]): FT.Abspath {
  return __dirname(importMetaURL, ...relpaths)
}

/**
 * Async generator that reads a file and yields each line
 * Returns AsyncGenerator<string, FilerReadResult, unknown>
 */
export async function* starlinesFiddly(anypath: FT.Anypath): AsyncGenerator<string, FT.FilerReadResult<FT.PathinfoT, FT.CoreReadGist>, unknown> {
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

function _openRawFilestream(anypath: FT.Anypath, { encoding = 'utf8' }: { encoding?: 'utf8' | 'utf16le' | 'binary' | null } = {}): FT.FilerReadResult<Readable, FT.CoreReadGist> {
  const pathinfo = pathinfoFor(anypath); if (! pathinfo.ok) { return pathinfo }
  try {
    const contentsStream = NodeFS.createReadStream(pathinfo.abspath, { encoding: encoding ?? undefined })
    return { ...pathinfo, gist: 'ok', ok: true, val: contentsStream }
  } catch (rawerr) {
    const err = rawerr as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      return badOutcome(err, 'fileNotFound', `Path ${pathinfo.abspath} is absent`, { args: anypath }, pathinfo)
    }
    return badOutcome(err as Error, 'readErr', 'Issue opening file', { args: anypath }, pathinfo)
  }
}

/** Opens a raw filestream with the (decompressed) file contents
 * @param anypath - The pathname or pathinfo of the file to open. If it ends in `.gz` or `.bz2` it will be decompressed
 * @returns A Readable stream or a BadFilerResult
 */
export function openFilestream(anypath: FT.Anypath): FT.FilerReadResult<Readable, FT.CoreReadGist> {
  const pathinfo = pathinfoFor(anypath); if (! pathinfo.ok) { return pathinfo }
  const encoding = /^(gz|bz2|zip)$/.test(pathinfo.fext) ? null : 'utf8'
  const contentsStream = _openRawFilestream(pathinfo, { encoding }); if (! contentsStream.ok) { return contentsStream }
  if (contentsStream.fext === 'gz') {
    return { ...contentsStream, val: contentsStream.val.pipe(Zlib.createGunzip()) }
  }
  if (contentsStream.fext === 'zip') {
    return { ...contentsStream, val: contentsStream.val.pipe(Zlib.createUnzip()) }
  }
  return contentsStream
}

export function openLinestream(anypath: FT.Anypath): FT.FilerReadResult<readline.Interface, FT.CoreReadGist> {
  const contentsStream = openFilestream(anypath); if (! contentsStream.ok) { return contentsStream }
  return { ...contentsStream, val: readline.createInterface({ input: contentsStream.val }) }
}

/**
 * Async generator that reads a file and yields each line
 * Returns AsyncGenerator<string, FilerReadResult, unknown>
 */
export async function* starlines(anypath: FT.Anypath): AsyncGenerator<string, FT.FilerReadResult<number, FT.CoreReadGist>, unknown> {
  const linestream = openLinestream(anypath) ; if (! linestream.ok) { throw linestream.err }
  let lineNumber = 0
  try {
    for await (const line of linestream.val) {
      lineNumber += 1
      try {
        yield line
      } catch (err) { throw throwable(`Upstream error at line ${lineNumber}`, 'callerErr', { line, lineNumber, filepath: linestream.abspath, args: anypath }, err)      }
    }
  } catch (err) {
    if (err.extensions?.gist === 'consumeErr') { throw err }
    if (err.code === 'ENOENT') {
      throw throwable(`Path ${linestream.abspath} is absent`, 'fileNotFound', { lineNumber, filepath: anypath, args: { anypath } }, err)
    }
    if (err.code === 'Z_DATA_ERROR') {
      throw throwable(`Decompression error ${anypath}:${lineNumber}`, 'compressErr', { lineNumber, filepath: anypath, args: { anypath } }, err)
    }
    throw throwable(`File read error ${anypath}:${lineNumber}`, 'consumeErr', { lineNumber, filepath: anypath, args: { anypath } }, err)
  } finally {
    if (linestream.val) { linestream.val.close() }
  }
  return { ...linestream, val: lineNumber }
}

const JSONKV_RE = /^\s*(?:([\}\]])\s*$|[\{\[,]\s*\t\s*("[^\t]*)\t\s*:\s*\t\s*(.*)|[\{\[,]\s*\t\s*(.*))$/

export async function* starjsonEntries<VT, KT extends string | number = number>(anypath: FT.Anypath): AsyncGenerator<[KT, VT, number], FT.FilerReadResult<number, FT.CoreReadGist | 'consumeErr'>, unknown> {
  let val: VT; let key: KT
  let lineNumber = 0
  const pathinfo = pathinfoFor(anypath) ; if (! pathinfo.ok) { throw pathinfo.err }
  for await (const line of starlines(pathinfo.abspath)) {
    lineNumber += 1
    const match = JSONKV_RE.exec(line)
    if (match?.[1]) { continue }
    const jskey   = match?.[2]
    const json    = match?.[3] ?? match?.[4] ?? line
    try {
      key = jskey ? JSON.parse(jskey) : (lineNumber - 1)
      val = JSON.parse(json)
    } catch (err) { throw throwable(`Failed to parse JSON at line ${lineNumber}`, 'parseErr', { line, lineNumber, filepath: anypath, args: { anypath } }, err) }
    try {
      yield [key, val, (lineNumber - 1)]
    } catch (err) { throw throwable(`Upstream error at line ${lineNumber}`, 'consumeErr', { val, line, lineNumber, filepath: anypath, args: { anypath } }, err) }
  }
  return { ...pathinfo, ok: true, gist: 'ok', val: lineNumber }
}
export function starjsonl<VT>(anypath: FT.Anypath): AsyncGenerator<VT,        void, unknown>
export function starjsonl<VT>(anypath: FT.Anypath): AsyncGenerator<null,      void, VT>
export function starjsonl(anypath: FT.Anypath): AsyncGenerator<any,           void, unknown>
export async function* starjsonl<VT>(anypath: FT.Anypath): AsyncGenerator<VT | null, void, VT> {
  for await (const [_key, val, _lineNumber] of starjsonEntries<VT>(anypath)) { yield val }
}
export async function* starjsonkeys<KT extends string | number = number>(anypath: FT.Anypath): AsyncGenerator<KT, void, KT> {
  for await (const [key, _val, _lineNumber] of starjsonEntries<any, KT>(anypath)) { yield key }
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
