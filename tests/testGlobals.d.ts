// testGlobals.d.ts
// import { expect as chaiExpect } from 'chai'

declare global {
  // @ts-ignore WONTFIX
  var jest:       typeof import('@jest/globals').jest;
  var jestExpect: typeof import('@jest/globals').expect;
  // @ts-ignore WONTFIX
  var sinon:      typeof import('sinon');
  // @ts-ignore WONTFIX
  var expect:     typeof import('chai').expect;

  namespace NodeJS {
    interface Global {
      jest:       typeof import('@jest/globals').jest;
      jestExpect: typeof import('@jest/globals').expect;
      sinon:      typeof import('sinon');
      expect:     typeof import('chai').expect;
    }
  }
  // namespace Chai {
  //   interface Assertion {
  //     typeish(goal: string | RegExp): Assertion;
  //     strung(goal: string | RegExp): Assertion
  //   }
  // }
}

// Exporting an empty object to ensure this file is treated as a module
export {};
