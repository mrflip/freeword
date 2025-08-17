import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import type * as TY                               from '@freeword/meta'
import      { Wordbits, UF }                      from '@freeword/meta'
import      { ExampleWords, type ExampleWord }                      from '../helpers/Fixtures.ts'
import      { checkSnapshot }                     from '../helpers/TestHelpers.ts'
const  { wordbitsForWord, prettyWordbits } = Wordbits

function atozArr(str: string) { return str.split('') as TY.AtoZlo[] }
const DigestedWords: Record<TY.Word, Wordbits.DigestedWord> = {
  mom:             { word: 'mom',             beg: 'm', end: 'm', ltrs: atozArr('mmo'),             uniqarr: atozArr('mo'),         dupearr: atozArr('m'),     wordbits: 0b00_0000_0000_0101_0000_0000_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0001_0000_0000_0000, missbits: 0b11_1111_1111_1010_1111_1111_1111 },
  mon:             { word: 'mon',             beg: 'm', end: 'n', ltrs: atozArr('mno'),             uniqarr: atozArr('mno'),        dupearr: atozArr(''),      wordbits: 0b00_0000_0000_0111_0000_0000_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0010_0000_0000_0000, missbits: 0b11_1111_1111_1000_1111_1111_1111 },
  monkeyish:       { word: 'monkeyish',       beg: 'm', end: 'h', ltrs: atozArr('ehikmnosy'),       uniqarr: atozArr('ehikmnosy'),  dupearr: atozArr(''),      wordbits: 0b01_0000_0100_0111_0101_1001_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_1000_0000, missbits: 0b10_1111_1011_1000_1010_0110_1111 },
  nemesis:         { word: 'nemesis',         beg: 'n', end: 's', ltrs: atozArr('eeimnss'),         uniqarr: atozArr('eimns'),      dupearr: atozArr('es'),    wordbits: 0b00_0000_0100_0011_0001_0001_0000, begbit: 0b00_0000_0000_0010_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1011_1100_1110_1110_1111 },
  minimises:       { word: 'minimises',       beg: 'm', end: 's', ltrs: atozArr('eiiimmnss'),       uniqarr: atozArr('eimns'),      dupearr: atozArr('iims'),  wordbits: 0b00_0000_0100_0011_0001_0001_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1011_1100_1110_1110_1111 },
  sermonisers:     { word: 'sermonisers',     beg: 's', end: 's', ltrs: atozArr('eeimnorrsss'),     uniqarr: atozArr('eimnors'),    dupearr: atozArr('erss'),  wordbits: 0b00_0000_0110_0111_0001_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1001_1000_1110_1110_1111 },
  sermonises:      { word: 'sermonises',      beg: 's', end: 's', ltrs: atozArr('eeimnorsss'),      uniqarr: atozArr('eimnors'),    dupearr: atozArr('ess'),   wordbits: 0b00_0000_0110_0111_0001_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1001_1000_1110_1110_1111 },
  monkeyshines:    { word: 'monkeyshines',    beg: 'm', end: 's', ltrs: atozArr('eehikmnnossy'),    uniqarr: atozArr('ehikmnosy'),  dupearr: atozArr('ens'),   wordbits: 0b01_0000_0100_0111_0101_1001_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b10_1111_1011_1000_1010_0110_1111 },
  more:            { word: 'more',            beg: 'm', end: 'e', ltrs: atozArr('emor'),            uniqarr: atozArr('emor'),       dupearr: atozArr(''),      wordbits: 0b00_0000_0010_0101_0000_0001_0000, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_0001_0000, missbits: 0b11_1111_1101_1010_1111_1110_1111 },
  person:          { word: 'person',          beg: 'p', end: 'n', ltrs: atozArr('enoprs'),          uniqarr: atozArr('enoprs'),     dupearr: atozArr(''),      wordbits: 0b00_0000_0110_1110_0000_0001_0000, begbit: 0b00_0000_0000_1000_0000_0000_0000, endbit: 0b00_0000_0000_0010_0000_0000_0000, missbits: 0b11_1111_1001_0001_1111_1110_1111 },
  joy:             { word: 'joy',             beg: 'j', end: 'y', ltrs: atozArr('joy'),             uniqarr: atozArr('joy'),        dupearr: atozArr(''),      wordbits: 0b01_0000_0000_0100_0010_0000_0000, begbit: 0b00_0000_0000_0000_0010_0000_0000, endbit: 0b01_0000_0000_0000_0000_0000_0000, missbits: 0b10_1111_1111_1011_1101_1111_1111 },
  thinker:         { word: 'thinker',         beg: 't', end: 'r', ltrs: atozArr('ehiknrt'),         uniqarr: atozArr('ehiknrt'),    dupearr: atozArr(''),      wordbits: 0b00_0000_1010_0010_0101_1001_0000, begbit: 0b00_0000_1000_0000_0000_0000_0000, endbit: 0b00_0000_0010_0000_0000_0000_0000, missbits: 0b11_1111_0101_1101_1010_0110_1111 },
  swankily:        { word: 'swankily',        beg: 's', end: 'y', ltrs: atozArr('aiklnswy'),        uniqarr: atozArr('aiklnswy'),   dupearr: atozArr(''),      wordbits: 0b01_0100_0100_0010_1101_0000_0001, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b01_0000_0000_0000_0000_0000_0000, missbits: 0b10_1011_1011_1101_0010_1111_1110 },
  slainte:         { word: 'slainte',         beg: 's', end: 'e', ltrs: atozArr('aeilnst'),         uniqarr: atozArr('aeilnst'),    dupearr: atozArr(''),      wordbits: 0b00_0000_1100_0010_1001_0001_0001, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_0001_0000, missbits: 0b11_1111_0011_1101_0110_1110_1110 },
  twixt:           { word: 'twixt',           beg: 't', end: 't', ltrs: atozArr('ittwx'),           uniqarr: atozArr('itwx'),       dupearr: atozArr('t'),     wordbits: 0b00_1100_1000_0000_0001_0000_0000, begbit: 0b00_0000_1000_0000_0000_0000_0000, endbit: 0b00_0000_1000_0000_0000_0000_0000, missbits: 0b11_0011_0111_1111_1110_1111_1111 },
  ourself:         { word: 'ourself',         beg: 'o', end: 'f', ltrs: atozArr('eflorsu'),         uniqarr: atozArr('eflorsu'),    dupearr: atozArr(''),      wordbits: 0b00_0001_0110_0100_1000_0011_0000, begbit: 0b00_0000_0000_0100_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_0010_0000, missbits: 0b11_1110_1001_1011_0111_1100_1111 },
  because:         { word: 'because',         beg: 'b', end: 'e', ltrs: atozArr('abceesu'),         uniqarr: atozArr('abcesu'),     dupearr: atozArr('e'),     wordbits: 0b00_0001_0100_0000_0000_0001_0111, begbit: 0b00_0000_0000_0000_0000_0000_0010, endbit: 0b00_0000_0000_0000_0000_0001_0000, missbits: 0b11_1110_1011_1111_1111_1110_1000 },
  cushiest:        { word: 'cushiest',        beg: 'c', end: 't', ltrs: atozArr('cehisstu'),        uniqarr: atozArr('cehistu'),    dupearr: atozArr('s'),     wordbits: 0b00_0001_1100_0000_0001_1001_0100, begbit: 0b00_0000_0000_0000_0000_0000_0100, endbit: 0b00_0000_1000_0000_0000_0000_0000, missbits: 0b11_1110_0011_1111_1110_0110_1011 },
  syzygies:        { word: 'syzygies',        beg: 's', end: 's', ltrs: atozArr('egissyyz'),        uniqarr: atozArr('egisyz'),     dupearr: atozArr('sy'),    wordbits: 0b11_0000_0100_0000_0001_0101_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b00_1111_1011_1111_1110_1010_1111 },
  are:             { word: 'are',             beg: 'a', end: 'e', ltrs: atozArr('aer'),             uniqarr: atozArr('aer'),        dupearr: atozArr(''),      wordbits: 0b00_0000_0010_0000_0000_0001_0001, begbit: 0b00_0000_0000_0000_0000_0000_0001, endbit: 0b00_0000_0000_0000_0000_0001_0000, missbits: 0b11_1111_1101_1111_1111_1110_1110 },
  mellific:        { word: 'mellific',        beg: 'm', end: 'c', ltrs: atozArr('cefiillm'),        uniqarr: atozArr('cefilm'),     dupearr: atozArr('il'),    wordbits: 0b00_0000_0000_0001_1001_0011_0100, begbit: 0b00_0000_0000_0001_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_0000_0100, missbits: 0b11_1111_1111_1110_0110_1100_1011 },
  aah:             { word: 'aah',             beg: 'a', end: 'h', ltrs: atozArr('aah'),             uniqarr: atozArr('ah'),         dupearr: atozArr('a'),     wordbits: 0b00_0000_0000_0000_0000_1000_0001, begbit: 0b00_0000_0000_0000_0000_0000_0001, endbit: 0b00_0000_0000_0000_0000_1000_0000, missbits: 0b11_1111_1111_1111_1111_0111_1110 },
  aardvark:        { word: 'aardvark',        beg: 'a', end: 'k', ltrs: atozArr('aaadkrrv'),        uniqarr: atozArr('adkrv'),      dupearr: atozArr('aar'),   wordbits: 0b00_0010_0010_0000_0100_0000_1001, begbit: 0b00_0000_0000_0000_0000_0000_0001, endbit: 0b00_0000_0000_0000_0100_0000_0000, missbits: 0b11_1101_1101_1111_1011_1111_0110 },
  zzz:             { word: 'zzz',             beg: 'z', end: 'z', ltrs: atozArr('zzz'),             uniqarr: atozArr('z'),          dupearr: atozArr('zz'),    wordbits: 0b10_0000_0000_0000_0000_0000_0000, begbit: 0b10_0000_0000_0000_0000_0000_0000, endbit: 0b10_0000_0000_0000_0000_0000_0000, missbits: 0b01_1111_1111_1111_1111_1111_1111 },
  set:             { word: 'set',             beg: 's', end: 't', ltrs: atozArr('est'),             uniqarr: atozArr('est'),        dupearr: atozArr(''),      wordbits: 0b00_0000_1100_0000_0000_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_1000_0000_0000_0000_0000, missbits: 0b11_1111_0011_1111_1111_1110_1111 },
  sheep:           { word: 'sheep',           beg: 's', end: 'p', ltrs: atozArr('eehps'),           uniqarr: atozArr('ehps'),       dupearr: atozArr('e'),     wordbits: 0b00_0000_0100_1000_0000_1001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0000_1000_0000_0000_0000, missbits: 0b11_1111_1011_0111_1111_0110_1111 },
  quoth:           { word: 'quoth',           beg: 'q', end: 'h', ltrs: atozArr('hoqtu'),           uniqarr: atozArr('hoqtu'),      dupearr: atozArr(''),      wordbits: 0b00_0001_1001_0100_0000_1000_0000, begbit: 0b00_0000_0001_0000_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_1000_0000, missbits: 0b11_1110_0110_1011_1111_0111_1111 },
  syzygy:          { word: 'syzygy',          beg: 's', end: 'y', ltrs: atozArr('gsyyyz'),          uniqarr: atozArr('gsyz'),       dupearr: atozArr('yy'),    wordbits: 0b11_0000_0100_0000_0000_0100_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b01_0000_0000_0000_0000_0000_0000, missbits: 0b00_1111_1011_1111_1111_1011_1111 },
  idiomaticnesses: { word: 'idiomaticnesses', beg: 'i', end: 's', ltrs: atozArr('acdeeiiimnossst'), uniqarr: atozArr('acdeimnost'), dupearr: atozArr('eiiss'), wordbits: 0b00_0000_1100_0111_0001_0001_1101, begbit: 0b00_0000_0000_0000_0001_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_0011_1000_1110_1110_0010 },
  spoony:          { word: 'spoony',          beg: 's', end: 'y', ltrs: atozArr('noopsy'),          uniqarr: atozArr('nopsy'),      dupearr: atozArr('o'),     wordbits: 0b01_0000_0100_1110_0000_0000_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b01_0000_0000_0000_0000_0000_0000, missbits: 0b10_1111_1011_0001_1111_1111_1111 },
  spooniest:       { word: 'spooniest',       beg: 's', end: 't', ltrs: atozArr('einoopsst'),       uniqarr: atozArr('einopst'),    dupearr: atozArr('os'),    wordbits: 0b00_0000_1100_1110_0001_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_1000_0000_0000_0000_0000, missbits: 0b11_1111_0011_0001_1110_1110_1111 },
  spoonily:        { word: 'spoonily',        beg: 's', end: 'y', ltrs: atozArr('ilnoopsy'),        uniqarr: atozArr('ilnopsy'),    dupearr: atozArr('o'),     wordbits: 0b01_0000_0100_1110_1001_0000_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b01_0000_0000_0000_0000_0000_0000, missbits: 0b10_1111_1011_0001_0110_1111_1111 },
  spoonier:        { word: 'spoonier',        beg: 's', end: 'r', ltrs: atozArr('einooprs'),        uniqarr: atozArr('einoprs'),    dupearr: atozArr('o'),     wordbits: 0b00_0000_0110_1110_0001_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0010_0000_0000_0000_0000, missbits: 0b11_1111_1001_0001_1110_1110_1111 },
  spoonies:        { word: 'spoonies',        beg: 's', end: 's', ltrs: atozArr('einoopss'),        uniqarr: atozArr('einops'),     dupearr: atozArr('os'),    wordbits: 0b00_0000_0100_1110_0001_0001_0000, begbit: 0b00_0000_0100_0000_0000_0000_0000, endbit: 0b00_0000_0100_0000_0000_0000_0000, missbits: 0b11_1111_1011_0001_1110_1110_1111 },
  the:             { word: 'the',             beg: 't', end: 'e', ltrs: atozArr('eht'),             uniqarr: atozArr('eht'),        dupearr: atozArr(''),      wordbits: 0b00_0000_1000_0000_0000_1001_0000, begbit: 0b00_0000_1000_0000_0000_0000_0000, endbit: 0b00_0000_0000_0000_0000_0001_0000, missbits: 0b11_1111_0111_1111_1111_0110_1111 },
} as const satisfies Record<ExampleWord | 'mom' | 'mon' | 'monkeyish' | 'nemesis' | 'minimises' | 'sermonisers' | 'sermonises', Wordbits.DigestedWord>

