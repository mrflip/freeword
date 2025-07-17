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

// Extend StorageResult gist for Filer/file actions
export type FilerGist =
  | 'ok' | 'fsErr' | 'pathErr' | 'writeErr' | 'readErr' | 'fileNotFound' | 'badPath' | 'badInput' | 'blankPath'
  | 'callerErr'
  | 'storageErr' | 'otherErr' | 'badStorekeyErr' | 'mistypeErr' | 'stringifyErr' | 'skipped' | 'parseErr' | 'noLocalStorageErr' | 'noBrowser' | 'ready'


// Have a set of these that are, or extend, their StorageResult counterparts
export interface FilerResult<VT = any> extends Omit<Partial<PathinfoT>, 'ok'> {
  ok:          boolean
  gist?:       FilerGist
  val?:        VT
  err?:        ExtError
  raw?:        any
  tmi?: Record<string, any>
}

export type Abspath = string
export type Relpath = string
export type Pathname = Relpath | Abspath
export type Anypath = PathinfoDNA | Pathname

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

export type CoreReadGist  = 'readErr' | 'fileNotFound' | 'badPath' | 'badInput' | 'blankPath'
export type CoreWriteGist = 'writeErr' | 'fsErr' | 'badPath' | 'badInput' | 'blankPath' | 'parseErr'
export interface GoodFilerReadResult<VT = PathinfoT> extends GoodFilerPathedResult<VT> {}
export interface BadFilerReadResult<GT extends CoreReadGist> extends BadFilerResult<GT> {}

export interface GoodFilerWriteResult<VT = PathinfoT> extends GoodFilerPathedResult<VT> {}
export interface BadFilerWriteResult<GT extends CoreWriteGist> extends BadFilerResult<GT> {}

export interface GoodFilerMkdirResult extends GoodFilerPathedResult<PathinfoT> {}
export interface BadFilerMkdirResult extends BadFilerResult<'fsErr' | 'badPath' | 'badInput' | 'blankPath'> {}

// Union types for discriminated unions
export type FilerOtherResult<VT = any, GT extends FilerGist = FilerGist> = GoodFilerResult<VT> | BadFilerResult<GT>
export type FilerReadResult<VT = PathinfoT, GT extends CoreReadGist = CoreReadGist>  = GoodFilerReadResult<VT>  | BadFilerReadResult<GT>
export type FilerWriteResult<VT = PathinfoT, GT extends CoreWriteGist = CoreWriteGist> = GoodFilerWriteResult<VT> | BadFilerWriteResult<GT>
export type FilerMkdirResult = GoodFilerMkdirResult | BadFilerMkdirResult
