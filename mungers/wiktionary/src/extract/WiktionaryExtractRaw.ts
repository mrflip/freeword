import      _                                /**/ from 'lodash'
import      { Filer, UF }                             from '@freeword/meta'
import type * as TY                               from './internal.ts'
import      * as WKT                              from '../WiktionaryWordform.ts'
import      { templateNameAliases } from './ExtractRawTables.ts'

const RAWDIR = Filer.__relname(import.meta.url, '../../raw')
console.log(RAWDIR)
const Paths = {
  full: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-full.jsonl.gz'),
  some: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-some.jsonl'),
  most: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-most.jsonl'),
}

export class WiktionaryRaw extends WKT.WiktionaryWordform {
  declare lang:                 string
  declare lang_code:            string
  declare rawpos:               string
  declare etymology_number:     number
  declare etymology_text:       string
  declare etymology_templates:  Record<string, any>
}

export async function *loadRawWiktionary(size: 'full' | 'some' | 'most') {
  const wiktpath = Paths[size]; if (! wiktpath.ok) { throw wiktpath.err }
  // const tcounts = [] as Record<string, number>[]
  for await (const raw of Filer.starjsonl<Omit<WiktionaryRaw, 'langcode'>>(wiktpath)) {
    const {
      word, pos, lang_code:langcode, lang:_lang,
      etymology_templates, etymology_number, etymology_text,
      head_templates, senses,
      hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, coordinate_terms, troponyms,
      translations, sounds, hyphenations, abbreviations,
      related, derived, descendants, instances,
      ...wiktionaryRaw
    } = raw
    const etymologyArr = _.map(etymology_templates, (rawTemplate) => expandTemplate(word, rawTemplate))
    const etymologies  = _.groupBy(etymologyArr, 'tname')
    // if (! _.isEmpty(etymologies)) { tcounts.push(_.countBy(_.keys(etymologies))) }
    // yield { word, pos, langcode, ...wiktionaryRaw, templates } as WiktionaryWordform
    const wordform = {
      word, pos, langcode, // ...wiktionaryRaw,
      senses: _.map(senses, expandSense),
    } as WKT.WiktionaryWordform
    if (etymology_text || _.isFinite(etymology_number) || (! _.isEmpty(etymology_templates))) {
      wordform.etymology = UF.scrubNil({ text: etymology_text, number: etymology_number, templates: etymologies })
    }
    yield wordform
  }
  // console.log(tcounts)
}

export interface RawSense extends Omit<WKT.WktSense, 'links'> {
  links: TY.Optionalize<{ 0: string, 1: string }>[]
}

function expandSense(rawSense: RawSense): WKT.WktSense {
  const { links:rawLinks, ...rest } = rawSense
  const links = _.map(rawLinks, ({ 0:anchor, 1:text = anchor }) => ({ anchor, text }))
  const sense = WKT.wktSense.parse({ ...rest, links })
  return sense
}

function expandTemplate(word: TY.Word, rawTemplate: Record<string, any>): Record<string, any> {
  return _.omitBy(_expandTemplate(word, rawTemplate), _.isUndefined)
}