// console.log(UF.prettify(_.mapValues(DigestedWords, (_x, word) => {
//   const digested = Wordbits.digestWord(word)
//   const  { word:_w, beg, end, ltrs,               uniqarr,                    dupearr, begbit, endbit,  missbits, wordbits } = digested
//   return { word,   beg, end, ltrs: ltrs.join(''), uniqarr: uniqarr.join(''), dupearr: dupearr.join(''), wordbits: prettyWordbits(wordbits), begbit: prettyWordbits(begbit), endbit: prettyWordbits(endbit), missbits: prettyWordbits(missbits) }
// })))

describe('Wordbits', () => {

  describe('wordbitsForWord', () => {
    it('should convert a word to a bitfield', () => {
      //                                                    zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
      expect(wordbitsForWord('abc'   )).to.equal(0b00_0000_0000_0000_0000_0000_0111)
      expect(wordbitsForWord('zij'   )).to.equal(0b10_0000_0000_0000_0011_0000_0000)
      expect(wordbitsForWord('abczij')).to.equal(0b10_0000_0000_0000_0011_0000_0111)
    })
    it('gives same results with dupes', () => {
      //                                                    zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
      expect(wordbitsForWord('abcabcaaaa')).to.equal(0b00_0000_0000_0000_0000_0000_0111)
      expect(wordbitsForWord('zijjijizzz')).to.equal(0b10_0000_0000_0000_0011_0000_0000)
    })
    it('has stable snapshot', () => {
      const results = _.map(ExampleWords, wordbitsForWord)
      expect(checkSnapshot(results)).to.be.true
    })
  })

  const SetOpsExampleWords  = ['chimp', 'imp', 'chimps', 'adios', 'ado'] as const
  type  SetOpsExampleWord = (typeof SetOpsExampleWords)[number]
  const SetOpBits = {
    //                 zy_xwvu_tsrq_ponm_lkji_hgfe_dcba
    imp:            0b00_0000_0000_1001_0001_0000_0000,
    chimp:          0b00_0000_0000_1001_0001_1000_0100,
    //                .._...._.s.._p..m_...i_h..._.c..  //
    chimps:         0b00_0000_0100_1001_0001_1000_0100,
    adios:          0b00_0000_0100_0100_0001_0000_1001,
    //                .._...._.s.._.o.._...i_...._d..a  //
    ado:            0b00_0000_0000_0100_0000_0000_1001,
  }
  const Adchimpos = 0b00_0000_0100_1101_0001_1000_1101
  // console.log(UF.prettify(_.mapValues(SetOpBits, (bits) => prettyWordbits(bits))))
  it('should have the right setup of wordbits', () => { _.each(SetOpBits, (bits, word) => { expect(wordbitsForWord(word)).to.equal(bits) }) })

  const chimpLtrsOpOnB  = { // for binary ops, result of applying op('chimps', [word])
    subtract:          { chimp: '',           imp: 'ch',         chimps: '',         adios: 'chmp',         ado: 'chimp'     },
    union:             { chimp: 'chimp',      imp: 'chimp',      chimps: 'chimps',   adios: 'acdhimops',    ado: 'acdhimop'  },
    intersection:      { chimp: 'chimp',      imp: 'imp',        chimps: 'chimp',    adios: 'i',            ado: ''          },
    inEitherNotBoth:   { chimp: '',           imp: 'ch',         chimps: 's',        adios: 'acdhmops',     ado: 'acdhimop'  },
    xor:               { chimp: '',           imp: 'ch',         chimps: 's',        adios: 'acdhmops',     ado: 'acdhimop'  },
  } as const satisfies Partial<{ [func in keyof typeof Wordbits]: Record<SetOpsExampleWord, string> }>
  const aLtrsOpOnChimp = { // for binary ops, result of applying op('chimps', [word])
    subtract:          { chimp: '',           imp: '',           chimps: 's',        adios: 'ados',         ado: 'ado'       },
    union:             { chimp: 'chimp',      imp: 'chimp',      chimps: 'chimps',   adios: 'acdhimops',    ado: 'acdhimop'  },
    inEither:          { chimp: 'chimp',      imp: 'chimp',      chimps: 'chimps',   adios: 'acdhimops',    ado: 'acdhimop'  },
    intersection:      { chimp: 'chimp',      imp: 'imp',        chimps: 'chimp',    adios: 'i',            ado: ''          },
    inBoth:            { chimp: 'chimp',      imp: 'imp',        chimps: 'chimp',    adios: 'i',            ado: ''          },
    inEitherNotBoth:   { chimp: '',           imp: 'ch',         chimps: 's',        adios: 'acdhmops',     ado: 'acdhimop'  },
    xor:               { chimp: '',           imp: 'ch',         chimps: 's',        adios: 'acdhmops',     ado: 'acdhimop'  },
  } as const satisfies Partial<{ [func in keyof typeof Wordbits]: Record<SetOpsExampleWord, string> }>

  describe.each(_.entries(chimpLtrsOpOnB))('applying %s', ((funcname: keyof typeof chimpLtrsOpOnB, wanted: Record<SetOpsExampleWord, any>) => {
    const func = Wordbits[funcname]
    const chimpBits = SetOpBits.chimp
    it.each(_.entries(wanted))(`as ${funcname}(chimp, %s) = %s`, ((bWord: SetOpsExampleWord, wantedLtrs: string) => {
      const wantedBits = wordbitsForWord(wantedLtrs)
      const bBits      = wordbitsForWord(bWord)
      const resultBits = func(chimpBits, bBits)
      expect(Wordbits.ltrsForWordbits(resultBits)).to.equal(wantedLtrs)
      expect(resultBits).to.equal(wantedBits)
    }) as any)
  }) as any)
  describe.each(_.entries(aLtrsOpOnChimp))('applying %s', ((funcname: keyof typeof aLtrsOpOnChimp, wanted: Record<SetOpsExampleWord, any>) => {
    const func = Wordbits[funcname]
    const chimpBits = SetOpBits.chimp
    it.each(_.entries(wanted))(`as ${funcname}(%s, chimp) = %s`, ((aWord: SetOpsExampleWord, wantedLtrs: string) => {
      const wantedBits = wordbitsForWord(wantedLtrs)
      const aBits      = wordbitsForWord(aWord)
      const resultBits = func(aBits, chimpBits)
      expect(Wordbits.ltrsForWordbits(resultBits)).to.equal(wantedLtrs)
      expect(resultBits).to.equal(wantedBits)
    }) as any)
  }) as any)
  const chimpBoolOpOnB  = { // for binary ops, result of applying op('chimps', [word])
    overlaps:          { chimp: true,         imp: true,         chimps: true,       adios: true,           ado: false       },
    disjoint:          { chimp: false,        imp: false,        chimps: false,      adios: false,          ado: true        },
    equals:            { chimp: true,         imp: false,        chimps: false,      adios: false,          ado: false       },
    contains:          { chimp: true,         imp: true,         chimps: false,      adios: false,          ado: false       },
    aHasAllAndMoreB:   { chimp: false,        imp: true,         chimps: false,      adios: false,          ado: false       },
    aHasMissingFromB:  { chimp: false,        imp: true,         chimps: false,      adios: true,           ado: true        },
  } as const satisfies Partial<{ [func in keyof typeof Wordbits]: Record<SetOpsExampleWord, boolean> }>
  const aBoolOpOnChimp = { // for binary ops, result of applying op('chimps', [word])
    overlaps:          { chimp: true,         imp: true,         chimps: true,       adios: true,           ado: false       },
    disjoint:          { chimp: false,        imp: false,        chimps: false,      adios: false,          ado: true        },
    equals:            { chimp: true,         imp: false,        chimps: false,      adios: false,          ado: false       },
    contains:          { chimp: true,         imp: false,        chimps: true,       adios: false,          ado: false       },
    aHasAllAndMoreB:   { chimp: false,        imp: false,        chimps: true,       adios: false,          ado: false       },
    aHasMissingFromB:  { chimp: false,        imp: false,        chimps: true,      adios: true,           ado: true        },
  } as const satisfies Partial<{ [func in keyof typeof Wordbits]: Record<SetOpsExampleWord, boolean> }>
  describe.each(_.entries(chimpBoolOpOnB))('applying %s', ((funcname: keyof typeof chimpLtrsOpOnB, wanted: Record<SetOpsExampleWord, boolean>) => {
    const func = Wordbits[funcname]
    const chimpBits = SetOpBits.chimp
    it.each(_.entries(wanted))(`as ${funcname}(chimp, %s) = %s`, ((bWord: SetOpsExampleWord, wanted: boolean) => {
      const bBits      =  wordbitsForWord(bWord)
      const resultBits = func(chimpBits, bBits)
      expect(resultBits).to.equal(wanted)
    }) as any)
  }) as any)
  describe.each(_.entries(aBoolOpOnChimp))('applying %s', ((funcname: keyof typeof aLtrsOpOnChimp, wanted: Record<SetOpsExampleWord, boolean>) => {
    const func = Wordbits[funcname]
    const chimpBits = SetOpBits.chimp
    it.each(_.entries(wanted))(`as ${funcname}(%s, chimp) = %s`, ((aWord: SetOpsExampleWord, wanted: boolean) => {
      const aBits      = wordbitsForWord(aWord)
      const resultBits = func(aBits, chimpBits)
      expect(resultBits).to.equal(wanted)
    }) as any)
  }) as any)
  describe('n-ary ops', () => {
    it('unions', () => {
      expect(Wordbits.unions(SetOpBits.chimp, SetOpBits.imp, SetOpBits.chimps, SetOpBits.adios, SetOpBits.ado)).to.equal(Adchimpos)
      expect(Wordbits.unions(SetOpBits.chimp, SetOpBits.imp, SetOpBits.chimps)).to.equal(SetOpBits.chimps)
    })
    it('intersections', () => {
      expect(Wordbits.intersections(SetOpBits.chimp, SetOpBits.imp, SetOpBits.chimps, SetOpBits.adios, SetOpBits.ado)).to.equal(0)
      expect(Wordbits.intersections(SetOpBits.chimp, SetOpBits.imp, SetOpBits.chimps, SetOpBits.ado)).to.equal(0)
      expect(Wordbits.intersections(SetOpBits.chimp, SetOpBits.imp, SetOpBits.chimps)).to.equal(SetOpBits.imp)
    })
  })
  // console.log(UF.prettify({
  //   wordbitsForWord:     UF.objectify(SetOpsExampleWords, (word) => prettyWordbits(wordbitsForWord(word))),
  //   missingFrom:         UF.objectify(SetOpsExampleWords, (word) => prettyWordbits(Wordbits.missingFrom(wordbitsForWord(word)))),
  //   countUniqLtrs:       UF.objectify(SetOpsExampleWords, (word) => Wordbits.countUniqLtrs(wordbitsForWord(word))),
  //   rot13Wordbits:       UF.objectify(SetOpsExampleWords, (word) => prettyWordbits(Wordbits.rot13Wordbits(wordbitsForWord(word)))),
  //   rot23Wordbits:       UF.objectify(SetOpsExampleWords, (word) => prettyWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 23))),
  //   rot04Wordbits:       UF.objectify(SetOpsExampleWords, (word) => prettyWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 4))),
  //   wordbitsForWordStr:  UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(wordbitsForWord(word))),
  //   missingFromStr:      UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.missingFrom(wordbitsForWord(word)))),
  //   rot13WordbitsStr:    UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.rot13Wordbits(wordbitsForWord(word)))),
  //   rot23WordbitsStr:    UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 23))),
  //   rot00WordbitsStr:    UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 0))),
  //   rot01WordbitsStr:    UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 1))),
  //   rot04WordbitsStr:    UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 4))),
  //   rot12WordbitsStr:    UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 12))),
  //   rot13WordbitsStr2:   UF.objectify(SetOpsExampleWords, (word) => Wordbits.ltrsForWordbits(Wordbits.rotNWordbits(wordbitsForWord(word), 13))),
  // }))
  const unaryOps = {
    wordbitsForWord:    { chimp:  0b00_0000_0000_1001_0001_1000_0100,  imp:  0b00_0000_0000_1001_0001_0000_0000,  chimps:  0b00_0000_0100_1001_0001_1000_0100,  adios:  0b00_0000_0100_0100_0001_0000_1001,  ado:  0b00_0000_0000_0100_0000_0000_1001 },
    missingFrom:        { chimp:  0b11_1111_1111_0110_1110_0111_1011,  imp:  0b11_1111_1111_0110_1110_1111_1111,  chimps:  0b11_1111_1011_0110_1110_0111_1011,  adios:  0b11_1111_1011_1011_1110_1111_0110,  ado:  0b11_1111_1111_1011_1111_1111_0110 },
    rot13Wordbits:      { chimp: 0b10_0011_0000_1000_0000_0000_0100, imp: 0b10_0010_0000_0000_0000_0000_0100, chimps: 0b10_0011_0000_1000_0000_0010_0100, adios: 0b00_0010_0001_0010_0000_0010_0010, ado: 0b00_0000_0001_0010_0000_0000_0010 },
    rot23Wordbits:      { chimp: 0b10_0000_0000_0001_0010_0011_0000, imp: 0b00_0000_0000_0001_0010_0010_0000, chimps: 0b10_0000_0000_1001_0010_0011_0000, adios: 0b00_1000_0000_1000_1000_0010_0001, ado: 0b00_1000_0000_0000_1000_0000_0001 },
    rot04Wordbits:      { chimp: 0b00_0000_1001_0001_1000_0100_0000, imp: 0b00_0000_1001_0001_0000_0000_0000, chimps: 0b00_0100_1001_0001_1000_0100_0000, adios: 0b00_0100_0100_0001_0000_1001_0000, ado: 0b00_0000_0100_0000_0000_1001_0000 },
    missingFromStr:     { chimp: 'abdefgjklnoqrstuvwxyz', imp: 'abcdefghjklnoqrstuvwxyz', chimps: 'abdefgjklnoqrtuvwxyz', adios: 'bcefghjklmnpqrtuvwxyz', ado: 'bcefghijklmnpqrstuvwxyz' },
    wordbitsForWordStr: { chimp: 'chimp', imp: 'imp', chimps: 'chimps', adios: 'adios', ado: 'ado'                     },
    countUniqLtrs:      { chimp: 5,       imp: 3,     chimps: 6,        adios: 5,       ado: 3                         },
    rot13WordbitsStr:   { chimp: 'cpuvz', imp: 'cvz', chimps: 'cfpuvz', adios: 'bfnqv', ado: 'bnq' },
    rot23WordbitsStr:   { chimp: 'efjmz', imp: 'fjm', chimps: 'efjmpz', adios: 'aflpx', ado: 'alx' },
    rot00WordbitsStr:   { chimp: 'chimp', imp: 'imp', chimps: 'chimps', adios: 'adios', ado: 'ado' },
    rot01WordbitsStr:   { chimp: 'dijnq', imp: 'jnq', chimps: 'dijnqt', adios: 'bejpt', ado: 'bep' },
    rot04WordbitsStr:   { chimp: 'glmqt', imp: 'mqt', chimps: 'glmqtw', adios: 'ehmsw', ado: 'ehs' },
    rot12WordbitsStr:   { chimp: 'botuy', imp: 'buy', chimps: 'beotuy', adios: 'aempu', ado: 'amp' },
    rot13WordbitsStr2:  { chimp: 'cpuvz', imp: 'cvz', chimps: 'cfpuvz', adios: 'bfnqv', ado: 'bnq' },  }
  describe('unary ops', () => {
    it('wordbitsForWord', () => {
      _.each(unaryOps.wordbitsForWord, (wanted, word) => {
        const result = Wordbits.wordbitsForWord(word)
        expect(result).to.equal(wanted)
        expect(Wordbits.ltrsForWordbits(result)).to.equal((unaryOps.wordbitsForWordStr as any)[word])
      })
    })
    it('missingFrom', () => {
      _.each(unaryOps.missingFrom, (wanted, word) => {
        const result = Wordbits.missingFrom(wordbitsForWord(word))
        expect(result).to.equal(wanted)
        expect(Wordbits.ltrsForWordbits(result)).to.equal((unaryOps.missingFromStr as any)[word])
      })
    })
    it('countUniqLtrs', () => {
      _.each(unaryOps.countUniqLtrs, (wanted, word) => {
        expect(Wordbits.countUniqLtrs(wordbitsForWord(word))).to.equal(wanted)
      })
    })
    it.each(_.entries(unaryOps.rot13Wordbits))('rot13Wordbits(%s) = %s', ((word: SetOpsExampleWord, wanted: number) => {
      // _.each(unaryOps.rot13Wordbits, (wanted, word) => {
      const result    = Wordbits.rot13Wordbits(wordbitsForWord(word))
      const resultStr = Wordbits.ltrsForWordbits(result)
      expect(resultStr).to.equal(UF.rot13Word(word).split('').sort().join(''))
      expect(result).to.equal(wanted)
      expect(resultStr).to.equal((unaryOps.rot13WordbitsStr as any)[word])
      // })
    }) as any)
    const { rot13Wordbits,    rot23Wordbits,    rot04Wordbits}    = unaryOps
    const { rot13WordbitsStr, rot23WordbitsStr, rot04WordbitsStr} = unaryOps
    it.each(_.entries(unaryOps.rot23WordbitsStr))('rotNWordbits(%s) = %s', ((word: SetOpsExampleWord) => {
      const wordbits  = wordbitsForWord(word)
      //
      // const result13  = Wordbits.rotNWordbits(wordbits, 13)
      const result13  = Wordbits.rot13Wordbits(wordbits)
      expect(Wordbits.ltrsForWordbits(result13)).to.equal(UF.rotNWord(word, 13).split('').sort().join(''))
      expect(result13).to.equal(rot13Wordbits[word])
      expect(Wordbits.ltrsForWordbits(result13)).to.equal(rot13WordbitsStr[word])
      // //
      const result23  = Wordbits.rotNWordbits(wordbits, 23)
      expect(Wordbits.ltrsForWordbits(result23)).to.equal(UF.rotNWord(word, 23).split('').sort().join(''))
      expect(Wordbits.ltrsForWordbits(result23)).to.equal(rot23WordbitsStr[word])
      expect(result23).to.equal(rot23Wordbits[word])
      // //
      const result04  = Wordbits.rotNWordbits(wordbits, 4)
      expect(Wordbits.ltrsForWordbits(result04)).to.equal(UF.rotNWord(word, 4).split('').sort().join(''))
      expect(Wordbits.ltrsForWordbits(result04)).to.equal(rot04WordbitsStr[word])
      expect(result04).to.equal(rot04Wordbits[word])

    }) as any)
    // _.each([0, 25, 63, (2**25 - 1)], (num) => Wordbits.rotNWordbits(num, 1))
  })

  describe('containsMasked', () => {
    it('should return true for matching words', () => {
      expect(Wordbits.contains(SetOpBits.chimp,  SetOpBits.chimp)).to.be.true    // a equal of b
      expect(Wordbits.contains(SetOpBits.chimp,  SetOpBits.imp)).to.be.true      // a subset of b
      expect(Wordbits.contains(SetOpBits.chimp,  SetOpBits.chimps)).to.be.false  // a superset to b
      expect(Wordbits.contains(SetOpBits.ado,    SetOpBits.ado)).to.be.true      // a equal  to b
    })
    it('should return false for non-matching words', () => {
      expect(Wordbits.contains(SetOpBits.chimp,   SetOpBits.adios)).to.be.false  // intersect with leftovers in each
      expect(Wordbits.contains(SetOpBits.chimp,   SetOpBits.ado)).to.be.false    // do not intersect
      expect(Wordbits.contains(SetOpBits.ado,     SetOpBits.chimps)).to.be.false // do not intersect
      expect(Wordbits.contains(SetOpBits.ado,     SetOpBits.imp)).to.be.false    // do not intersect
      expect(Wordbits.contains(SetOpBits.ado,     SetOpBits.chimp)).to.be.false  // do not intersect
      expect(Wordbits.contains(SetOpBits.ado,     SetOpBits.adios)).to.be.false  // b has letters not in a
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
      expect(Wordbits.ltrsForWordbits(digested.wordbits)).to.eql(expectedUniqs.join(''))
      expect(Wordbits.ltrsForWordbits(digested.begbit)).to.eql(beg)
      expect(Wordbits.ltrsForWordbits(digested.endbit)).to.eql(end)
      expect(Wordbits.ltrsForWordbits(digested.missbits)).to.eql(_.without(UF.AtoZlos, ...expectedUniqs).join(''))
    }) as any)
    describe('DigestedExamples', () => {
      it.each(_.entries(DigestedWords))('should digest %s', (word, wanted) => {
        expect(Wordbits.digestWord(word)).to.eql(wanted)
      })
    })
  })

  describe('countUniqLtrs', () => {
    it('should count bits in a 7-bit number', () => {
      const numbers     = _.range(0, 2**7)
      const naive       = _.map(numbers, countBits14Naive)
      const magic13     = _.map(numbers, Wordbits.countBits7Magic)
      expect(magic13).to.eql(naive)
    })
    it('should count bits in a 14-bit number', () => {
      const numbers = _.range(0, 2**14)
      const naive    = _.map(numbers, countBits14Naive)
      const magic14  = _.map(numbers, Wordbits.countBits14Magic)
      expect(magic14).to.eql(naive)
    })
    it('should count bits in a 32-bit number', () => {
      // const numbers = UF.SeededRandomFactory.make('magic').randUint32s(10)
      const Examples = [
        [0, 0], [1, 1], [7, 3], [2**15 - 1, 15],
        [8675309, 14], [2**7 - 1, 7],
        [0b0001000100010001, 4],
        [0b1000_1000_1000_1000_1000_1000_1000_1000,  8],
        [0b0100_0100_0100_0100_0100_0100_0100_0100,  8],
        [0b0010_0010_0010_0010_0010_0010_0010_0010,  8],
        [0b0001_0001_0001_0001_0001_0001_0001_0001,  8],
        [0b0000_1000_1000_1000_1000_1000_1000_1000,  7],
        [0b0000_0100_0100_0100_0100_0100_0100_0100,  7],
        [0b0000_0010_0010_0010_0010_0010_0010_0010,  7],
        [0b0000_0001_0001_0001_0001_0001_0001_0001,  7],
        [0b0000_0000_0000_0000_0000_0000_0000_0001,  1],
        [0b1000_0000_0000_0000_0000_0000_0000_0000,  1],
        [0b1111_0000_0000_0000_0000_0000_0000_0000,  4],
        [0b1111_1111_1111_1111_1111_1111_1111_1111, 32],
      ] as [number, number][] // , ([num, expected]) => [Wordbits.prettyBinary32(num), num, expected]) as [string, number, number][]
      const numbers = _.map(Examples, _.first) as number[]
      const wanted  = _.map(Examples, _.last)  as number[]
      const naive    = _.map(numbers, countBits32Naive)
      const magic32  = _.map(numbers, Wordbits.countBits32)
      // const pretty = _.map(numbers, Wordbits.prettyBinary53)
      expect(magic32).to.eql(naive)
      expect(magic32).to.eql(wanted)
    })
    it('should count bits in a 32-bit number', () => {
      const numbers = UF.SeededRandomFactory.make('magic').randUint32s(10_000).sort()
      const naive    = UF.objectify(numbers, countBits32Naive)
      const magic32  = UF.objectify(numbers, Wordbits.countBits32)
      expect(magic32).to.eql(naive)
    })
    it('should be faster than naive', () => {
      const numbers = _.range(0, 2**14)
      const naive1     = _.map(numbers, countBits14Naive)
      const magic1     = _.map(numbers, Wordbits.countBits14Magic)
      const b321       = _.map(numbers, Wordbits.countBits32)
      const noop1      = _.map(numbers, _.noop)
      //
      const _cleanerB  = _.map(numbers, _.noop)
      const naive2     = _.map(numbers, countBits14Naive)
      const naiveStart = performance.now()
      const naive3a    = _.map(numbers, countBits14Naive)
      const naive3b    = _.map(numbers, countBits14Naive)
      const naive3c    = _.map(numbers, countBits14Naive)
      const naive3d    = _.map(numbers, countBits14Naive)
      const naiveTime  = performance.now() - naiveStart
      const b322       = _.map(numbers, Wordbits.countBits32)
      //
      const _cleanerC     = _.map(numbers, _.noop)
      const b323C      = _.map(numbers, Wordbits.countBits32)
      const b32Start   = performance.now()
      const b323a      = _.map(numbers, Wordbits.countBits32)
      const b323b      = _.map(numbers, Wordbits.countBits32)
      const b323c      = _.map(numbers, Wordbits.countBits32)
      const b323d      = _.map(numbers, Wordbits.countBits32)
      const b32Time    = performance.now() - b32Start
      //
      const _cleanerD  = _.map(numbers, _.noop)
      const magic2     = _.map(numbers, Wordbits.countBits14Magic)
      const magicStart = performance.now()
      const magic3a    = _.map(numbers, Wordbits.countBits14Magic)
      const magic3b    = _.map(numbers, Wordbits.countBits14Magic)
      const magic3c    = _.map(numbers, Wordbits.countBits14Magic)
      const magic3d    = _.map(numbers, Wordbits.countBits14Magic)
      const magicTime  = performance.now() - magicStart
      //
      const _cleanerE   = _.map(numbers, Wordbits.countBits32)
      const noopStart  = performance.now()
      const noop3a     = _.map(numbers, _.noop)
      const noop3b     = _.map(numbers, _.noop)
      const noop3c     = _.map(numbers, _.noop)
      const noop3d     = _.map(numbers, _.noop)
      const noopTime   = performance.now() - noopStart
      //
      console.info(`Naive: ${naiveTime.toFixed(3)}ms, Magic: ${magicTime.toFixed(3)}ms, Noop: ${noopTime.toFixed(3)}ms m32: ${b32Time.toFixed(3)}ms`)
      expect(naive1).to.eql(magic1)
      // const fmt   = _.repeat(' %2d,', 32)
      // const lines = _.chunk(naive, 32).map((line) => UF.vsprintf(fmt, line))
      expect({ naive1, magic1, noop1, naive2, magic2, _cleanerB, _cleanerC, _cleanerD, _cleanerE, naive3a, magic3a, noop3a, naive3b, magic3b, noop3b, naive3c, magic3c, noop3c, naive3d, magic3d, noop3d, naiveTime, magicTime, noopTime, b321, b322, b323C, b323a, b323b, b323c, b323d }).to.be.an('object')
    })
    it('should count bits in a 28-bit number by magic bit flicking', () => {
      const numbers = UF.SeededRandomFactory.make('magic').randInts({ lo: 0, hi: 2**28, count: 10_000 })
      const naive     = [
        ..._.map(numbers, countBits32Naive),
      ]
      const magic     = _.map(numbers, Wordbits.countBits28)
      expect(magic).to.eql(naive)
    })
    const ExpectedUniqCounts = {
      more:        [ 4, 'emor'     ], person:      [ 6, 'enoprs'   ], joy:         [ 3, 'joy'      ], thinker:     [ 7, 'ehiknrt'  ], swankily:    [ 8, 'aiklnswy' ],
      slainte:     [ 7, 'aeilnst'  ], twixt:       [ 4, 'itwx'     ], ourself:     [ 7, 'eflorsu'  ], because:     [ 6, 'abcesu'   ], the:         [ 3, 'eht'      ],
      cushiest:    [ 7, 'cehistu'  ], syzygies:    [ 6, 'egisyz'   ], are:         [ 3, 'aer'      ], mellific:    [ 6, 'cefilm'   ], aah:         [ 2, 'ah'       ],
      aardvark:    [ 5, 'adkrv'    ], zzz:         [ 1, 'z'        ], set:         [ 3, 'est'      ], sheep:       [ 4, 'ehps'     ], quoth:       [ 5, 'hoqtu'    ],
      syzygy:      [ 4, 'gsyz'     ], spoony:      [ 5, 'nopsy'    ], spooniest:   [ 7, 'einopst'  ], spoonily:    [ 7, 'ilnopsy'  ], spoonier:    [ 7, 'einoprs'  ],
      spoonies:    [ 6, 'einops'   ], monkeyshines: [ 9, 'ehikmnosy' ], idiomaticnesses: [ 10, 'acdeimnost' ],
    } as const satisfies Record<ExampleWord, [number, string]>
    // console.log(UF.prettify(UF.objectify(ExampleWords, (word) => { const ustr = _.uniq(word.split('')).sort().join(''); return [ustr.length, ustr] })))
    it('should count match expectations on wordbits', () => {
      _.each(ExpectedUniqCounts, ([expected, uniqstr], word) => {
        const wordbits = wordbitsForWord(word)
        const result   = Wordbits.countUniqLtrs(wordbits)
        expect(result).to.equal(expected)
        expect(result).to.equal(uniqstr.length)
        expect(Wordbits.ltrsForWordbits(wordbits)).to.equal(uniqstr)
      })
    })
  })

  describe('prettyGamebits/prettyWordbits', () => {
    it('should produce a 26-bit number as a string with separators', () => {
      _.each(ExampleWords, (word) => {
        const wordbits = wordbitsForWord(word)
        const result = prettyWordbits(wordbits)
        const plain  = result.replaceAll(/[_]/g, '')
        expect(result).to.match(/^0b[01]{2}_[01]{4}_[01]{4}_[01]{4}_[01]{4}_[01]{4}_[01]{4}$/)
        expect(plain).to.equal(UF.vsprintf('0b%026b', [wordbits]))
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


function countBits32Naive(bitfield: number): number {
  let count = 0;
  for (const place of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]) {
    if (bitfield & (1 << place)) {
      count += 1
    }
  }
  return count
}