import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import type * as TY                               from '@freeword/meta'
import      { Wordbits, UF }                      from '@freeword/meta'
import      { ExampleWords }                  from '../Fixtures.ts'
import { checkSnapshot } from '../TestHelpers.ts'

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
    it.each(ExampleWords)('should return false for non-matching words', (word) => {
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
      expect(Wordbits.ltrsForWordbits(digested.wordbits)).to.eql(expectedUniqs)
      expect(Wordbits.ltrsForWordbits(digested.begbit)).to.eql(_.without(expectedUniqs, beg, end))
      expect(Wordbits.ltrsForWordbits(digested.endbit)).to.eql(_.without(expectedUniqs, end))
      expect(Wordbits.ltrsForWordbits(digested.missbits)).to.eql(_.without(expectedUniqs, beg))
    }) as any)
    describe('DigestedExamples', () => {
      // align with (uniqarr|dupearr|\w+bits):
      const DigestedExamples: Record<TY.Word, Wordbits.DigestedWord> = {
        monkeyshines: { word: 'monkeyshines', uniqarr: 'ehikmnosy'.split(''), beg: 'm', end: 's', uniqstr: 'ehikmnosy', dupestr: 'ens',  missstr: 'afr',        headstr: 'ehikmnoy', midstr: 'ehiknoy', tailstr: 'ehiknosy', dupearr: 'ens'.split(''),  gamebits: 0b1101_1111_1010, missbits: 0b0010_0000_0101, midbits: 0b1001_1011_1010, headbits: 0b1001_1111_1010, tailbits: 0b1101_1011_1010, begbits: 0b0000_0100_0000, endbits: 0b0100_0000_0000 },
        mom:          { word: 'mom',          uniqarr: 'mo'.split(''),        beg: 'm', end: 'm', uniqstr: 'mo',        dupestr: 'm',    missstr: 'aefhiknrsy', headstr: 'o',        midstr: 'o',       tailstr: 'o',        dupearr: 'm'.split(''),    gamebits: 0b0001_0100_0000, missbits: 0b1110_1011_1111, midbits: 0b0001_0000_0000, headbits: 0b0001_0000_0000, tailbits: 0b0001_0000_0000, begbits: 0b0000_0100_0000, endbits: 0b0000_0100_0000 },
        mon:          { word: 'mon',          uniqarr: 'mno'.split(''),       beg: 'm', end: 'n', uniqstr: 'mno',       dupestr: '',     missstr: 'aefhikrsy',  headstr: 'mo',       midstr: 'o',       tailstr: 'no',       dupearr: ''.split(''),     gamebits: 0b0001_1100_0000, missbits: 0b1110_0011_1111, midbits: 0b0001_0000_0000, headbits: 0b0001_0100_0000, tailbits: 0b0001_1000_0000, begbits: 0b0000_0100_0000, endbits: 0b0000_1000_0000 },
        monkeyish:    { word: 'monkeyish',    uniqarr: 'ehikmnosy'.split(''), beg: 'm', end: 'h', uniqstr: 'ehikmnosy', dupestr: '',     missstr: 'afr',        headstr: 'eikmnosy', midstr: 'eiknosy', tailstr: 'ehiknosy', dupearr: ''.split(''),     gamebits: 0b1101_1111_1010, missbits: 0b0010_0000_0101, midbits: 0b1101_1011_0010, headbits: 0b1101_1111_0010, tailbits: 0b1101_1011_1010, begbits: 0b0000_0100_0000, endbits: 0b0000_0000_1000 },
        nemesis:      { word: 'nemesis',      uniqarr: 'eimns'.split(''),     beg: 'n', end: 's', uniqstr: 'eimns',     dupestr: 'es',   missstr: 'afhkory',    headstr: 'eimn',     midstr: 'eim',     tailstr: 'eims',     dupearr: 'es'.split(''),   gamebits: 0b0100_1101_0010, missbits: 0b1011_0010_1101, midbits: 0b0000_0101_0010, headbits: 0b0000_1101_0010, tailbits: 0b0100_0101_0010, begbits: 0b0000_1000_0000, endbits: 0b0100_0000_0000 },
        minimises:    { word: 'minimises',    uniqarr: 'eimns'.split(''),     beg: 'm', end: 's', uniqstr: 'eimns',     dupestr: 'iims', missstr: 'afhkory',    headstr: 'eimn',     midstr: 'ein',     tailstr: 'eins',     dupearr: 'iims'.split(''), gamebits: 0b0100_1101_0010, missbits: 0b1011_0010_1101, midbits: 0b0000_1001_0010, headbits: 0b0000_1101_0010, tailbits: 0b0100_1001_0010, begbits: 0b0000_0100_0000, endbits: 0b0100_0000_0000 },
        sermonisers:  { word: 'sermonisers',  uniqarr: 'eimnors'.split(''),   beg: 's', end: 's', uniqstr: 'eimnors',   dupestr: 'erss', missstr: 'afhky',      headstr: 'eimnor',   midstr: 'eimnor',  tailstr: 'eimnor',   dupearr: 'erss'.split(''), gamebits: 0b0111_1101_0010, missbits: 0b1000_0010_1101, midbits: 0b0011_1101_0010, headbits: 0b0011_1101_0010, tailbits: 0b0011_1101_0010, begbits: 0b0100_0000_0000, endbits: 0b0100_0000_0000 },
        sermonises:   { word: 'sermonises',   uniqarr: 'eimnors'.split(''),   beg: 's', end: 's', uniqstr: 'eimnors',   dupestr: 'ess',  missstr: 'afhky',      headstr: 'eimnor',   midstr: 'eimnor',  tailstr: 'eimnor',   dupearr: 'ess'.split(''),  gamebits: 0b0111_1101_0010, missbits: 0b1000_0010_1101, midbits: 0b0011_1101_0010, headbits: 0b0011_1101_0010, tailbits: 0b0011_1101_0010, begbits: 0b0100_0000_0000, endbits: 0b0100_0000_0000 },
      }
      // console.log(UF.prettify(_.mapValues(DigestedExamples, (_x, word) => {
      //   const { word:_w, uniqarr, dupearr, gamebits, missbits, midbits, headbits, tailbits, begbits, endbits, ...rest } = wayDigestGameword(word, gamebitsTable)
      //   return { word, ...rest, uniqarr: uniqarr.join(''), dupearr: dupearr.join(''), gamebits: prettyGamebits(gamebits), missbits: prettyGamebits(missbits), midbits: prettyGamebits(midbits), headbits: prettyGamebits(headbits), tailbits: prettyGamebits(tailbits), begbits: prettyGamebits(begbits), endbits: prettyGamebits(endbits) }
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
      const pow2from00to12   = _.range(0, 4000).map((x) => )
      const pow2fromto12   = _.range(0, 2**12)
      const naive     = [
        ..._.map(numbers, countBits28Naive),
      const magic     = _.map(numbers, Wordbits.countBits28)
      expect(magic).to.eql(naive)
    })
  })

  describe('prettyGamebits/prettyWordbits', () => {
    it('should produce a 26-bit number as a string with separators', () => {
      _.each(AllGameWords, (word) => {
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