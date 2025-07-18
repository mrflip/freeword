import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import      { SeededRandomFactory, UF }           from '@freeword/meta'

type CheckDistOpts<BT = number> = {
  lo: BT, hi: BT, explo?: BT, exphi?: BT, spread?: number, count?: number, nBins?: number, verbose?: boolean,
  binner?: CheckDistFunc, unkey?: CheckDistFunc, mungeNumKeys?: boolean
}
type CheckDistFunc = (val: any) => any
const BoolishVals = { true: true, false: false }
function Boolish(val: any) { return BoolishVals[String(val) as keyof typeof BoolishVals] }

function boboSigma(count: number, nBins: number, mult = 3.5) {
  const sigma = Math.sqrt(count * (1 / nBins) * (1 - 1 / nBins))
  return sigma * mult
}
function checkDistNum<BT = number>(actual: any[], opts: CheckDistOpts<BT>) {
  const { lo, hi, count = LOTSA, binner = Math.floor, nBins = ((hi as number) - (lo as number) + 1), unkey = Number, mungeNumKeys = true } = opts
  expect(actual).to.be.an('array').of.length(count)
  expect(binner).to.be.a('function')
  expect(nBins).to.be.a('number')
  const binnedCts  = UF.bagsort(_.countBy(actual, binner), ([key]) => unkey(key), { mungeNumKeys })
  const binkeys    = _.map(_.keys(binnedCts), unkey)
  const gotBins   = binkeys.length
  const minBinkey  = _.min(binkeys)!
  const maxBinkey  = _.max(binkeys)!
  const explo      = unkey(opts.explo ?? lo)
  const exphi      = unkey(opts.exphi ?? hi)
  const minCt      = _.min(Object.values(binnedCts))!
  const maxCt      = _.max(Object.values(binnedCts))!
  const spread     = maxCt - minCt
  const boboSpread = opts.spread ?? boboSigma(count, nBins)
  const summary    = { lo, hi, explo, exphi, count, nBins, gotBins, minBinkey, maxBinkey, minCt, maxCt, spread, boboSpread, binnedCts }
  if (! ((actual.length === count)
    && (minBinkey === explo) && (maxBinkey === exphi) && (binkeys.length === nBins) && (spread < boboSpread)
  )) {
    console. log('distribution did not match expectations', UF.prettify(summary))
  }
  expect(nBins).to.be.at.least(1)
  // every value should be present
  expect(minBinkey).to.equal(explo)
  expect(maxBinkey).to.equal(exphi)
  expect(gotBins).to.equal(nBins)
  // the spread should be less than 4 standard deviation-ishes
  expect(spread).to.be.lessThan(boboSpread)
  if (opts.verbose) { console.log('distribution passed expectations', UF.prettify(summary)) }
  return true
}
function checkDistStr<BT = string>(actual: any[], opts: CheckDistOpts<BT>) {
  return checkDistNum<BT>(actual, { binner: String, unkey: String, mungeNumKeys: false, ...opts })
}
function checkDistFloat(actual: any[], opts: CheckDistOpts<number>) {
  const { hi, lo } = opts
  return checkDistNum(actual, { exphi: hi - 1, explo: lo, nBins: hi - lo, ...opts })
}
function checkDistBinned(actual: any[], opts: CheckDistOpts<number> & { nBins: number }) {
  const { hi, nBins } = opts
  const exphi = hi * (nBins - 1) / nBins
  return checkDistNum(actual, { exphi, binner: floatBinner(nBins), ...opts })
}
function floatBinner(nBins: number): (val: number) => number {
  return (val: number) => Math.floor(val * nBins) / nBins
}
// function floatUnkeyer(nBins: number): (val: any) => number {
//   return (val: any) => (Number(val) * nBins)
// }
const LOTSA = 2000
function exercise<VT>(fn: (seq: number) => VT, { count = LOTSA }: { count?: number | undefined } = {}): VT[] {
  return _.range(count).map(fn)
}

