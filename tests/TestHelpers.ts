import      _                                /**/ from 'lodash'
import      { expect as jestExpect }          from '@jest/globals'
//
export const IAMA_TESTHELPERS = true

export * as Examples from './fixtures/ExampleValues.ts'

export function checkSnapshot(results: any[]) {
  jestExpect(results).toMatchSnapshot()
  return true
}