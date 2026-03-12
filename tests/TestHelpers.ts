import      _                                /**/ from 'lodash'
import      { expect as jestExpect }          from '@jest/globals'
import      { UF }                            from '@freeword/meta'
//
export const IAMA_TESTHELPERS = true

export * as Examples from './fixtures/ExampleValues.ts'

export function see(objsIn: any, opts: UF.PrettifyOpts = {}) {
  console.warn(UF.prettify(objsIn, opts))
  return objsIn
}

export function checkSnapshot(results: any) {
  jestExpect(results).toMatchSnapshot()
  return true
}