import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import type * as TY                               from '@/lib/types.ts'
import      * as UF                               from '@/lib/UF.js'
import      * as Bitflicker                       from '@/lib/Bitflicker.js'
import { ExampleGamekeys, ExampleWords, NotGameWords, type ExampleGamename } from './Fixtures.ts'
import { prettyGamebits, prettyWordbits, digestGameword, wayDigestGameword, ltrsForGamebits } from '@/lib/Bitflicker.js'

describe('Bitflicker', () => {
  const AllGameWords: TY.Word[] = _.uniq(_.flatMap(ExampleWords, _.values).sort())

  describe('wordbitsForWord', () => {
    it('should convert a word to a bitfield', () => {
      //                                                    zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
      expect(Bitflicker.wordbitsForWord('abc'   )).to.equal(0b00_0000_0000_0000_0000_0000_0111)
      expect(Bitflicker.wordbitsForWord('zij'   )).to.equal(0b10_0000_0000_0000_0011_0000_0000)
      expect(Bitflicker.wordbitsForWord('abczij')).to.equal(0b10_0000_0000_0000_0011_0000_0111)
    })
    it('gives same results with dupes', () => {
      //                                                    zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
      expect(Bitflicker.wordbitsForWord('abcabcaaaa')).to.equal(0b00_0000_0000_0000_0000_0000_0111)
      expect(Bitflicker.wordbitsForWord('zijjijizzz')).to.equal(0b10_0000_0000_0000_0011_0000_0000)
    })
  })

  describe('hitForLexmask', () => {
    it.each(_.entries(ExampleGamekeys))('should return true for all words in the %s game', (gamename, gamekey) => {
      const { lexmask } = Bitflicker.digestGamekey(gamekey)
      _.each(ExampleWords[gamename], (word) => {
        const result = Bitflicker.hitForLexmask(lexmask, Bitflicker.wordbitsForWord(word))
        expect(result).to.be.true
      })
    })
    it.each(_.entries(ExampleGamekeys))('should return false for all words not accepted by the %s game', (gamename, gamekey) => {
      const { lexmask } = Bitflicker.digestGamekey(gamekey)
      // const notwords = _.reject(AllGameWords, (word) => (Bitflicker.hitForLexmask(lexmask, Bitflicker.wordbitsForWord(word)) || (word.length > 14)))
      // console.log(UF.prettifyInChunks(notwords, { colwd: 16, chunkSize: 6, key: gamename }))
      _.each(NotGameWords[gamename], (word) => {
        const result = Bitflicker.hitForLexmask(lexmask, Bitflicker.wordbitsForWord(word))
        expect(result).to.be.false
      })
    })
  })

  describe('ltrsForGamebits', () => {
    // const gamebags = _.entries(ExampleGamekeys)
    const gamebags = _.entries(_.pick(ExampleGamekeys, 'monkeyshines'))
    it.each(gamebags)('should convert %s gameltrs to a uniqarr', (gamename, gamekey) => {
      const { gameltrs, gamebitsTable } = Bitflicker.digestGamekey(gamekey)
      const words = ExampleWords[gamename]
      _.each(words, (word) => {
        const digested = digestGameword(word, gamebitsTable)
        const expectedUniqs = _.sortedUniq(word.split('').sort())
        const [beg, end] = [_.first(word), _.last(word)]
        //
        expect(digested.uniqarr).to.eql(expectedUniqs)
        expect(digested.beg).to.eql(beg)
        expect(digested.end).to.eql(end)
        expect(ltrsForGamebits(digested.gamebits, gameltrs)).to.eql(expectedUniqs)
        expect(ltrsForGamebits(digested.midbits,  gameltrs)).to.eql(_.without(expectedUniqs, beg, end))
        expect(ltrsForGamebits(digested.headbits, gameltrs)).to.eql(_.without(expectedUniqs, end))
        expect(ltrsForGamebits(digested.tailbits, gameltrs)).to.eql(_.without(expectedUniqs, beg))
      })
    })


    describe('DigestedExamples', () => {
      // align with (uniqarr|dupearr|\w+bits):
      const DigestedExamples: Record<TY.Word, Bitflicker.WayDigestedWord> = {
        monkeyshines: { word: 'monkeyshines', uniqarr: 'ehikmnosy'.split(''), beg: 'm', end: 's', uniqstr: 'ehikmnosy', dupestr: 'ens',  missstr: 'afr',        headstr: 'ehikmnoy', midstr: 'ehiknoy', tailstr: 'ehiknosy', dupearr: 'ens'.split(''),  gamebits: 0b1101_1111_1010, missbits: 0b0010_0000_0101, midbits: 0b1001_1011_1010, headbits: 0b1001_1111_1010, tailbits: 0b1101_1011_1010, begbits: 0b0000_0100_0000, endbits: 0b0100_0000_0000 },
        mom:          { word: 'mom',          uniqarr: 'mo'.split(''),        beg: 'm', end: 'm', uniqstr: 'mo',        dupestr: 'm',    missstr: 'aefhiknrsy', headstr: 'o',        midstr: 'o',       tailstr: 'o',        dupearr: 'm'.split(''),    gamebits: 0b0001_0100_0000, missbits: 0b1110_1011_1111, midbits: 0b0001_0000_0000, headbits: 0b0001_0000_0000, tailbits: 0b0001_0000_0000, begbits: 0b0000_0100_0000, endbits: 0b0000_0100_0000 },
        mon:          { word: 'mon',          uniqarr: 'mno'.split(''),       beg: 'm', end: 'n', uniqstr: 'mno',       dupestr: '',     missstr: 'aefhikrsy',  headstr: 'mo',       midstr: 'o',       tailstr: 'no',       dupearr: ''.split(''),     gamebits: 0b0001_1100_0000, missbits: 0b1110_0011_1111, midbits: 0b0001_0000_0000, headbits: 0b0001_0100_0000, tailbits: 0b0001_1000_0000, begbits: 0b0000_0100_0000, endbits: 0b0000_1000_0000 },
        monkeyish:    { word: 'monkeyish',    uniqarr: 'ehikmnosy'.split(''), beg: 'm', end: 'h', uniqstr: 'ehikmnosy', dupestr: '',     missstr: 'afr',        headstr: 'eikmnosy', midstr: 'eiknosy', tailstr: 'ehiknosy', dupearr: ''.split(''),     gamebits: 0b1101_1111_1010, missbits: 0b0010_0000_0101, midbits: 0b1101_1011_0010, headbits: 0b1101_1111_0010, tailbits: 0b1101_1011_1010, begbits: 0b0000_0100_0000, endbits: 0b0000_0000_1000 },
        nemesis:      { word: 'nemesis',      uniqarr: 'eimns'.split(''),     beg: 'n', end: 's', uniqstr: 'eimns',     dupestr: 'es',   missstr: 'afhkory',    headstr: 'eimn',     midstr: 'eim',     tailstr: 'eims',     dupearr: 'es'.split(''),   gamebits: 0b0100_1101_0010, missbits: 0b1011_0010_1101, midbits: 0b0000_0101_0010, headbits: 0b0000_1101_0010, tailbits: 0b0100_0101_0010, begbits: 0b0000_1000_0000, endbits: 0b0100_0000_0000 },
        minimises:    { word: 'minimises',    uniqarr: 'eimns'.split(''),     beg: 'm', end: 's', uniqstr: 'eimns',     dupestr: 'iims', missstr: 'afhkory',    headstr: 'eimn',     midstr: 'ein',     tailstr: 'eins',     dupearr: 'iims'.split(''), gamebits: 0b0100_1101_0010, missbits: 0b1011_0010_1101, midbits: 0b0000_1001_0010, headbits: 0b0000_1101_0010, tailbits: 0b0100_1001_0010, begbits: 0b0000_0100_0000, endbits: 0b0100_0000_0000 },
        sermonisers:  { word: 'sermonisers',  uniqarr: 'eimnors'.split(''),   beg: 's', end: 's', uniqstr: 'eimnors',   dupestr: 'erss', missstr: 'afhky',      headstr: 'eimnor',   midstr: 'eimnor',  tailstr: 'eimnor',   dupearr: 'erss'.split(''), gamebits: 0b0111_1101_0010, missbits: 0b1000_0010_1101, midbits: 0b0011_1101_0010, headbits: 0b0011_1101_0010, tailbits: 0b0011_1101_0010, begbits: 0b0100_0000_0000, endbits: 0b0100_0000_0000 },
        sermonises:   { word: 'sermonises',   uniqarr: 'eimnors'.split(''),   beg: 's', end: 's', uniqstr: 'eimnors',   dupestr: 'ess',  missstr: 'afhky',      headstr: 'eimnor',   midstr: 'eimnor',  tailstr: 'eimnor',   dupearr: 'ess'.split(''),  gamebits: 0b0111_1101_0010, missbits: 0b1000_0010_1101, midbits: 0b0011_1101_0010, headbits: 0b0011_1101_0010, tailbits: 0b0011_1101_0010, begbits: 0b0100_0000_0000, endbits: 0b0100_0000_0000 },
      }
      const { gamebitsTable } = Bitflicker.digestGamekey(ExampleGamekeys.monkeyshines)
      // console.log(UF.prettify(_.mapValues(DigestedExamples, (_x, word) => {
      //   const { word:_w, uniqarr, dupearr, gamebits, missbits, midbits, headbits, tailbits, begbits, endbits, ...rest } = wayDigestGameword(word, gamebitsTable)
      //   return { word, ...rest, uniqarr: uniqarr.join(''), dupearr: dupearr.join(''), gamebits: prettyGamebits(gamebits), missbits: prettyGamebits(missbits), midbits: prettyGamebits(midbits), headbits: prettyGamebits(headbits), tailbits: prettyGamebits(tailbits), begbits: prettyGamebits(begbits), endbits: prettyGamebits(endbits) }
      // })))
      it.each(_.entries(DigestedExamples))('should digest %s', (word, wanted) => {
        expect(wayDigestGameword(word, gamebitsTable)).to.eql(wanted)
      })
    })

  })

  const ExpectedWordbits: Record<ExampleGamename, { gamekey: TY.Gamekey, ltrstr: TY.Shingle, wordbits: TY.WordbitsT, lexmask: TY.WordbitsT }> = {
    //                                                                              zy_xwvu_tsrq_ponm_lkji_hgfe_dcba             zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
    monkeyshines: { gamekey: 'myh-kfr-oei-nsa', ltrstr: 'aefhikmnorsy', wordbits: 0b01_0000_0110_0111_0101_1011_0001, lexmask: 0b10_1111_1001_1000_1010_0100_1110 },
    medium:       { gamekey: 'myn-kgu-vre-ioa', ltrstr: 'aegikmnoruvy', wordbits: 0b01_0011_0010_0111_0101_0101_0001, lexmask: 0b10_1100_1101_1000_1010_1010_1110 },
    mini:         { gamekey: 'myk-ngu-vre-ioa', ltrstr: 'aegikmnoruvy', wordbits: 0b01_0011_0010_0111_0101_0101_0001, lexmask: 0b10_1100_1101_1000_1010_1010_1110 },
    tiny:         { gamekey: 'ack-zon-rew-bhy', ltrstr: 'abcehknorwyz', wordbits: 0b11_0100_0010_0110_0100_1001_0111, lexmask: 0b00_1011_1101_1001_1011_0110_1000 },
    mondo:        { gamekey: 'eoa-tnr-usc-ihl', ltrstr: 'acehilnorstu', wordbits: 0b00_0001_1110_0110_1001_1001_0101, lexmask: 0b11_1110_0001_1001_0110_0110_1010 },
    weird:        { gamekey: 'ats-ncb-lod-ikp', ltrstr: 'abcdiklnopst', wordbits: 0b00_0000_1100_1110_1101_0000_1111, lexmask: 0b11_1111_0011_0001_0010_1111_0000 },
  }

  describe('wordbitsForGameltrs', () => {
    it.each(_.entries(ExampleGamekeys))('should convert %s gameltrs to a wordbits and lexmask', (gamename, gamekey) => {
      // console.log(UF.prettify(_.mapValues(ExampleGamekeys, (gamekey) => {
      //   const  { gameltrs, wordbits, lexmask } = Bitflicker.digestGamekey(gamekey);
      //   return { gamekey, gameltrs: gameltrs.join(''), wordbits: prettyWordbits(wordbits), lexmask: prettyWordbits(lexmask) }
      // })))
      const result = Bitflicker.digestGamekey(gamekey)
      const wanted = ExpectedWordbits[gamename]
      expect(result).property('gameltrs').to.eql(wanted.ltrstr.split(''))
      expect(result).property('gamekey').to.equal(gamekey)
      expect(result).property('wordbits').to.equal(wanted.wordbits)
      expect(result).property('lexmask').to.equal(wanted.lexmask)
    })
  })

  describe('prettyGamebits/prettyWordbits', () => {
    it('should produce a 12-bit number as a string with separators', () => {
      _.range(0, 2**12).forEach((wordbits) => {
        const result = prettyGamebits(wordbits)
        const plain     = result.replaceAll(/[_]/g, '')
        expect(result).to.match(/^0b[01]{4}_[01]{4}_[01]{4}$/)
        expect(plain).to.equal(UF.sprintf('0b%012b', wordbits))
      })
    })
    it('should produce a 26-bit number as a string with separators', () => {
      _.each(AllGameWords, (word) => {
        const wordbits = Bitflicker.wordbitsForWord(word)
        const result = prettyWordbits(wordbits)
        const plain  = result.replaceAll(/[_]/g, '')
        expect(result).to.match(/^0b[01]{2}_[01]{4}_[01]{4}_[01]{4}_[01]{4}_[01]{4}_[01]{4}$/)
        expect(plain).to.equal(UF.sprintf('0b%026b', wordbits))
      })
    })
  })

  describe('counting bits', () => {
    const numbers = _.range(0, 2**12)
    it('should count bits in a 12-bit number', () => {
      const naive1     = _.map(numbers, countBits14Naive)
      const magic1     = _.map(numbers, Bitflicker.countBits14Magic)
      const noop1      = _.map(numbers, _.noop)
      const naive2     = _.map(numbers, countBits14Naive)
      const magic2     = _.map(numbers, Bitflicker.countBits14Magic)
      const noop2      = _.map(numbers, _.noop)
      const naiveStart = performance.now()
      const naive3a    = _.map(numbers, countBits14Naive)
      const naive3b    = _.map(numbers, countBits14Naive)
      const naive3c    = _.map(numbers, countBits14Naive)
      const naive3d    = _.map(numbers, countBits14Naive)
      const naiveTime  = performance.now() - naiveStart
      const magicStart = performance.now()
      const magic3a    = _.map(numbers, Bitflicker.countBits14Magic)
      const magic3b    = _.map(numbers, Bitflicker.countBits14Magic)
      const magic3c    = _.map(numbers, Bitflicker.countBits14Magic)
      const magic3d    = _.map(numbers, Bitflicker.countBits14Magic)
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
      const pow2from00to12   = _.range(0, 2**12)
      const pow2fromto12   = _.range(0, 2**12)
      const naive     = [
        ..._.map(numbers, countBits28Naive),
      const magic     = _.map(numbers, Bitflicker.countBits28)
      expect(magic).to.eql(naive)
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