import type { ExtError } from '../types.ts'

// Pathinfo types for Filer and file utilities
export interface PathinfoDNA {
  barename: string
  fext:     string
  dirpath:  string  // In a true pathinfo, this is absolute
  abspath?: string
}
export interface PathinfoT {
  barename: string
  fext:     string
  dirpath:  string  // In a true pathinfo, this is absolute
  abspath:  string
  ok:       true
}

export type CoreFileGist  = 'badPath' | 'badInput' | 'blankPath' | 'parseErr' | 'pathErr' | 'fsErr'
export type CoreReadGist  = | CoreFileGist | 'readErr'  | 'fileNotFound' | 'decompressErr' | 'consumeErr'
export type CoreWriteGist = | CoreFileGist | 'writeErr'
// Extend StorageResult gist for Filer/file actions
export type FilerGist =
  | 'ok'
  | CoreReadGist | CoreWriteGist
  | 'callerErr'
  | 'storageErr' | 'otherErr' | 'badStorekeyErr' | 'mistypeErr' | 'stringifyErr' | 'skipped' | 'noLocalStorageErr' | 'noBrowser' | 'ready'


// Have a set of these that are, or extend, their StorageResult counterparts
export interface FilerResult<VT = any> extends Omit<Partial<PathinfoT>, 'ok'> {
  ok:          boolean
  gist?:       FilerGist
  val?:        VT
  err?:        ExtError
  raw?:        any
  tmi?: Record<string, any>
}

/** Absolute pathstring (starts at the root directory, all symlinks resolved) */
export type Abspath   = string
/** Absolute directory pathstring (starts at the root directory, all symlinks resolved, is a directory) */
export type Dirpath   = string
/** A relative pathstring (may or may not be absolute) */
export type Relpath   = string
/** The bare basename of a path, without the extension or directory; this should be the filename with the elements following the last dot removed (after first removing any compression extension eg. `.gz`) */
export type Barename  = string
/** The extension of a filename, without the dot; this should have all letters following the last dot, including a compression extension eg. `.gz` */
export type Fext      = string
/** The basename of a path, including the extension, without the directory */
export type Basename  = string
/** A pathstring, absolute or relative */
export type Pathname  = Relpath | Abspath
/** A pathstring or a partial pathinfo */
export type Anypath   = PathinfoDNA | Pathname

// Explicit Filer result types that extend StorageResult counterparts
export interface GoodFilerResult<VT = any> extends FilerResult<VT> {
  ok:    true
  gist:  'ok'
  val:   VT
}
export interface GoodFilerPathedResult<VT = any> extends Omit<GoodFilerResult<VT>, keyof PathinfoT>, Omit<PathinfoT, 'ok'> {
  ok:    true
}

export interface BadFilerResult<GT extends FilerGist = FilerGist> extends FilerResult<never> {
  ok:       false
  gist:     GT
  err:      ExtError
  val?:     never
  origmsg?: string
}

export interface GoodFilerReadResult<VT = PathinfoT> extends GoodFilerPathedResult<VT> {}
export interface BadFilerReadResult<GT extends CoreReadGist> extends BadFilerResult<GT> {}

export interface GoodFilerWriteResult<VT = PathinfoT> extends GoodFilerPathedResult<VT> {}
export interface BadFilerWriteResult<GT extends CoreWriteGist> extends BadFilerResult<GT> {}

export interface GoodFilerMkdirResult extends GoodFilerPathedResult<PathinfoT> {}
export interface BadFilerMkdirResult extends BadFilerResult<'fsErr' | 'badPath' | 'badInput' | 'blankPath'> {}

// Union types for discriminated unions
export type FilerOtherResult<VT = any, GT extends FilerGist = FilerGist> = GoodFilerResult<VT> | BadFilerResult<GT>
export type FilerReadResult<VT  = PathinfoT, GT extends CoreReadGist  = CoreReadGist,  AlsoVT extends object = {}> = GoodFilerReadResult<VT>  & AlsoVT | BadFilerReadResult<GT>
export type FilerWriteResult<VT = PathinfoT, GT extends CoreWriteGist = CoreWriteGist, AlsoVT extends object = {}> = GoodFilerWriteResult<VT> & AlsoVT | BadFilerWriteResult<GT>
export type FilerMkdirResult = GoodFilerMkdirResult | BadFilerMkdirResult
