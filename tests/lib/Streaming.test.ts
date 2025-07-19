import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import      { UF, Streaming as STL }              from '@freeword/meta'
// import type * as TY from '../../meta/src/types.ts'

const _ABCDE      = ['A', 'B', 'C', 'D', 'E']
const _ABCDEFGHIJ  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const _LongArray   = [...UF.CharsAZ09Bar, ...UF.CharsAZ09Bar, ...UF.CharsAZ09Bar, ...UF.CharsAZ09Bar]
class Shifter {
  declare _stream: string[]
  constructor(stream: string[]) { this._stream = [...stream] }
  next():   IteratorResult<string> { return (this._stream.length === 0) ? { value: undefined, done: true } : { value: this._stream.shift()!, done: false } }
  return(): IteratorResult<string> { return { value: undefined, done: true } }
}
function iterableForIterator<IT>(iter: () => Iterator<IT>): Iterable<IT> { return { [Symbol.iterator]() { return iter() } } }
function generatorFor<IT>(arr: IT[]) { return iterableForIterator(function * () { yield* [...arr] }) }
function makeStreams(): [string, Iterable<string>, Iterable<string>][] {
  return [
    ['string',        'ABCDEFGHIJ',               'ABCDE'],
    ['array',         _ABCDEFGHIJ,                _ABCDE],
    ['generator',     generatorFor(_ABCDEFGHIJ),  generatorFor(_ABCDE)],
    ['iterator',      iterableForIterator(() => new Shifter(_ABCDEFGHIJ)),   iterableForIterator(() => new Shifter(_ABCDE))],
  ]
}
function streamRet(stream: Iterable<string>): any {
  return UF.slurpWithResultSync(stream)?.ret
}