const DERIVED_RE = /^(derived|borrowed|inherited|calque)$/
function _expandTemplate(_word: TY.Word, rawTemplate: Record<string, any>): Record<string, any> {
  const { name:_n, expansion, args: { 1:lc, 1:p1, 2:p2, 3:p3, 4:p4, 5:p5, 6:p6, 7:p7, 8:p8, 9:p9, 10:p10, 11:p11, 12:p12, 13:p13, 14:p14, 15:p15, 16:p16, 17:p17, 18:p18, 19:p19, 20:p20, t, ...args } } = rawTemplate
  const langcode = 'en'
  const positionals = _.reject([p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20], _.isUndefined)
  const tname = templateNameAliases[rawTemplate.name] ?? rawTemplate.name
  // const template  = { tname,       expansion, ...args             } as Record<string, any>
  //
  if (rawTemplate.name === 'uder') { args.flavor = 'undefined derivation' }
  if (rawTemplate.name === 'ubor') { args.flavor = 'unadapted borrowing' }
  if (rawTemplate.name === 'lbor') { args.flavor = 'learned borrowing' }
  const otherwise = { tname, expansion, ...rawTemplate.args, ...args } as Record<string, any>
  //
  if (tname === 'suffix')                           { return { tname, expansion,             root:   p2, suffix: p3,    parts: positionals,                                                                                lc, ...args } }
  if (tname === 'prefix')                           { return { tname, expansion, prefix: p2, root:   p3,                parts: positionals,                                                                                lc, ...args } }
  if (tname === 'affix' || tname === 'surf')        { return { tname, expansion,                                        parts: positionals,                                                                                lc, ...args } }
  if (tname === 'confix')                           { return { tname, expansion, prefix: p2, root:   p3, suffix: p4,    parts: positionals,                                                                                lc, ...args } }
  if (tname === 'compound')                         { return { tname, expansion,                                        parts: positionals,                                                                                lc, ...args } }
  if (tname === 'clipping')                         { return { tname, expansion,                                        from_term: p2,                                                                                     lc, ...args } }
  if (DERIVED_RE.test(tname))                       { return { tname, expansion, into_lang: lc,       from_lang: p2,    from_term: p3,                    alt: rawTemplate.alt ?? p4, gloss: rawTemplate.gloss ?? t ?? p5, lc, ...args } }
  if (tname === 'cognate')                          { return { tname, expansion, into_lang: langcode, from_lang: lc,    from_term: p2,                    alt: rawTemplate.alt ?? p3, gloss: rawTemplate.gloss ?? t ?? p4,     ...args } }
  if (tname === 'noncognate')                       { return { tname, expansion, into_lang: langcode, from_lang: lc,    from_term: p2,                    alt: rawTemplate.alt ?? p3, gloss: rawTemplate.gloss ?? t ?? p4,     ...args } }
  if (tname === 'root')                             { return { tname, expansion, into_lang: lc,       from_lang: p2,    from_terms: positionals.slice(1), alt: rawTemplate.alt ?? p4, gloss: rawTemplate.gloss ?? t ?? p5, lc, ...args } }
  if (tname === 'doublet')                          { return { tname, expansion, into_lang: lc,                         from_terms: positionals,                                                                               ...args } }
  if (tname === 'blend')                            { return { tname, expansion, into_lang: lc,                         from_terms: positionals,                                                                               ...args } }
  if (tname === 'pie_word')                         { return { tname, expansion, into_lang: lc,       from_lang: 'ine', from_term: p2,                                                                                     lc, ...args } }
  if (tname === 'coinage')                          { return { tname, expansion,                entity:   p2,                                                                                                              lc, ...args } }
  if (tname === 'named_after')                      { return { tname, expansion,                entity:   p2,                                                                                                              lc, ...args } }
  if (tname === 'glossary')                         { return { tname, expansion, anchor:    p1, text:     p2,                                                                                                                  ...args } }
  if (tname === 'mention')                          { return { tname, expansion, anchor:    p2, text:     p3, gloss:    rawTemplate.gloss ?? t ?? p4,                                                                      lc, ...args } }
  if (/^(taxlink|taxfmt)$/.test(tname))             { return { tname, expansion, taxon:     p1, level:    p2, alt:      p3,                                                                                                lc, ...args } }
  if (tname === 'etymon')                           { return { tname, expansion,                                                                                                                                           lc, ...args } }
  if (tname === 'etymid')                           { return { tname, expansion,                 etymid:   p2,                                                                                                             lc, ...args } }
  if (tname === 'onomatopoeic')                     { return { tname, expansion,                                                                                                                                           lc, ...args } }
  if (tname === 'qualifier')                        { return { tname, expansion, qualifier: p2,  qualifiers: positionals,                                                                                                  lc, ...args } }
  if (tname === 'unknown')                          { return { tname, expansion,                                                                                                                                           lc, ...args } }
  if (tname === 'uncertain')                        { return { tname, expansion,                                                                                                                                           lc, ...args } }
  return { ...otherwise, tname: 'other' }
}

