import { expect as jestExpect } from '@jest/globals'

export function checkSnapshot(results: any[]) {
  jestExpect(results).toMatchSnapshot()
  return true
}