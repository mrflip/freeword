/* eslint-disable import/no-extraneous-dependencies */
import _                                /**/ from 'lodash'
import * as Chai                             from 'chai'
import { expect }                            from 'chai'
// import ChaiAsPromised                     from 'chai-as-promised'
// import * as ChaiEach                      from 'chai-each'
// import ChaiArrays                         from 'chai-arrays'
//
import * as Sinon                            from 'sinon'
import ChaiSinon                             from 'sinon-chai'
import { jest, expect as jestExpect }        from '@jest/globals'

Error.stackTraceLimit = (Error.stackTraceLimit > 50) ? Error.stackTraceLimit : 50

// @ts-ignore WONTFIX arrgasdfasdfklasjdf
global.expect     = expect
global.jest       = jest
global.jestExpect = jestExpect
global.sinon      = Sinon

Chai.use(ChaiSinon)

// See https://github.com/chaijs/chai-things/issues/4 for use of c-a-prom with c-things
// Chai.use((ChaiArrays as any).default ?? ChaiArrays)
// Chai.use((ChaiEach as any).default ?? ChaiEach)
// !! MUST BE LAST:
// Chai.use(ChaiAsPromised) // must be last
