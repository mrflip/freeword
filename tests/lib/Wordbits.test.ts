import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import type * as TY                               from '@freeword/meta'
import      { Wordbits, UF }                      from '@freeword/meta'
import      { ExampleWords }                      from '../Fixtures.ts'
import { checkSnapshot }                          from '../TestHelpers.ts'

const { prettyWordbits } = Wordbits

describe('Wordbits', () => {

  describe('wordbitsForWord', () => {
    it('should convert a word to a bitfield', () => {
      //                                                    zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
      expect(Wordbits.wordbitsForWord('abc'   )).to.equal(0b00_0000_0000_0000_0000_0000_0111)
      expect(Wordbits.wordbitsForWord('zij'   )).to.equal(0b10_0000_0000_0000_0011_0000_0000)
      expect(Wordbits.wordbitsForWord('abczij')).to.equal(0b10_0000_0000_0000_0011_0000_0111)
    })
    it('gives same results with dupes', () => {
      //                                                    zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
      expect(Wordbits.wordbitsForWord('abcabcaaaa')).to.equal(0b00_0000_0000_0000_0000_0000_0111)
      expect(Wordbits.wordbitsForWord('zijjijizzz')).to.equal(0b10_0000_0000_0000_0011_0000_0000)
    })
    it('has stable snapshot', () => {
      const results = _.map(ExampleWords, Wordbits.wordbitsForWord)
      expect(checkSnapshot(results)).to.be.true
    })
  })

  const SetOpsExampleWords  = ['chimp', 'imp', 'chimps', 'adios', 'ado']
  type  SetOpsExampleWord = (typeof SetOpsExampleWords)[number]
  const chimpsOps = { //
    aMinusB:           { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    inEither:          { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    inBoth:            { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    inEitherNotBoth:   { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    hasOverlap:        { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    hasNoOverlap:      { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    isEqual:           { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    aHasAllOfB:        { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    aHasAllAndMoreB:   { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    aHasMissingFromB:  { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    missingFrom:       { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    countUniqLtrs:     { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
    rot13Wordbits:     { chimp: '', imp: '', chimps: '', adios: '', ado: '' },
  } as const satisfies Partial<Record<keyof typeof Wordbits, Record<SetOpsExampleWord, string>>>
  const chimpsBits = Wordbits.wordbitsForWord('chimps')
  const chimpBits  = Wordbits.wordbitsForWord('chimp')
  const adoBits    = Wordbits.wordbitsForWord('ado')
  const adiosBits  = Wordbits.wordbitsForWord('adios')
  const impBits    = Wordbits.wordbitsForWord('imp')

  describe('aHasAllOfBMasked', () => {
    const chimpsMask = Wordbits.containsMaskForWord('chimps')
    const adoMask    = Wordbits.containsMaskForWord('ado')
    it('should return true for matching words', () => {
      expect(Wordbits.aHasAllOfBMasked(chimpsMask,  chimpBits)).to.be.true  // a subset of b
      expect(Wordbits.aHasAllOfBMasked(chimpsMask,    impBits)).to.be.true    // a subset of b
      expect(Wordbits.aHasAllOfBMasked(chimpsMask, chimpsBits)).to.be.true // a equal  to b
      expect(Wordbits.aHasAllOfBMasked(adoMask,       adoBits)).to.be.true    // a equal  to b
    })
    it('should return false for non-matching words', () => {
      expect(Wordbits.aHasAllOfBMasked(chimpsMask,  adiosBits)).to.be.false  // intersect with leftovers in each
      expect(Wordbits.aHasAllOfBMasked(chimpsMask,    adoBits)).to.be.false    // do not intersect
      expect(Wordbits.aHasAllOfBMasked(adoMask,    chimpsBits)).to.be.false // do not intersect
      expect(Wordbits.aHasAllOfBMasked(adoMask,       impBits)).to.be.false // do not intersect
      expect(Wordbits.aHasAllOfBMasked(adoMask,     chimpBits)).to.be.false // do not intersect
      expect(Wordbits.aHasAllOfBMasked(adoMask,     adiosBits)).to.be.false  // b has letters not in a
    })
  })

  describe('digestWordbits', () => {
    it.each(ExampleWords)('should digest %s correctly', ((word: TY.Word) => {
      const digested = Wordbits.digestWord(word)
      const expectedUniqs = _.sortedUniq(word.split('').sort())
      const [beg, end] = [_.first(word), _.last(word)]
      //
      expect(digested.uniqarr).to.eql(expectedUniqs)
      expect(digested.beg).to.eql(beg)
      expect(digested.end).to.eql(end)
      expect(Wordbits.wordForWordbits(digested.wordbits)).to.eql(expectedUniqs.join(''))
      expect(Wordbits.wordForWordbits(digested.begbit)).to.eql(beg)
      expect(Wordbits.wordForWordbits(digested.endbit)).to.eql(end)
      expect(Wordbits.wordForWordbits(digested.missbits)).to.eql(_.without(UF.AtoZlos, ...expectedUniqs).join(''))
    }) as any)
    describe('DigestedExamples', () => {
      function atozArr(str: string) { return str.split('') as TY.AtoZlo[] }
      // align with (uniqarr|dupearr|\w+bits):
      const DigestedExamples: Record<TY.Word, Wordbits.DigestedWord> = {
        monkeyshines: { word: 'monkeyshines', beg: 'm', end: 's', ltrs: atozArr('eehikmnnossy'), uniqarr: atozArr('ehikmnosy'), dupearr: atozArr('ens'),  wordbits: 0b01_0000_0100_0111_0101_1001_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b10_1111_1011_1000_1010_0110_1111 },
        mom:          { word: 'mom',          beg: 'm', end: 'm', ltrs: atozArr('mmo'),          uniqarr: atozArr('mo'),        dupearr: atozArr('m'),    wordbits: 0b00_0000_0000_0101_0000_0000_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0001_0000_0000_0000, missbits: 0b11_1111_1111_1010_1111_1111_1111 },
        mon:          { word: 'mon',          beg: 'm', end: 'n', ltrs: atozArr('mno'),          uniqarr: atozArr('mno'),       dupearr: atozArr(''),     wordbits: 0b00_0000_0000_0111_0000_0000_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0010_0000_0000_0000, missbits: 0b11_1111_1111_1000_1111_1111_1111 },
        monkeyish:    { word: 'monkeyish',    beg: 'm', end: 'h', ltrs: atozArr('ehikmnosy'),    uniqarr: atozArr('ehikmnosy'), dupearr: atozArr(''),     wordbits: 0b01_0000_0100_0111_0101_1001_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_1000_0000, missbits: 0b10_1111_1011_1000_1010_0110_1111 },
        nemesis:      { word: 'nemesis',      beg: 'n', end: 's', ltrs: atozArr('eeimnss'),      uniqarr: atozArr('eimns'),     dupearr: atozArr('es'),   wordbits: 0b00_0000_0100_0011_0001_0001_0000, begbit: 0b00_0000_0000_0010_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1011_1100_1110_1110_1111 },
        minimises:    { word: 'minimises',    beg: 'm', end: 's', ltrs: atozArr('eiiimmnss'),    uniqarr: atozArr('eimns'),     dupearr: atozArr('iims'), wordbits: 0b00_0000_0100_0011_0001_0001_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1011_1100_1110_1110_1111 },
        sermonisers:  { word: 'sermonisers',  beg: 's', end: 's', ltrs: atozArr('eeimnorrsss'),  uniqarr: atozArr('eimnors'),   dupearr: atozArr('erss'), wordbits: 0b00_0000_0110_0111_0001_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1001_1000_1110_1110_1111 },
        sermonises:   { word: 'sermonises',   beg: 's', end: 's', ltrs: atozArr('eeimnorsss'),   uniqarr: atozArr('eimnors'),   dupearr: atozArr('ess'),  wordbits: 0b00_0000_0110_0111_0001_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1001_1000_1110_1110_1111 },
      }
      // console.log(UF.prettify(_.mapValues(DigestedExamples, (_x, word) => {
      //   const digested = Wordbits.digestWord(word)
      //   const { word:_w, beg, end, ltrs,               uniqarr,                    dupearr, begbit, endbit,  missbits, wordbits } = digested
      //   return { word,   beg, end, ltrs: ltrs.join(''), uniqarr: uniqarr.join(''), dupearr: dupearr.join(''), wordbits: prettyWordbits(wordbits), begbit: prettyWordbits(begbit), endbit: prettyWordbits(endbit), missbits: prettyWordbits(missbits) }
      // })))
      it.each(_.entries(DigestedExamples))('should digest %s', (word, wanted) => {
        expect(Wordbits.digestWord(word)).to.eql(wanted)
      })
    })
  })

  describe('countUniqLtrs', () => {
    const numbers = _.range(0, 2**12)
    it('should count bits in a 12-bit number', () => {
      const naive1     = _.map(numbers, countBits14Naive)
      const magic1     = _.map(numbers, Wordbits.countBits14Magic)
      const noop1      = _.map(numbers, _.noop)
      const naive2     = _.map(numbers, countBits14Naive)
      const magic2     = _.map(numbers, Wordbits.countBits14Magic)
      const noop2      = _.map(numbers, _.noop)
      const naiveStart = performance.now()
      const naive3a    = _.map(numbers, countBits14Naive)
      const naive3b    = _.map(numbers, countBits14Naive)
      const naive3c    = _.map(numbers, countBits14Naive)
      const naive3d    = _.map(numbers, countBits14Naive)
      const naiveTime  = performance.now() - naiveStart
      const magicStart = performance.now()
      const magic3a    = _.map(numbers, Wordbits.countBits14Magic)
      const magic3b    = _.map(numbers, Wordbits.countBits14Magic)
      const magic3c    = _.map(numbers, Wordbits.countBits14Magic)
      const magic3d    = _.map(numbers, Wordbits.countBits14Magic)
      const magicTime  = performance.now() - magicStart
      const noopStart  = performance.now()
      const noop3a     = _.map(numbers, _.noop)
      const noop3b     = _.map(numbers, _.noop)
      const noop3c     = _.map(numbers, _.noop)
      const noop3d     = _.map(numbers, _.noop)
      const noopTime   = performance.now() - noopStart
      console.info(`Naive: ${naiveTime.toFixed(3)}ms, Magic: ${magicTime.toFixed(3)}ms, Noop: ${noopTime.toFixed(3)}ms`)
      expect(naive1).to.eql(magic1)
      // const fmt   = _.repeat(' %2d,', 32)
      // const lines = _.chunk(naive, 32).map((line) => UF.vsprintf(fmt, line))
      expect({ naive1, magic1, noop1, naive2, magic2, noop2, naive3a, magic3a, noop3a, naive3b, magic3b, noop3b, naive3c, magic3c, noop3c, naive3d, magic3d, noop3d, naiveTime, magicTime, noopTime }).to.be.an('object')
    })
    it('should count bits in a 28-bit number by magic bit flicking', () => {
      const pow2from00to12   = _.range(0, 4000).map((x) => 2**x)
      const pow2fromto12   = _.range(0, 2**12)
      const naive     = [
        ..._.map(numbers, countBits28Naive),
      ]
      const magic     = _.map(numbers, Wordbits.countBits28)
      expect(magic).to.eql(naive)
    })
  })

  describe('prettyGamebits/prettyWordbits', () => {
    it('should produce a 26-bit number as a string with separators', () => {
      _.each(ExampleWords, (word) => {
        const wordbits = Wordbits.wordbitsForWord(word)
        const result = prettyWordbits(wordbits)
        const plain  = result.replaceAll(/[_]/g, '')
        expect(result).to.match(/^0b[01]{2}_[01]{4}_[01]{4}_[01]{4}_[01]{4}_[01]{4}_[01]{4}$/)
        expect(plain).to.equal(UF.sprintf('0b%026b', wordbits))
      })
    })
  })
})

/** For testing, and convincing the skeptic */
function countBits14Naive(bitfield: number): number {
  let count = 0;
  for (const place of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
    if (bitfield & (1 << place)) {
      count += 1
    }
  }
  return count
}
function countBits28Naive(bitfield: number): number {
  let count = 0;
  for (const place of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]) {
    if (bitfield & (1 << place)) {
      count += 1
    }
  }
  return count
}