describe('Streaming', () => {

  describe('STL.sliceStar', () => {
    const Streams = makeStreams()
    describe.each(Streams)('For streams of type %s', (_handle, ABCDEFGHIJ) => {
      it('is setup correctly', () => { expect([...(ABCDEFGHIJ as Iterable<string>)]).to.eql(_ABCDEFGHIJ)      })
      describe('basic functionality', () => {
        it('should yield from beg index to end', () => {
          expect([...STL.sliceStream(ABCDEFGHIJ, 3, 8)].join('')).to.eql('DEFGH')
          expect([...STL.sliceStream(ABCDEFGHIJ, 5, 8)].join('')).to.eql('FGH')
        })
        describe('as end changes size', () => {
          it('should handle end > length', () => {
            expect([...STL.sliceStream(ABCDEFGHIJ,  0, 11)].join('')).to.eql('ABCDEFGHIJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  1, 11)].join('')).to.eql('BCDEFGHIJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  3, 11)].join('')).to.eql('DEFGHIJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  8, 11)].join('')).to.eql('IJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  9, 11)].join('')).to.eql('J')
            expect([...STL.sliceStream(ABCDEFGHIJ, 10, 11)].join('')).to.eql('')
          })
          it('should handle end = length', () => {
            expect([...STL.sliceStream(ABCDEFGHIJ,  0, 10)].join('')).to.eql('ABCDEFGHIJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  1, 10)].join('')).to.eql('BCDEFGHIJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  3, 10)].join('')).to.eql('DEFGHIJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  8, 10)].join('')).to.eql('IJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  9, 10)].join('')).to.eql('J')
            expect([...STL.sliceStream(ABCDEFGHIJ, 10, 10)].join('')).to.eql('')
          })
          it('should handle end = length - 1', () => {
            expect([...STL.sliceStream(ABCDEFGHIJ, 0, 9)].join('')).to.eql('ABCDEFGHI')
            expect([...STL.sliceStream(ABCDEFGHIJ, 1, 9)].join('')).to.eql('BCDEFGHI')
            expect([...STL.sliceStream(ABCDEFGHIJ, 3, 9)].join('')).to.eql('DEFGHI')
            expect([...STL.sliceStream(ABCDEFGHIJ, 8, 9)].join('')).to.eql('I')
          })
          it('should handle end = 2', () => {
            expect([...STL.sliceStream(ABCDEFGHIJ, 0, 2)].join('')).to.eql('AB')
            expect([...STL.sliceStream(ABCDEFGHIJ, 1, 2)].join('')).to.eql('B')
          })
          it('should handle end = 1', () => {
            expect([...STL.sliceStream(ABCDEFGHIJ, 0, 1)].join('')).to.eql('A')
            // expect([...STL.sliceStream(ABCDEFGHIJ, 1, 1)].join('')).to.eql('')
          })
        })
        describe('as end and beg meet', () => {
          it('should handle end = beg + 2', () => {
            expect([...STL.sliceStream(ABCDEFGHIJ, 10, 12)].join('')).to.eql('')
            expect([...STL.sliceStream(ABCDEFGHIJ,  8, 10)].join('')).to.eql('IJ')
            expect([...STL.sliceStream(ABCDEFGHIJ,  1,  3)].join('')).to.eql('BC')
            expect([...STL.sliceStream(ABCDEFGHIJ,  0,  2)].join('')).to.eql('AB')
          })
          it('should handle end = beg + 1', () => {
            expect([...STL.sliceStream(ABCDEFGHIJ, 10, 11)].join('')).to.eql('')
            expect([...STL.sliceStream(ABCDEFGHIJ,  9, 10)].join('')).to.eql('J')
            expect([...STL.sliceStream(ABCDEFGHIJ,  8,  9)].join('')).to.eql('I')
            expect([...STL.sliceStream(ABCDEFGHIJ,  1,  2)].join('')).to.eql('B')
            expect([...STL.sliceStream(ABCDEFGHIJ,  0,  1)].join('')).to.eql('A')
          })
        })
      })
    })
    describe('edge cases', () => {
      it('should handle single item array (values should come out because end, horizon >= 1)', () => {
        expect([...STL.sliceStream(['A'], 2, 3)].join('')).to.eql('')
        expect([...STL.sliceStream(['A'], 1, 3)].join('')).to.eql('')
        expect([...STL.sliceStream(['A'], 0, 3)].join('')).to.eql('A')
        expect([...STL.sliceStream(['A'], 1, 2)].join('')).to.eql('')
        expect([...STL.sliceStream(['A'], 0, 2)].join('')).to.eql('A')
        expect([...STL.sliceStream(['A'], 0, 1)].join('')).to.eql('A')
      })
      it('should handle two item arrays', () => {
        expect([...STL.sliceStream(['A', 'B'], 3, 4)].join('')).to.eql('')
        expect([...STL.sliceStream(['A', 'B'], 2, 3)].join('')).to.eql('')
        expect([...STL.sliceStream(['A', 'B'], 1, 3)].join('')).to.eql('B')
        expect([...STL.sliceStream(['A', 'B'], 0, 3)].join('')).to.eql('AB')
        expect([...STL.sliceStream(['A', 'B'], 1, 2)].join('')).to.eql('B')
        expect([...STL.sliceStream(['A', 'B'], 0, 2)].join('')).to.eql('AB')
        expect([...STL.sliceStream(['A', 'B'], 0, 1)].join('')).to.eql('A')
      })

      it('should handle empty array', () => {
        expect([...STL.sliceStream([], 2, 3)].join('')).to.eql('')
        expect([...STL.sliceStream([], 1, 2)].join('')).to.eql('')
        expect([...STL.sliceStream([], 0, 1)].join('')).to.eql('')
        expect([...STL.sliceStream([], 0, 3)].join('')).to.eql('')
      })
    })
    describe('special cases', () => {
      it('should yield * if iter is an array', () => {
        // here
        expect(streamRet(STL.sliceStream(_ABCDEFGHIJ, 1,         1))).to.eql(['array', 1,         1, 10])
        expect(streamRet(STL.sliceStream(_ABCDEFGHIJ, -1,        1))).to.eql(['array', -1,        1, 10])
        expect(streamRet(STL.sliceStream(_ABCDEFGHIJ, 10,        1))).to.eql(['array', 10,        1, 10])
        expect(streamRet(STL.sliceStream(_ABCDEFGHIJ, undefined, 1))).to.eql(['array', undefined, 1, 10])
      })
      // other than ^^^ we can't use an array because the function optimizes for that
      function testStream() { return generatorFor(_ABCDE) }
      it('should return early if arg1 === 0 or NegInfinity', () => {
        expect(streamRet(STL.sliceStream(testStream(), 0,         0))).to.eql(['empty', 0,         0, 0])
        expect(streamRet(STL.sliceStream(testStream(), -1,        0))).to.eql(['empty', -1,        0, 0])
        expect(streamRet(STL.sliceStream(testStream(), 10,        0))).to.eql(['empty', 10,        0, 0])
        expect(streamRet(STL.sliceStream(testStream(), undefined, 0))).to.eql(['empty', undefined, 0, 0])
      })
      it('should return early if arg0 is >= len', () => {
        expect(streamRet(STL.sliceStream(testStream(), 2,  5,  2))).to.eql(['empty', 2, 5,  2])
        expect(streamRet(STL.sliceStream(testStream(), 3,  5,  2))).to.eql(['empty', 3, 5,  2])
        expect(streamRet(STL.sliceStream(testStream(), 0,  5,  0))).to.eql(['empty', 0, 5,  0])
        expect(streamRet(STL.sliceStream(testStream(), 0,  5, -1))).to.eql(['empty', 0, 5, -1])
        expect(streamRet(STL.sliceStream(testStream(), -Infinity, 5, -1))).to.eql(['empty', -Infinity, 5, -1])
      })
      it('should return early if arg0 is PosInfinity', () => {
        expect(streamRet(STL.sliceStream(testStream(), Infinity, 1,       ))).to.eql(['empty', Infinity, 1,         0])
        expect(streamRet(STL.sliceStream(testStream(), Infinity, -1,      ))).to.eql(['empty', Infinity, -1,        0])
        expect(streamRet(STL.sliceStream(testStream(), Infinity, 10,      ))).to.eql(['empty', Infinity, 10,        0])
        expect(streamRet(STL.sliceStream(testStream(), Infinity, undefined))).to.eql(['empty', Infinity, undefined, 0])
      })
      it('should return early if arg0 is Infinity', () => {
        expect(streamRet(STL.sliceStream(testStream(), 0,         0))).to.eql(['empty', 0,         0, 0])
        expect(streamRet(STL.sliceStream(testStream(), -1,        0))).to.eql(['empty', -1,        0, 0])
        expect(streamRet(STL.sliceStream(testStream(), 10,        0))).to.eql(['empty', 10,        0, 0])
        expect(streamRet(STL.sliceStream(testStream(), undefined, 0))).to.eql(['empty', undefined, 0, 0])
      })
      it('should return early for pos/pos empty result', () => { // 2 = DE; 2 = AB
        const { vals, ret } = UF.slurpWithResultSync(STL.sliceStream(testStream(), 2, 2))
        expect(vals).to.eql([])
        expect(ret).to.eql(["empty", 2, 2, 2, 2])
        expect(streamRet(STL.sliceStream(testStream(), 3, 2))).to.eql(["empty", 3, 2, 3, 2])
        expect(streamRet(STL.sliceStream(testStream(), 5, 1))).to.eql(["empty", 5, 1, 5, 1])
        expect(streamRet(STL.sliceStream(testStream(), 2, 2))).to.eql(["empty", 2, 2, 2, 2])
      })
      it('should return early neg/neg empty result', () => { // 2 = DE; 2 = AB
        expect(streamRet(STL.sliceStream(testStream(), -3,  -3))).to.eql(["empty", -3,  -3, -3,  -3])
        expect(streamRet(STL.sliceStream(testStream(), -3,  -4))).to.eql(["empty", -3,  -4, -3,  -4])
        expect(streamRet(STL.sliceStream(testStream(), -3, -99))).to.eql(["empty", -3, -99, -3, -99])
        expect(streamRet(STL.sliceStream(testStream(), -1,  -1))).to.eql(["empty", -1,  -1, -1,  -1])
        expect(streamRet(STL.sliceStream(testStream(), -1,  -2))).to.eql(["empty", -1,  -2, -1,  -2])
      })
      it('should yield* if the whole stream is requested', () => { // 2 = DE; 2 = AB
        expect(streamRet(STL.sliceStream(testStream(), 0,         undefined))).to.eql(["full", 0,         undefined])
        expect(streamRet(STL.sliceStream(testStream(), 0                   ))).to.eql(["full", 0,         undefined])
        expect(streamRet(STL.sliceStream(testStream(), undefined, undefined))).to.eql(["full", undefined, undefined])
        expect(streamRet(STL.sliceStream(testStream(), undefined           ))).to.eql(["full", undefined, undefined])
        expect(streamRet(STL.sliceStream(testStream()                      ))).to.eql(["full", undefined, undefined])
      })
      it('should call PosPos if the args are + +', () => {
        expect(streamRet(STL.sliceStream(testStream(), 1,         undefined))).to.eql(["pospos", 1, undefined, 1, Infinity])
        expect(streamRet(STL.sliceStream(testStream(), 1                   ))).to.eql(["pospos", 1, undefined, 1, Infinity])
        expect(streamRet(STL.sliceStream(testStream(), undefined, 3        ))).to.eql(["pospos", undefined, 3, 0, 3])
        expect(streamRet(STL.sliceStream(testStream(), undefined, 1        ))).to.eql(["pospos", undefined, 1, 0, 1])
        expect(streamRet(STL.sliceStream(testStream(), 1,         2        ))).to.eql(["pospos", 1, 2, 1, 2])
        expect(streamRet(STL.sliceStream(testStream(), 1,         2        ))).to.eql(["pospos", 1, 2, 1, 2])
      })
      it('should call PosNeg if the args are + -', () => {
        expect(streamRet(STL.sliceStream(testStream(), undefined, -3       ))).to.eql(["posneg", undefined,  -3,     0, 3])
        expect(streamRet(STL.sliceStream(testStream(), undefined, -1       ))).to.eql(["posneg", undefined,  -1,     0, 1])
        expect(streamRet(STL.sliceStream(testStream(), 0,         -3       ))).to.eql(["posneg", 0,          -3,     0, 3])
        expect(streamRet(STL.sliceStream(testStream(), 0,         -1       ))).to.eql(["posneg", 0,          -1,     0, 1])
        expect(streamRet(STL.sliceStream(testStream(), 1,         -2       ))).to.eql(["posneg", 1,          -2,     1, 2])
        expect(streamRet(STL.sliceStream(testStream(), 1,         -2       ))).to.eql(["posneg", 1,          -2,     1, 2])
        expect(streamRet(STL.sliceStream(testStream(), 10000,     -2       ))).to.eql(["posneg", 10000,      -2, 10000, 2])
      })
      it('should call NegPos if the args are - +', () => {
        expect(streamRet(STL.sliceStream(testStream(), -3, undefined))).to.eql(["negpos",  -3, undefined, 3,   Infinity])
        expect(streamRet(STL.sliceStream(testStream(), -1, undefined))).to.eql(["negpos",  -1, undefined, 1,   Infinity])
        expect(streamRet(STL.sliceStream(testStream(), -2, 1        ))).to.eql(["negpos",  -2, 1,         2,     1 ])
        expect(streamRet(STL.sliceStream(testStream(), -2, 1        ))).to.eql(["negpos",  -2, 1,         2,     1 ])
        expect(streamRet(STL.sliceStream(testStream(), -2, 10000    ))).to.eql(["negpos",  -2, 10000,     2, 10000 ])
      })
      it('should call NegNeg if the args are - -', () => {
        expect(streamRet(STL.sliceStream(testStream(), -3,  -1))).to.eql(["negneg",   -3,  -1,  3,  1 ])
        expect(streamRet(STL.sliceStream(testStream(), -2,  -1))).to.eql(["negneg",   -2,  -1,  2,  1 ])
        expect(streamRet(STL.sliceStream(testStream(), -2,  -1))).to.eql(["negneg",   -2,  -1,  2,  1 ])
        expect(streamRet(STL.sliceStream(testStream(),-22,  -1))).to.eql(["negneg",  -22,  -1, 22,  1 ])
        expect(streamRet(STL.sliceStream(testStream(),-22, -10))).to.eql(["negneg",  -22, -10, 22, 10 ])
      })
    })
    const fenceposts = [undefined, 1, 2, 3, 5, 10, 20, 23, 47, 48, 49, 60, Infinity, -Infinity]
    const SceneArg0Arg1s = fenceposts.map(beg => fenceposts.map(dropend => [beg, dropend])).flat() as [number, number][]
    const SceneLengths = [0, 1, 2, 3, 5, 10, 47, 48, 49, 60, 70, 71, 96, 97, 98, 99, 100, 107, 108, 109, 240]
    const Reservoir = _LongArray
    describe('should agree with Array.slice on pos / pos args', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [arg0, arg1] of SceneArg0Arg1s) {
          const items = Reservoir.slice(0, len)
          const input = generatorFor(items)
          const wanted = items.slice(arg0, arg1)
          const result = UF.slurpWithResultSync(STL.sliceStream(input, arg0, arg1))
          if (! _.isEqual(result.vals, wanted)) { console.log(result.ret, [result.vals?.join(''), wanted.join('')]) }
          expect(result.vals).to.eql(wanted)
        }
      })
    })
    describe('should agree with Array.slice on neg / pos args', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [arg0, arg1] of SceneArg0Arg1s) {
          const items = Reservoir.slice(0, len)
          const input = generatorFor(items)
          const result = STL.sliceStream(input, -arg0, arg1)
          expect([...result].join('')).to.eql(items.slice(-arg0, arg1).join(''))
        }
      })
    })
    describe('should agree with Array.slice on pos / neg args', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [arg0, arg1] of SceneArg0Arg1s) {
          const items = Reservoir.slice(0, len)
          const input = generatorFor(items)
          const result = STL.sliceStream(input, arg0, -arg1)
          expect([...result].join('')).to.eql(items.slice(arg0, (arg1 === undefined) ? undefined : -arg1).join(''))
        }
      })
    })
    describe('should agree with Array.slice on neg / neg args', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [arg0, arg1] of SceneArg0Arg1s) {
          const items = Reservoir.slice(0, len)
          const input = generatorFor(items)
          const result = STL.sliceStream(input, -arg0, -arg1)
          expect([...result].join('')).to.eql(items.slice(((arg0 === undefined) ? undefined : -arg0), ((arg1 === undefined) ? undefined : -arg1)).join(''))
        }
      })
    })
  })

  describe('STL._sliceStarPosPos', () => {
    const Streams = makeStreams()
    describe.each(Streams)('For streams of type %s', (_handle, ABCDEFGHIJ, ABCDE) => {
      it('is setup correctly', () => { expect([...(ABCDEFGHIJ as Iterable<string>)]).to.eql(_ABCDEFGHIJ)      })
      describe('basic functionality', () => {
        it('should yield from beg index to end', () => {
          expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 3, 8)].join('')).to.eql('DEFGH')
          expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 5, 8)].join('')).to.eql('FGH')
        })
        describe('as end changes size', () => {
          it('should handle end > length', () => {
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  0, 11)].join('')).to.eql('ABCDEFGHIJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  1, 11)].join('')).to.eql('BCDEFGHIJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  3, 11)].join('')).to.eql('DEFGHIJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  8, 11)].join('')).to.eql('IJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  9, 11)].join('')).to.eql('J')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 10, 11)].join('')).to.eql('')
          })
          it('should handle end = length', () => {
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  0, 10)].join('')).to.eql('ABCDEFGHIJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  1, 10)].join('')).to.eql('BCDEFGHIJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  3, 10)].join('')).to.eql('DEFGHIJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  8, 10)].join('')).to.eql('IJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  9, 10)].join('')).to.eql('J')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 10, 10)].join('')).to.eql('')
          })
          it('should handle end = length - 1', () => {
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 0, 9)].join('')).to.eql('ABCDEFGHI')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 1, 9)].join('')).to.eql('BCDEFGHI')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 3, 9)].join('')).to.eql('DEFGHI')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 8, 9)].join('')).to.eql('I')
          })
          it('should handle end = 2', () => {
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 0, 2)].join('')).to.eql('AB')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 1, 2)].join('')).to.eql('B')
          })
          it('should handle end = 1', () => {
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 0, 1)].join('')).to.eql('A')
            // expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 1, 1)].join('')).to.eql('')
          })
        })
        describe('as end and beg meet', () => {
          it('should handle end = beg + 2', () => {
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 10, 12)].join('')).to.eql('')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  8, 10)].join('')).to.eql('IJ')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  1,  3)].join('')).to.eql('BC')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  0,  2)].join('')).to.eql('AB')
          })
          it('should handle end = beg + 1', () => {
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ, 10, 11)].join('')).to.eql('')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  9, 10)].join('')).to.eql('J')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  8,  9)].join('')).to.eql('I')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  1,  2)].join('')).to.eql('B')
            expect([...STL._sliceStarPosPos(ABCDEFGHIJ,  0,  1)].join('')).to.eql('A')
          })
        })
      })
      describe('return value', () => {
        it('should return correct metadata', () => { // 3 = HIJ; 8 = ABCDEFGH
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarPosPos(ABCDEFGHIJ, 3, 8))
          expect(vals).to.eql(['D', 'E', 'F', 'G', 'H'])
          expect(ret).to.eql(['_sliceStarPosPos', 8, 3, 8])
        })
        it('should return correct metadata for empty result', () => { // 2 = DE; 2 = AB
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarPosPos(ABCDE, 2, 2))
          expect(vals).to.eql(["C"])
          expect(ret).to.eql(['_sliceStarPosPos',  3, 2, 2])
        })
      })
    })
    describe('edge cases', () => {
      it('should handle single item array (values should come out because end, horizon >= 1)', () => {
        expect([...STL._sliceStarPosPos(['A'], 2, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos(['A'], 1, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos(['A'], 0, 3)].join('')).to.eql('A')
        expect([...STL._sliceStarPosPos(['A'], 1, 2)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos(['A'], 0, 2)].join('')).to.eql('A')
        expect([...STL._sliceStarPosPos(['A'], 0, 1)].join('')).to.eql('A')
      })
      it('should handle two item arrays', () => {
        expect([...STL._sliceStarPosPos(['A', 'B'], 3, 4)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos(['A', 'B'], 2, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos(['A', 'B'], 1, 3)].join('')).to.eql('B')
        expect([...STL._sliceStarPosPos(['A', 'B'], 0, 3)].join('')).to.eql('AB')
        expect([...STL._sliceStarPosPos(['A', 'B'], 1, 2)].join('')).to.eql('B')
        expect([...STL._sliceStarPosPos(['A', 'B'], 0, 2)].join('')).to.eql('AB')
        expect([...STL._sliceStarPosPos(['A', 'B'], 0, 1)].join('')).to.eql('A')
      })

      it('should handle empty array', () => {
        expect([...STL._sliceStarPosPos([], 2, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos([], 1, 2)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos([], 0, 1)].join('')).to.eql('')
        expect([...STL._sliceStarPosPos([], 0, 3)].join('')).to.eql('')
      })
    })
    const fenceposts = [1, 2, 3, 5, 10, 20, 23, 47, 48, 49, 60]
    const SceneArg0Arg1s = fenceposts.map(beg => fenceposts.map(dropend => [beg, dropend])).flat() as [number, number][]
    const SceneLengths = [0, 1, 2, 3, 5, 10, 47, 48, 49, 60, 70, 71, 96, 97, 98, 99, 100, 107, 108, 109, 240]
    const Reservoir = _LongArray
    describe('should agree with Array.slice', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [beg, dropend] of SceneArg0Arg1s) {
          if (beg >= dropend) { return } // not valid to call with beg >= end (that has been handled by sliceStream))
          const input = Reservoir.slice(0, len)
          const result = STL._sliceStarPosPos(input, beg, dropend)
          if (! _.isEqual(input.slice(beg, dropend), [...result])) { console.log([...result], beg, dropend, len) }
          expect([...result].join('')).to.eql(input.slice(beg, dropend).join(''))
        }
      })
    })
  })
  describe('STL._sliceStarNegNeg', () => {
    const Streams = makeStreams()
    describe.each(Streams)('For streams of type %s', (_handle, ABCDEFGHIJ, ABCDE) => {
      it('is setup correctly', () => { expect([...(ABCDEFGHIJ as Iterable<string>)]).to.eql(_ABCDEFGHIJ)      })
      describe('basic functionality', () => {
        describe('with dropend = 1', () => {
          it('should handle horizon 1', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 1, 1)].join('')).to.eql('')
          })
          it('should handle horizon 2', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 2, 1)].join('')).to.eql('I')
          })
          it('should yield from horizon items before end', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 3, 1)].join('')).to.eql('HI')
          })
          it('should handle horizon = length-1', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 9, 1)].join('')).to.eql('BCDEFGHI')
          })
          it('should handle horizon = length', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 10, 1)].join('')).to.eql('ABCDEFGHI')
          })
          it('should handle horizon exceeds length', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 11, 1)].join('')).to.eql('ABCDEFGHI')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 99, 1)].join('')).to.eql('ABCDEFGHI')
          })
        })
        describe('with dropend > 1', () => {
          it('should handle horizon > length', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 11,  1)].join('')).to.eql('ABCDEFGHI')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 11,  3)].join('')).to.eql('ABCDEFG')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 11,  9)].join('')).to.eql('A')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 11, 10)].join('')).to.eql('')
          })
          it('should handle horizon = length', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 19,  1)].join('')).to.eql('ABCDEFGHI')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 19,  3)].join('')).to.eql('ABCDEFG')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 19,  9)].join('')).to.eql('A')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 19, 10)].join('')).to.eql('')
          })
          it('should handle horizon = length - 1', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  9,  1)].join('')).to.eql('BCDEFGHI')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  9,  3)].join('')).to.eql('BCDEFG')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  9,  8)].join('')).to.eql('B')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  9,  9)].join('')).to.eql('')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  9, 10)].join('')).to.eql('')
          })
        })
        describe('with medium dropend / horizon', () => {
          it('should handle beg before end', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 8, 7)].join('')).to.eql('C')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 8, 1)].join('')).to.eql('CDEFGHI')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 7, 6)].join('')).to.eql('D')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 3, 2)].join('')).to.eql('H')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 2, 1)].join('')).to.eql('I')
          })
          it('should handle beg meeting end (although it is not a valid scenario)', () => {
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  1,  1)].join('')).to.eql('')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  2,  2)].join('')).to.eql('')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ,  9,  9)].join('')).to.eql('')
            expect([...STL._sliceStarNegNeg(ABCDEFGHIJ, 10, 10)].join('')).to.eql('')
          })
        })
      })

      describe('return value', () => {
        it('should return correct metadata', () => { // 3 = HIJ; 8 = ABCDEFGH
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarNegNeg(ABCDEFGHIJ, 7, 5))
          expect(vals).to.eql(['D', 'E'])
          expect(ret).to.eql(['_sliceStarNegNeg', 7, 5, 7, 2])
        })
        it('should return correct metadata for empty result', () => { // 2 = DE; 2 = AB
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarNegNeg(ABCDE, 2, 2))
          expect(vals).to.eql([])
          expect(ret).to.eql(['_sliceStarNegNeg', 2, 2, 2, 0])
        })
      })
    })

    describe('edge cases', () => {
      it('should handle single item array (values should come out because end, horizon >= 1)', () => {
        expect([...STL._sliceStarNegNeg(['A'], 1, 1)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg(['A'], 2, 1)].join('')).to.eql('')
      })
      it('should handle two item array when values should come out', () => {
        expect([...STL._sliceStarNegNeg(['A', 'B'], 3, 2)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg(['A', 'B'], 3, 1)].join('')).to.eql('A')
        expect([...STL._sliceStarNegNeg(['A', 'B'], 2, 2)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg(['A', 'B'], 2, 1)].join('')).to.eql('A')
        expect([...STL._sliceStarNegNeg(['A', 'B'], 1, 1)].join('')).to.eql('')
      })
      it('should handle single item array when nothing should come out', () => {
        expect([...STL._sliceStarNegNeg(['A', 'B'], 1, 1)].join('')).to.eql('')
      })

      it('should handle empty array', () => {
        expect([...STL._sliceStarNegNeg([], 3, 3)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg([], 3, 2)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg([], 3, 1)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg([], 2, 3)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg([], 2, 2)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg([], 2, 1)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg([], 1, 3)].join('')).to.eql('')
        expect([...STL._sliceStarNegNeg([], 1, 2)].join('')).to.eql('')
      })
    })
    const fenceposts = [1, 2, 3, 5, 10, 20, 23, 47, 48, 49, 60]
    const SceneArg0Arg1s = fenceposts.map(beg => fenceposts.map(dropend => [beg, dropend])).flat() as [number, number][]
    const SceneLengths = [0, 1, 2, 3, 5, 10, 47, 48, 49, 60, 70, 71, 96, 97, 98, 99, 100, 107, 108, 109, 240]
    const Reservoir = _LongArray
    it('is set up correctly', () => { expect(_.max(SceneLengths)).to.be.lessThan(Reservoir.length) })
    describe('should agree with Array.slice', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [beg, dropend] of SceneArg0Arg1s) {
          if (beg >= dropend) { return }
          const input = Reservoir.slice(0, len)
          const result = STL._sliceStarNegNeg(input, beg, dropend)
          expect([...result].join('')).to.eql(input.slice(beg, dropend).join(''))
        }
      })
    })
  })
  describe('STL._sliceStarNegPos', () => {
    const Streams = makeStreams()
    describe.each(Streams)('For streams of type %s', (_handle, ABCDEFGHIJ, ABCDE) => {
      it('is setup correctly', () => {
        expect([...(ABCDEFGHIJ as Iterable<string>)]).to.eql(_ABCDEFGHIJ)
      })
      describe('basic functionality', () => {
        it('should yield from horizon items before end', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 12)].join('')).to.eql('HIJ')
        })
        it('should handle horizon items when end is > length', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 11)].join('')).to.eql('HIJ')
        })
        it('should handle horizon items when end is = length', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 11)].join('')).to.eql('HIJ')
        })
        it('should handle horizon-1 items when end is length - 1', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 9)].join('')).to.eql('HI')
        })
        it('should handle horizon one away from end', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 8)].join('')).to.eql('H')
        })
        it('should handle horizon meeting end', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 7)].join('')).to.eql('')
        })
        it('should handle horizon passing end', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 6)].join('')).to.eql('')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 3, 1)].join('')).to.eql('')
        })
        it('should handle horizon > length', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 11, 10)].join('')).to.eql('ABCDEFGHIJ')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 11,  9)].join('')).to.eql('ABCDEFGHI')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 11,  1)].join('')).to.eql('A')
        })
        it('should handle horizon = length', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 10, 10)].join('')).to.eql('ABCDEFGHIJ')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 10,  9)].join('')).to.eql('ABCDEFGHI')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ, 10,  1)].join('')).to.eql('A')
        })
        it('should handle horizon = length - 1', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ,  9, 10)].join('')).to.eql('BCDEFGHIJ')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ,  9,  9)].join('')).to.eql('BCDEFGHI')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ,  9,  2)].join('')).to.eql('B')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ,  9,  1)].join('')).to.eql('')
        })
        it('should handle horizon = 1', () => {
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ,  1, 10)].join('')).to.eql('J')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ,  1,  9)].join('')).to.eql('')
          expect([...STL._sliceStarNegPos(ABCDEFGHIJ,  1,  1)].join('')).to.eql('')
        })
      })

      describe('return value', () => {
        it('should return correct metadata', () => { // 3 = HIJ; 8 = ABCDEFGH
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarNegPos(ABCDEFGHIJ, 3, 8))
          expect(vals).to.eql(['H'])
          expect(ret).to.eql(['_sliceStarNegPos', 10, 3, 8, 1])
        })
        it('should return correct metadata for empty result', () => { // 2 = DE; 2 = AB
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarNegPos(ABCDE, 2, 2))
          expect(vals).to.eql([])
          expect(ret).to.eql(['_sliceStarNegPos', 4, 2, 2, 0])
        })
      })
    })
    describe('edge cases', () => {
      it('should handle single item array (values should come out because end, horizon >= 1)', () => {
        expect([...STL._sliceStarNegPos(['A'], 3, 3)].join('')).to.eql('A')
        expect([...STL._sliceStarNegPos(['A'], 3, 1)].join('')).to.eql('A')
        expect([...STL._sliceStarNegPos(['A'], 1, 3)].join('')).to.eql('A')
        expect([...STL._sliceStarNegPos(['A'], 1, 1)].join('')).to.eql('A')
      })
      it('should handle two item array when values should come out', () => {
        expect([...STL._sliceStarNegPos(['A', 'B'], 3, 3)].join('')).to.eql('AB')
        expect([...STL._sliceStarNegPos(['A', 'B'], 3, 2)].join('')).to.eql('AB')
        expect([...STL._sliceStarNegPos(['A', 'B'], 3, 1)].join('')).to.eql('A')
        expect([...STL._sliceStarNegPos(['A', 'B'], 2, 3)].join('')).to.eql('AB')
        expect([...STL._sliceStarNegPos(['A', 'B'], 2, 2)].join('')).to.eql('AB')
        expect([...STL._sliceStarNegPos(['A', 'B'], 2, 1)].join('')).to.eql('A')
        expect([...STL._sliceStarNegPos(['A', 'B'], 1, 3)].join('')).to.eql('B')
        expect([...STL._sliceStarNegPos(['A', 'B'], 1, 2)].join('')).to.eql('B')
      })
      it('should handle single item array when nothing should come out', () => {
        expect([...STL._sliceStarNegPos(['A', 'B'], 1, 1)].join('')).to.eql('')
      })

      it('should handle empty array', () => {
        expect([...STL._sliceStarNegPos([], 3, 3)].join('')).to.eql('')
        expect([...STL._sliceStarNegPos([], 3, 2)].join('')).to.eql('')
        expect([...STL._sliceStarNegPos([], 3, 1)].join('')).to.eql('')
        expect([...STL._sliceStarNegPos([], 2, 3)].join('')).to.eql('')
        expect([...STL._sliceStarNegPos([], 2, 2)].join('')).to.eql('')
        expect([...STL._sliceStarNegPos([], 2, 1)].join('')).to.eql('')
        expect([...STL._sliceStarNegPos([], 1, 3)].join('')).to.eql('')
        expect([...STL._sliceStarNegPos([], 1, 2)].join('')).to.eql('')
      })
    })
    const fenceposts = [1, 2, 3, 5, 10, 20, 23, 47, 48, 49, 60]
    const SceneArg0Arg1s = fenceposts.map(beg => fenceposts.map(dropend => [beg, dropend])).flat() as [number, number][]
    const SceneLengths = [0, 1, 2, 3, 5, 10, 47, 48, 49, 60, 70, 71, 96, 97, 98, 99, 100, 107, 108, 109, 240]
    const Reservoir = _LongArray
    it('is set up correctly', () => { expect(_.max(SceneLengths)).to.be.lessThan(Reservoir.length) })
    describe('should agree with Array.slice', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [horizon, end] of SceneArg0Arg1s) {
          const input = Reservoir.slice(0, len)
          const result = STL._sliceStarNegPos(input, horizon, end)
          expect([...result].join('')).to.eql(input.slice(-horizon, end).join(''))
        }
      })
    })
  })
  describe('STL._sliceStarPosNeg', () => {
    const Streams = makeStreams()
    describe.each(Streams)('For streams of type %s', (_handle, ABCDEFGHIJ, ABCDE) => {
      it('is setup correctly', () => {
        expect([...(ABCDEFGHIJ as Iterable<string>)]).to.eql(_ABCDEFGHIJ)
      })
      describe('basic functionality', () => {
        describe('with dropend = 0', () => {
          it('works when beg is 1', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ,  1,  0)].join('')).to.eql('BCDEFGHIJ')
          })
          it('works when beg is small', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ,  3,  0)].join('')).to.eql('DEFGHIJ')
          })
          it('words when beg = length-1', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ,  9, 0)].join('')).to.eql('J')
          })
          it('works when beg is length', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 10, 0)].join('')).to.eql('')
          })
          it('works when beg exceeds length', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ,  11, 0)].join('')).to.eql('')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 100, 0)].join('')).to.eql('')
          })
        })
        describe('with dropend >= 1', () => {
          it('works when beg is 1', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1,  1)].join('')).to.eql('BCDEFGHI')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1,  3)].join('')).to.eql('BCDEFG')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1,  8)].join('')).to.eql('B')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1,  9)].join('')).to.eql('')
          })
          it('works when beg is small', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 3,  1)].join('')).to.eql('DEFGHI')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 3,  3)].join('')).to.eql('DEFG')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 3,  6)].join('')).to.eql('D') //  EFG HIJ
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 3,  7)].join('')).to.eql('')  // DEFG HIJ
          })
          it('words when beg = length-dropend-1', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 8, 1)].join('')).to.eql('I')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 9, 0)].join('')).to.eql('J')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 7, 2)].join('')).to.eql('H')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1, 8)].join('')).to.eql('B')
          })
          it('words when beg = length-dropend', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 9, 1)].join('')).to.eql('')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 8, 2)].join('')).to.eql('')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1, 9)].join('')).to.eql('')
          })
          it('works when beg is length', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 10, 1)].join('')).to.eql('')
          })
          it('works when beg exceeds length', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ,  11, 1)].join('')).to.eql('')
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 100, 1)].join('')).to.eql('')
          })
        })
        describe('with dropend = length - 2', () => {
          it('works when beg is 1', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1,  8)].join('')).to.eql('B')
          })
          it('works when beg is small', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 3,  8)].join('')).to.eql('')
          })
        })
        describe('with dropend = length - 1', () => {
          it('works when beg is 1', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 1,  9)].join('')).to.eql('')
          })
          it('works when beg is small', () => {
            expect([...STL._sliceStarPosNeg(ABCDEFGHIJ, 3,  9)].join('')).to.eql('')
          })
        })
      })
      describe('return value', () => {
        it('should return correct metadata', () => { // 3 = HIJ; 8 = ABCDEFGH
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarPosNeg(ABCDEFGHIJ, 3, 8))
          expect(vals).to.eql([])
          expect(ret).to.eql(['_sliceStarPosNeg', 10, 3, 8, 7, -1])
        })
        it('should return correct metadata for empty result', () => { // 2 = DE; 2 = AB
          const { vals, ret } = UF.slurpWithResultSync(STL._sliceStarPosNeg(ABCDE, 2, 2))
          expect(vals).to.eql(['C'])
          expect(ret).to.eql(['_sliceStarPosNeg', 5, 2, 2, 2, 0])
        })
      })
    })
    describe('edge cases', () => {
      it('should handle single item array (values should not come out because beg is required to be >= 1)', () => {
        expect([...STL._sliceStarPosNeg(['A'], 3, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A'], 3, 1)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A'], 3, 0)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A'], 1, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A'], 1, 1)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A'], 1, 0)].join('')).to.eql('')
      })
      it('should handle 2-item array when values should come out', () => {
        expect([...STL._sliceStarPosNeg(['A', 'B'], 1, 0)].join('')).to.eql('B')
      })
      it('should handle 2-item array when nothing should come out', () => {
        expect([...STL._sliceStarPosNeg(['A', 'B'], 1, 2)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A', 'B'], 1, 1)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A', 'B'], 2, 2)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A', 'B'], 2, 1)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg(['A', 'B'], 2, 0)].join('')).to.eql('')
      })

      it('should handle empty array', () => {
        expect([...STL._sliceStarPosNeg([], 3, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 3, 2)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 3, 0)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 2, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 2, 2)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 2, 0)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 1, 3)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 1, 2)].join('')).to.eql('')
        expect([...STL._sliceStarPosNeg([], 1, 0)].join('')).to.eql('')
      })
    })
    const fenceposts = [1, 2, 3, 5, 10, 20, 23, 47, 48, 49, 60]
    const SceneArg0Arg1s = fenceposts.map(beg => fenceposts.map(dropend => [beg, dropend])).flat() as [number, number][]
    const SceneLengths = [0, 1, 2, 3, 5, 10, 47, 48, 49, 60, 70, 71, 96, 97, 98, 99, 100, 107, 108, 109, 240]
    const Reservoir = _LongArray
    it('is set up correctly', () => { expect(_.max(SceneLengths)).to.be.lessThan(Reservoir.length) })
    describe('should agree with Array.slice', () => {
      it.each(SceneLengths)('for length %s', (len) => {
        for (const [beg, dropend] of SceneArg0Arg1s) {
          const input = Reservoir.slice(0, len)
          const result = STL._sliceStarPosNeg(input, beg, dropend)
          expect([...result].join('')).to.eql(input.slice(beg, -dropend).join(''))
        }
      })
    })
  })
})