describe('RandomFactory One-Shot Methods', () => {
  const RandomFactoryClass = SeededRandomFactory
  const TestSeed = 'test'
  const testFactory = (seed: string = TestSeed) => {
    return SeededRandomFactory.make(seed)
  }

  describe('one-shot methods', () => {
    describe('One-shot numeric methods', () => {
      describe('rand01()', () => {
        it('should return a number between 0 and 1 exclusive', () => {
          const factory = testFactory()
          const result = factory.rand01()
          expect(result).to.be.a('number').eql(0.5442283214069903)
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.rand01(), opts)
          const result2 = exercise(() => factory2.rand01(), opts)
          expect(result1).to.eql(result2)
        })
        it('should return different results with different seeds', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('seed1')
          const factory2 = testFactory('seed2')
          const result1 = exercise(() => factory1.rand01(), opts)
          const result2 = exercise(() => factory2.rand01(), opts)
          expect(result1).to.not.equal(result2)
        })
      })

      describe('rand()', () => {
        it('should return a number in the specified range with default parameters', () => {
          const factory = testFactory()
          const result = factory.rand()
          expect(result).to.be.a('number').eql(0.5442283214069903)
        })
        it('should return a number in the specified range with custom parameters', () => {
          const factory = testFactory()
          const result = factory.rand({ lo: 5, hi: 10 })
          expect(result).to.be.a('number').eql(7.7211416070349514)
        })
        it.each([
          [-5, -10, -5], [0, 0, 0], [3, 3, 3], [-3, -3, -3], [3, 1, 3],
        ])('for degenerate range %s < %s, returns %s', (lo, hi, drone) => {
          const factory = testFactory(); const opts = { count: 10 }
          const result = exercise(() => factory.rand({ lo, hi }), opts)
          expect(result).to.be.a('array').eql(_.times(opts.count, _.constant(drone)))
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.rand({ lo: 1, hi: 5 }), opts)
          const result2 = exercise(() => factory2.rand({ lo: 1, hi: 5 }), opts)
          expect(result1).to.eql(result2)
        })
      })

      describe('int()', () => {
        it('should return an integer in the specified range with default parameters', () => {
          const factory = testFactory()
          const result = factory.int()
          expect(result).to.be.a('number').eql(5)
        })
        it('should return an integer in the specified range with custom parameters', () => {
          const factory = testFactory()
          const result = factory.int({ lo: 5, hi: 15 })
          expect(result).to.be.a('number').eql(10)
        })
        it('should handle negative ranges', () => {
          const factory = testFactory()
          const result = factory.int({ lo: -5, hi: -1 })
          expect(result).to.be.a('number').eql(-3)
        })
        it.each([
          [-1, -5, -1], [0, 0, 0], [3, 3, 3], [-3, -3, -3], [3, 1, 3],
        ])('for degenerate range %s < %s, returns %s', (lo, hi, drone) => {
          const factory = testFactory()
          const opts = { count: 10 }
          const result = exercise(() => factory.int({ lo, hi }), opts)
          expect(result).to.be.a('array').eql(_.times(opts.count, _.constant(drone)))
        })
        it.each([
          [0.5,   2.5, { "0":  153,  "1": 316,  "2": 365,  "3": 166 }],
          [-0.5,  3.5, { "-1":  94,  "0": 186,  "1": 189,  "2": 203,  "3": 222,  "4": 106 }],
          [-4.5, -0.5, { "0":  106, "-1": 222, "-2": 203, "-3": 189, "-4": 186, "-5":  94 }],
        ])('for fractional boundaries %s -> %s, has fuzzy edges', (lo, hi, expected) => {
          const factory = testFactory()
          const opts = { count: 1000 }
          const result = exercise(() => factory.int({ lo, hi }), opts)
          expect(_.countBy(result)).to.eql(expected)
        })
        it('should return consistent results with same seed', () => {
          const opts = { lo: 1, hi: 10, count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.int(opts), opts)
          const result2 = exercise(() => factory2.int(opts), opts)
          expect(result1).to.eql(result2)
        })
        it.each([
          [ 0,    1, {"0": 469, "1": 531}],
          [-1,    0, { "-1": 469, "0": 531 }],
          [-1,    1, {"-1": 313, "0": 332, "1": 355}],
          [-5,    2, {"-5": 117, "-4": 118, "-3": 116, "-2": 118, "-1": 133,  "0": 132, "1": 134, "2": 132}
          ],
        ])('for boundaries %s -> %s, has a uniform distribution', (lo, hi, expected) => {
          const factory = testFactory()
          const opts = { count: 1000 }
          const result = exercise(() => factory.int({ lo, hi }), opts)
          expect(_.countBy(result)).to.eql(expected)
        })
        it.each([
          [ 0,       1000, { count: LOTSA * 10, spread: 30 }],
          [ 1e6, 1e6+1000, { count: LOTSA * 10, spread: 30 }],
        ])('should have a uniform distribution over %s <= x <= %s', (lo, hi, optsIn) => {
          const factory = testFactory()
          const opts = { ...optsIn, lo, hi }
          const results = exercise(() => factory.int(opts), opts)
          expect(checkDistNum(results, opts)).to.be.true
        })
      })

      describe('uint32()', () => {
        it('should return an integer between 0 and MAX_UINT32 inclusive', () => {
          const factory = testFactory(); const opts = { count: 10 }
          const result = exercise(() => factory.uint32(), opts)
          expect(result).to.eql([2337442841, 3037120177, 3112607759, 782365966, 1734635350, 2917767437, 1680916784, 1493440450, 3862680924, 2286241367])
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.uint32(), opts)
          const result2 = exercise(() => factory2.uint32(), opts)
          expect(result1).to.eql(result2)
        })
      })

      describe('bool()', () => {
        it('should return a boolean value', () => {
          const factory = testFactory()
          const result = factory.bool()
          expect(result).to.be.a('boolean').eql(false)
          expect(exercise(() => factory.bool(), { count: 10 })).to.eql([false, false, true, true, false, true, true, false, false, false])
        })

        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.bool(), opts)
          const result2 = exercise(() => factory2.bool(), opts)
          expect(result1).to.eql(result2)
        })

        it('should return both true and false values', () => {
          const factory = testFactory()
          const results = exercise(() => factory.bool())
          expect(checkDistNum(results, {
            lo: false, hi: true, count: LOTSA, nBins: 2, binner: Boolean, unkey: Boolish,
          })).to.be.true
        })
      })
    })

    describe('One-shot character methods', () => {
      describe('char()', () => {
        it('should return a character with char code in the specified range (a-z by default)', () => {
          const factory = testFactory()
          const result = factory.char()
          expect(result).to.be.a('string').eql('o')
        })
        it('should return consistent results with same seed', () => {
          const opts = { lo: 65, hi: 90, count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.char(opts), opts)
          const result2 = exercise(() => factory2.char(opts), opts)
          expect(result1).to.eql(result2)
        })
        it('should handle single character range', () => {
          const factory = testFactory()
          const result = factory.char({ lo: 65, hi: 65 }) // Just 'A'
          expect(result).to.equal('A')
        })
        it.each([
          [1488, 1514, { nBins: 27,  spread: 49, _lo: 'א', _cclo: 1488, _hi: 'ת', _cchi: 1514 }],
          [161,   981, { nBins: 821, count: 10_000, spread: 26, _lo: '¡', _cclo: 161, _hi: 'ϕ', _cchi: 981 }],
        ])('should have uniform distribution over %s <= x <= %s', (lo, hi, optsIn) => {
          const factory = testFactory();
          const opts = { count: 2 * LOTSA, ...optsIn, lo, hi, binner: (chr: string) => (chr.charCodeAt?.(0) ?? `oops ${chr}`), unkey: (chr: number) => String.fromCharCode(chr) }
          const result = exercise(() => factory.char(opts), opts)
          expect(checkDistStr(result, opts)).to.be.true
        })
      })

      describe('charBetween()', () => {
        it('should return a character between the specified characters', () => {
          const factory = testFactory()
          const result = factory.charBetween({ lo: 'm', hi: 'q' })
          expect(result).to.be.a('string').eql('o')
        })
        it('should use default range when no parameters provided', () => {
          const factory = testFactory()
          const result = exercise(() => factory.charBetween())
          expect(checkDistStr(result, { spread: 37, lo: 'a', hi: 'z', nBins: 26 })).to.be.true
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.charBetween({ lo: 'A', hi: 'Z' }), opts)
          const result2 = exercise(() => factory2.charBetween({ lo: 'A', hi: 'Z' }), opts)
          expect(result1).to.eql(result2)
        })
        it.each([
          ['A', 'A', 'A'], ['a', 'A', 'a'], ['_', 'A', '_'], ['!', ' ', '!'],
        ])('should handle degenerate range %s <= x <= %s', (lo, hi, expected) => {
          const factory = testFactory()
          const opts = { count: 10 }
          const result = exercise(() => factory.charBetween({ lo, hi }), opts)
          expect(result).to.be.a('array').eql(_.times(opts.count, _.constant(expected)))
        })
        it.each([
          ['א', 'ת', { nBins: 27,  spread: 55, _lo: 'א', _cclo: 1488, _hi: 'ת', _cchi: 1514 }],
          ['¡', 'ϕ', { nBins: 821, spread: 26, _lo: '¡', _cclo: 161, _hi: 'ϕ', _cchi: 981 }],
        ])('should have uniform distribution over %s <= x <= %s', (lo, hi, optsIn) => {
          // console.log(['🤷', '🙊', '1', 'T', '¡', '•', 'ϕ', '✅', '→', 'א', 'ת'].sort().map((str) => [str, str.charCodeAt(0), str.charCodeAt(1)]))
          const factory = testFactory(); const opts = { count: 3 * LOTSA, ...optsIn, lo, hi }
          const result = exercise(() => factory.charBetween(opts), opts)
          expect(checkDistStr(result, opts)).to.be.true
        })
      })

      describe('lower()', () => {
        it('should return a lowercase letter', () => {
          const factory = testFactory()
          const result = factory.lower()
          expect(result).to.be.a('string').eql('o')
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.lower(), opts)
          const result2 = exercise(() => factory2.lower(), opts)
          expect(result1).to.eql(result2)
        })
        it('should return different lowercase letters', () => {
          const factory = testFactory(); const opts = { count: 2 * LOTSA }
          const results = exercise(() => factory.lower(), opts)
          expect(checkDistStr(results, { ...opts, lo: 'a', hi: 'z', nBins: 26 })).to.be.true
        })
      })

      describe('upper()', () => {
        it('should return an uppercase letter', () => {
          const factory = testFactory()
          const result = factory.upper()
          expect(result).to.be.a('string').eql('O')
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.upper(), opts)
          const result2 = exercise(() => factory2.upper(), opts)
          expect(result1).to.eql(result2)
        })
        it('should return different uppercase letters', () => {
          const factory = testFactory(); const opts = { count: 2 * LOTSA }
          const results = exercise(() => factory.upper(), opts)
          expect(checkDistStr(results, { ...opts, lo: 'A', hi: 'Z', nBins: 26 })).to.be.true
        })
      })

      describe('azAZ()', () => {
        it('should return a letter (A-Z or a-z)', () => {
          const factory = testFactory()
          const result = factory.azAZ()
          expect(result).to.be.a('string').eql('c')
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.azAZ(), opts)
          const result2 = exercise(() => factory2.azAZ(), opts)
          expect(result1).to.eql(result2)
        })
        it('should return both uppercase and lowercase letters', () => {
          const factory = testFactory('azAZ'); const opts = { count: 8 * LOTSA }
          const results = exercise(() => factory.azAZ(), opts)
          expect(checkDistStr(results, { ...opts, spread: 71, lo: 'A', hi: 'z', nBins: 52 })).to.be.true
        })
      })

      describe('azAZ09()', () => {
        it('should return an alphanumeric character', () => {
          const factory = testFactory()
          const result = factory.azAZ09()

          expect(result).to.be.a('string')
          expect(result.length).to.equal(1)
          expect(result).to.match(/[A-Za-z0-9]/)
        })
        it('should return consistent results with same seed', () => {
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')

          const result1 = factory1.azAZ09()
          const result2 = factory2.azAZ09()

          expect(result1).to.equal(result2)
        })
        it('should return letters and digits', () => {
          const factory = testFactory()
          const results = exercise(() => factory.azAZ09())
          expect(checkDistStr(results, { lo: '0', hi: 'z', spread: 32, nBins: 62 })).to.be.true
        })
      })

      describe('numeral()', () => {
        it('should return a numeral', () => {
          const factory = testFactory()
          expect(factory.numeral()).to.be.a('string').eql('5')
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.numeral(), opts)
          const result2 = exercise(() => factory2.numeral(), opts)
          expect(result1).to.eql(result2)
        })
        it('should return different numerals', () => {
          const factory = testFactory()
          const results = exercise(() => factory.numeral())
          expect(checkDistStr(results, { lo: '0', hi: '9', nBins: 10 })).to.be.true
        })
      })
    })

    describe('Static one-shot numeric methods', () => {
      describe('RandomFactoryClass.rand01()', () => {
        it('should return a number between 0 and 1 exclusive', () => {
          const result = RandomFactoryClass.rand01('test')
          expect(result).to.be.a('number').eql(0.5442283215716328)
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.rand01(), opts)
          const result2 = exercise(() => factory2.rand01(), opts)
          expect(result1).to.eql(result2)
        })
        it('should return a uniform distribution of values across seeds', () => {
          const opts = { lo: 0, hi: 9, count: 3 * LOTSA, binner: (val: number) => Math.floor(val * 10) }
          const results = exercise((seq) => RandomFactoryClass.rand01(`test${seq}`), opts)
          expect(checkDistNum(results, opts)).to.be.true
        })
      })

      describe('RandomFactoryClass.rand()', () => {
        it('should return a number in the specified range', () => {
          const result = RandomFactoryClass.rand({ lo: 5, hi: 10 }, 'test')
          expect(result).to.be.a('number').eql(7.721141607858164)
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const factory1 = testFactory('consistent')
          const factory2 = testFactory('consistent')
          const result1 = exercise(() => factory1.rand({ lo: 1, hi: 5 }), opts)
          const result2 = exercise(() => factory2.rand({ lo: 1, hi: 5 }), opts)
          expect(result1).to.eql(result2)
        })
        it('should return a uniform distribution of values across seeds', () => {
          const opts = { lo: -5, hi: 14, count: 3 * LOTSA }
          const results = exercise((seq) => RandomFactoryClass.rand(opts, `test${seq}`), opts)
          expect(checkDistFloat(results, opts)).to.be.true
        })
      })

      describe('RandomFactoryClass.int()', () => {
        it('should return an integer in the specified range', () => {
          const result = RandomFactoryClass.int({ lo: 1, hi: 10 }, 'test')
          expect(result).to.be.a('number').eql(6)
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const result1 = exercise((seq: number) => RandomFactoryClass.int({ lo: 1, hi: 10 }, `test${seq}`), opts)
          const result2 = exercise((seq: number) => RandomFactoryClass.int({ lo: 1, hi: 10 }, `test${seq}`), opts)
          expect(result1).to.eql(result2)
        })
        it('should return a uniform distribution of values across seeds', () => {
          const opts = { lo: -5, hi: 14,  count: 3 * LOTSA }
          const results = exercise((seq) => RandomFactoryClass.int(opts, `test${seq}`), opts)
          expect(checkDistNum(results, opts)).to.be.true
        })
      })

      describe('RandomFactoryClass.uint32()', () => {
        it('should return an integer between 0 and MAX_UINT32 inclusive', () => {
          const result = RandomFactoryClass.uint32('test')
          expect(result).to.be.a('number').eql(189959194) // 2^32 -1
        })
        it('should return consistent results with same seed', () => {
          const opts = { count: 20 }
          const result1 = exercise(() => RandomFactoryClass.uint32('consistent'), opts)
          const result2 = exercise(() => RandomFactoryClass.uint32('consistent'), opts)
          expect(result1).to.eql(result2)
        })
        it('should return a uniform distribution of values across seeds', () => {
          const opts = {
            lo: 0, hi: 19,  count: 3 * LOTSA, nBins: 20, binner: (val: number) => Math.floor((val / (2**32 - 1)) * 20),
          }
          const results = exercise((seq) => RandomFactoryClass.uint32(`test${seq}`), opts)
          expect(checkDistNum(results, opts)).to.be.true
        })
      })
    })
  })

  describe('Streaming methods', () => {
    describe('RandomFactoryClass.rand01sStar()', () => {
      it('should return a number between 0 and 1 exclusive', () => {
        const results = [...RandomFactoryClass.rand01sStar(10, 'test')]
        expect(results).to.be.a('array').of.length(10).eql([
          0.5442283214069903, 0.7071346458978951, 0.7247104682028294, 0.18215877166949213, 0.40387626527808607,
          0.6793456706218421, 0.3913689369801432, 0.34771870146505535, 0.8993504859972745, 0.5323070492595434
        ])
      })
      it('should have a uniform distribution of values on a single seed', () => {
        const opts = { count: 60 }
        const nBins = 5
        const hints = { ...opts, nBins, lo: 0, hi: 1 }
        const results = [...RandomFactoryClass.rand01sStar(opts.count, 'test')]
        expect(checkDistBinned(results, hints)).to.be.true
      })
      it('should have different values for different seeds', () => {
        const opts = { count: LOTSA }
        const results1 = [...RandomFactoryClass.rand01sStar(opts.count, 'test')]
        const results2 = [...RandomFactoryClass.rand01sStar(opts.count, 'test2')]
        expect(results1).to.not.eql(results2)
      })
      it('should give the same results as the one-shot method', () => {
        const opts = { count: LOTSA }
        const factory = testFactory()
        const results1 = [...RandomFactoryClass.rand01sStar(opts.count, TestSeed)]
        const results2 = exercise(() => factory.rand01(), opts)
        expect(results1).to.eql(results2)
      })
    })
    describe('RandomFactoryClass.randsStar()', () => {
      it('should return a number between 0 and 1 exclusive', () => {
        const results = [...RandomFactoryClass.randsStar({ count: 10 }, 'test')]
        expect(results).to.be.a('array').of.length(10).eql([
          0.5442283214069903, 0.7071346458978951, 0.7247104682028294, 0.18215877166949213, 0.40387626527808607,
          0.6793456706218421, 0.3913689369801432, 0.34771870146505535, 0.8993504859972745, 0.5323070492595434
        ])
      })
      it('should have a uniform distribution of values on a single seed', () => {
        const opts = { count: 60 }
        const nBins = 5
        const hints = { ...opts, nBins, lo: 0, hi: 1 }
        const results = [...RandomFactoryClass.randsStar(opts, 'test')]
        expect(checkDistBinned(results, hints)).to.be.true
      })
      it('should have different values for different seeds', () => {
        const opts = { count: LOTSA }
        const results1 = [...RandomFactoryClass.randsStar(opts, 'test')]
        const results2 = [...RandomFactoryClass.randsStar(opts, 'test2')]
        expect(results1).to.not.eql(results2)
      })
      it.each([
        { lo:    0, hi:   1 }, { lo: 0,   hi: 10 },  { lo: -4, hi:  6 },
        { lo: -4.5, hi: 3.2 }, { lo: 100, hi: 1001}, { lo:  0, hi: -1 },
      ])('should give the same results for %s', (optsIn) => {
        const opts = { count: LOTSA, ...optsIn }
        const factory = testFactory()
        const results1 = [...RandomFactoryClass.randsStar(opts, TestSeed)]
        const results2 = exercise(() => factory.rand(opts), opts)
        expect(results1).to.eql(results2)
      })
    })
  })
})