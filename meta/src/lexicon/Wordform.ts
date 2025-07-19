import      _                                /**/ from 'lodash'
import      { newStemmer as StemmerFactory }      from 'snowball-stemmers'
import      JSPrintf                              from 'sprintf-js'
import type * as TY                               from '../types.ts'
import      * as UF                               from '../lib/UF.ts'
import      * as Wordbits                       from '../lib/Wordbits.ts'

const Stemmer = StemmerFactory('english')
function qt(val: string)    { return `'${val.replaceAll('\'', '\\\'')}'` }
function dqt(val: string)   { return `"${val.replaceAll('"', '\\"')}"` }
function qtc(val: string)   { return comma(qt(val)) }
// function dqtc(val: string)  { return comma(dqt(val)) }
// function dqtTc(val: string) { return dqt(val) + '\t,' }
function comma(val: string) { return val + ',' }

export class Wordform implements TY.WordformT {
  declare word:            TY.Word
  declare core:            TY.Word
  declare stemcore:        TY.Wordstem
  declare stemsplit:       TY.Wordstem
  declare suffix:          TY.Wordpart
  declare pos:             TY.Poskind
  declare stemkind:        TY.Stemkind
  declare gloss:           string
  declare grammarish:      string
  declare tmi:             TY.AnyBag
  declare static AllWordFreqs: Record<TY.Word, number>

  constructor(props: TY.WordformT) {
    const { word, core, pos, stemkind, suffix, stemcore, stemsplit, gloss, ...rest } = props
    Object.assign(this, { word, core, pos, stemkind, suffix, stemcore, stemsplit, gloss, ...rest })
    UF.decorate(this, { tmi: { ...props.tmi }, gloss })
    if ((props as any).rawline) { UF.adorn(this, 'rawline', (props as any).rawline) }
  }
  static make(props: TY.WordformT) { return new Wordform(props) }

  static someEndsWith(friends: TY.WordformT[], suffix: string) {
    return _.some(friends, (friend: TY.WordformT) => friend.word.endsWith(suffix))
  }

  get len(): number { return this.word.length }
  get leadtail(): { lead: string, tail: string } { const [lead = '', tail = ''] = this.stemsplit.split('|'); return { lead, tail } }
  get lead(): TY.Shingle { return this.leadtail.lead }
  get tail(): TY.Shingle { return this.leadtail.tail }
  get snowball() {
    const stem = Stemmer.stem(this.word)
    if (stem.replace(/i$/, '') === this.lead) { return this.lead }
    return stem
  }
  static snowballStem(word: TY.Word) { return Stemmer.stem(word) }

  get wordbits()                       { return Wordbits.wordbitsForWord(this.word) }
  set wordbits(wordbits: TY.WordbitsT) { UF.setNormalProp(this, 'wordbits', wordbits) }
  get uniqlen()                        { return Wordbits.countUniqLtrs(this.wordbits) }

  get freq():    number  { return Wordform.AllWordFreqs?.[this.word] ?? -1 }
  // set freq(freq: number) { /**/ } // skip setting a value to regenerate
  set freq(freq: number) { if (freq > 0) { UF.setNormalProp(this, 'freq', freq) } }

  get pretty() { return this.toPretty() }
  toPretty({ indent = '' }: { indent?: string } = {}) {
    const         { word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, wordbits, gloss } = this;
    const quoted = [word, core, pos, stemkind, suffix, stemcore, stemsplit].map(qtc) as (string | number)[]
    quoted.push(freq)
    quoted.push(Wordbits.prettyWordbits(wordbits) + ',')
    quoted.push(qt(gloss))
    if (_.isEmpty(this.tmi)) { quoted.push('') } else { quoted.push(', tmi: ' + UF.prettify(this.tmi)) }
    return indent + JSPrintf.vsprintf(
      '{ word: %-16s core: %-14s pos: %-7s stemkind: %-12s suffix: %-14s stemcore: %-14s stemsplit: %-18s freq: %6d, wordbits: %s gloss: %s%s }', quoted,
    )
  }
  get flatTS() {
    const         { word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, wordbits, gloss } = this;
    const quoted = [word, core, pos, stemkind, suffix, stemcore, stemsplit].map(qtc) as (string | number)[]
    quoted.push(freq)
    quoted.push(Wordbits.prettyWordbits(wordbits) + ',')
    quoted.push(qt(gloss))
    // if (_.isEmpty(this.tmi)) { quoted.push('') } else { quoted.push(', tmi: ' + UF.prettify(this.tmi)) }
    quoted.push('')
    return JSPrintf.vsprintf(
      '[%-16s %-14s %-7s %-12s %-14s %-14s %-18s %6d, %s %s%s]', quoted,
    )
  }
  prettyJSON({ indent = '' }: { indent?: string } = {}) {
    const         { word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, wordbits, gloss } = this;
    const quoted = [word, core, pos, stemkind, suffix, stemcore, stemsplit].map(dqt) as (string | number)[]
    quoted.push(freq)
    quoted.push(Number(wordbits))
    quoted.push(dqt(gloss))
    if (_.isEmpty(this.tmi)) { quoted.push('') } else { quoted.push('\t, "tmi":\t' + UF.prettify(this.tmi)) }
    return indent + JSPrintf.vsprintf(
      '{ "word":\t%-16s\t, "core":\t%-14s\t, "pos":\t%-7s\t, "stemkind":\t%-12s\t, "suffix":\t%-14s\t, "stemcore":\t%-14s\t, "stemsplit":\t%-18s\t, "freq":\t%6d\t, "wordbits":\t%7d\t, "gloss":\t%s%s\t }', quoted,
    )
  }
  flatJSON({ indent = '' }: { indent?: string } = {}) {
    const         { word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, wordbits, gloss } = this;
    const quoted = [word, core, pos, stemkind, suffix, stemcore, stemsplit].map(dqt) as (string | number)[]
    quoted.push(freq)
    quoted.push(Number(wordbits))
    quoted.push(dqt(gloss))
    if (_.isEmpty(this.tmi)) { quoted.push('') } else { quoted.push('\t, "tmi":\t' + UF.prettify(this.tmi)) }
    return indent + JSPrintf.vsprintf(
      '[\t%-16s\t,\t%-14s\t,\t%-7s\t,\t%-12s\t,\t%-14s\t,\t%-14s\t,\t%-18s\t,\t%6d\t,\t%7d\t,\t%s%s\t]', quoted,
    )
  }
  get summaryStr() {
    // const altstem = Stemmer.stem(this.word)
    //                   word, core, pos, stemkind, suffix, stemcore, stemsplit, gloss, wordbits, freq, tmi
    const       { word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, wordbits, gloss } = this;
    const vals = [word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, Wordbits.prettyWordbits(wordbits), gloss.slice(0, 14)]
    return JSPrintf.vsprintf('%-16s %-14s %-7s %-12s %-14s %-14s %-18s %6d %7d %s', vals)
  }
  get pickle(): TY.WordformT {
    const                     { word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, wordbits, gloss, tmi } = this;
    const result: TY.WordformT = { word, core, pos, stemkind, suffix, stemcore, stemsplit, freq, wordbits, gloss }
    if (! _.isEmpty(tmi)) { result.tmi = tmi }
    return result
  }
  get to_a(): TY.WordformFlat {
    return _.values(this.pickle) as TY.WordformFlat
  }

}
