import jest from '@jest/globals'

export const jestExpect = jest.expect

export function checkSnapshot(results: any[]) {
  return jestExpect(results).toMatchSnapshot()
}