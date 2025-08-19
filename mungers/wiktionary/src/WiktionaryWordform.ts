import      _                                /**/ from 'lodash'
import      * as FW                               from '@freeword/meta'
import type * as TY                               from './types/CoreTypes.ts'
// import      * as ZZ                               from 'zod'

export class WiktionaryWordform extends FW.Wordform implements WktLemma {
  declare headword:            TY.Word
  declare poskind:             TY.Poskind
  declare langcode:            TY.Langcode
  declare categories:          string[]
  declare etymology:           { text: string, number: number, templates: Record<string, object[]> }
  declare wikipedia:           string
  declare abbreviations:       WktAbbreviation[]
  declare descendants:         object[]
  declare templates:           object[] | Record<string, object[]>
  declare forms:               object[]
  declare head_templates:      object[]
  declare hyphenations:        object[]
  declare instances:           object[]
  declare antonyms:            WktNym[]
  declare holonyms:            WktNym[]
  declare hypernyms:           WktNym[]
  declare hyponyms:            WktNym[]
  declare meronyms:            WktNym[]
  declare synonyms:            WktNym[]
  declare troponyms:           WktNym[]
  declare coordterms:          WktNym[]
  declare derived:             WktNym[]
  declare senses:              TY.ArrNZ<WktSense>
  declare related:             object[]
  declare sounds:              object[]
  declare translations:        object[]
}

const { obj, arr, oneof, tuple, coerce, str, bareint, anything, bool, literal, stringish, textish, urlstr } = FW.CK
const BOOLISH_TRUE_SET  = new Set([true,  1, 'true',  'True',  'TRUE',  '1', 'Yes', 'yes', 'YES', 'Y', 'y', '2', '3', '12'])
const BOOLISH_FALSE_SET = new Set([false, 0, 'false', 'False', 'FALSE', '0', 'No',  'no',  'NO',  'N', 'n'])
const BOOLISH_ALLOW_SET = new Set([...BOOLISH_TRUE_SET, ...BOOLISH_FALSE_SET])
export const loosebool = anything
  .refine(((val) => BOOLISH_ALLOW_SET.has(val)), { params: { msg: 'should be identifiably true or false'  } })
  .transform((val) => {
    if (BOOLISH_FALSE_SET.has(val)) { return false }
    if (BOOLISH_TRUE_SET.has(val))  {  return true  }
    return val
  }).pipe(bool)

// const arrOrStr = stringish.or(arr(stringish)).transform((val) => (_.isArray(val) ? val : [val]))
export const posint     = bareint.min(0)
export const midstr     = stringish.max(200)
export const longstr    = stringish.max(510)
export const term       = midstr
export const line1k     = stringish.max(1000)
export const line4k     = stringish.max(4000)
export const text4k     = textish.max(4000)
export const loosetag   = midstr.min(1)
export const tags       = arr(loosetag).default([])
export const depth      = bareint.min(0).max(100)
const source            = midstr

export const wktWordform = obj({
  form: term, tags, source, rawtags: tags.optional(), head_nr: bareint.max(30).min(0).optional(),
})

export const EtymologyTemplateNames = [
  'suffix', 'prefix', 'affix', 'surf', 'confix', 'compound', 'clipping',
  'derived', 'borrowed', 'inherited', 'calque', 'cognate', 'noncognate',
  'root', 'doublet', 'blend', 'pieword', 'coinage', 'namedfor', 'glossary',
] as const
// const tname            = oneof([...EtymologyTemplateNames])
export const wikidata  = str.regex(/^[PQ]\d+$/).max(25)
export const senseid   = longstr
export const wikipedia = longstr // arr(midstr).default([])

export const langcode       = str.regex(/^([a-z]{2,3}(-[a-zA-Z]{2,3})?(-[a-zA-Z]{2,3})?|(cmn|zh)-Latn-\w+|la-x-(neo|mid|late|med|eccl|vul))(?:, ?(?:[a-z]{2,3}))*$/)
const expansion      = line4k
const rellang        = langcode
const relterm        = line1k
const positionals    = arr(line1k)
const root           = longstr
const prefix         = midstr
const suffix         = midstr
const parts          = arr(longstr)
const relterms       = parts
const gloss          = line1k
const wikicategory   = longstr
const categories     = arr(wikicategory).default([])
const highlights     = arr(tuple([bareint, bareint]))

const suffixTemplate       = obj({ tname: literal('suffix'),        expansion,         root, suffix,  parts,                    langcode }).partial().required({ tname: true })
const confixTemplate       = obj({ tname: literal('confix'),        expansion, prefix, root, suffix,  parts,                    langcode }).partial().required({ tname: true })
const prefixTemplate       = obj({ tname: literal('prefix'),        expansion, prefix, root,          parts,                    langcode }).partial().required({ tname: true })
const affixTemplate        = obj({ tname: literal('affix'),         expansion,                        parts,                    langcode }).partial().required({ tname: true })
const surfTemplate         = obj({ tname: literal('surf'),          expansion,                        parts,                    langcode }).partial().required({ tname: true })
const compoundTemplate     = obj({ tname: literal('compound'),      expansion,                        parts,                    langcode }).partial().required({ tname: true })
const clippingTemplate     = obj({ tname: literal('clipping'),      expansion,          relterm,                                langcode }).partial().required({ tname: true })
const derivedTemplate      = obj({ tname: literal('derived'),       expansion, rellang, relterm,  alt: longstr, gloss,          langcode }).partial().required({ tname: true })
const borrowedTemplate     = obj({ tname: literal('borrowed'),      expansion, rellang, relterm,  alt: midstr,  gloss,          langcode }).partial().required({ tname: true })
const inheritedTemplate    = obj({ tname: literal('inherited'),     expansion, rellang, relterm,  alt: midstr,  gloss,          langcode }).partial().required({ tname: true })
const calqueTemplate       = obj({ tname: literal('calque'),        expansion, rellang, relterm,  alt: midstr,  gloss,          langcode }).partial().required({ tname: true })
const cognateTemplate      = obj({ tname: literal('cognate'),       expansion, rellang, relterm,  alt: midstr,  gloss,                   }).partial().required({ tname: true })
const noncognateTemplate   = obj({ tname: literal('noncognate'),    expansion, rellang, relterm,  alt: midstr,  gloss,                   }).partial().required({ tname: true })
const rootTemplate         = obj({ tname: literal('root'),          expansion, rellang, relterms, alt: midstr,  gloss,          langcode }).partial().required({ tname: true })
const doubletTemplate      = obj({ tname: literal('doublet'),       expansion,          relterms,                                        }).partial().required({ tname: true })
const blendTemplate        = obj({ tname: literal('blend'),         expansion,          relterms,                                        }).partial().required({ tname: true })
const piewordTemplate      = obj({ tname: literal('pieword'),       expansion, rellang, relterm,                                langcode }).partial().required({ tname: true })
const taxlinkTemplate      = obj({ tname: literal('taxlink'),       expansion, taxon:  midstr, level:  midstr,  alt: midstr,    langcode }).partial().required({ tname: true })
const taxfmtTemplate       = obj({ tname: literal('taxfmt'),        expansion, taxon:  midstr, level:  midstr,  alt: midstr,    langcode }).partial().required({ tname: true })
const mentionTemplate      = obj({ tname: literal('mention'),       expansion, target: midstr, text:   longstr, gloss,          langcode }).partial().required({ tname: true })
const coinageTemplate      = obj({ tname: literal('coinage'),       expansion,                         entity: midstr,          langcode }).partial().required({ tname: true })
const namedforTemplate     = obj({ tname: literal('namedfor'),      expansion,                         entity: midstr,          langcode }).partial().required({ tname: true })
const etymonTemplate       = obj({ tname: literal('etymon'),        expansion,                                                  langcode }).partial().required({ tname: true })
const etymidTemplate       = obj({ tname: literal('etymid'),        expansion,                         etymid: midstr,          langcode }).partial().required({ tname: true })
const onomatopoeicTemplate = obj({ tname: literal('onomatopoeic'),  expansion,                                                  langcode }).partial().required({ tname: true })
const qualifierTemplate    = obj({ tname: literal('qualifier'),     expansion, qualifier: midstr,      qualifiers: positionals, langcode }).partial().required({ tname: true })
const unknownTemplate      = obj({ tname: literal('unknown'),       expansion,                                                  langcode }).partial().required({ tname: true })
const uncertainTemplate    = obj({ tname: literal('uncertain'),     expansion,                                                  langcode }).partial().required({ tname: true })
const glossaryTemplate     = obj({ tname: literal('glossary'),      expansion, target: midstr,         text:   longstr              }).partial().required({ tname: true })
const otherTemplate        = obj({ tname: literal('other'),         expansion,                                                      }).partial().required({ tname: true }).passthrough()
//
// const etymologyTemplate = cases('tname', [
//   suffixTemplate, confixTemplate, prefixTemplate, affixTemplate, surfTemplate, compoundTemplate, clippingTemplate,
//   derivedTemplate, borrowedTemplate, inheritedTemplate, calqueTemplate, cognateTemplate, noncognateTemplate,
//   rootTemplate, doubletTemplate, blendTemplate, piewordTemplate, coinageTemplate, namedforTemplate,
//   taxlinkTemplate, taxfmtTemplate, mentionTemplate,
//   glossaryTemplate, etymonTemplate, etymidTemplate, onomatopoeicTemplate, qualifierTemplate, unknownTemplate,
//   uncertainTemplate, otherTemplate,
// ])

const etymologyBag = obj({
  suffix:       arr(suffixTemplate),
  confix:       arr(confixTemplate),
  prefix:       arr(prefixTemplate),
  affix:        arr(affixTemplate),
  surf:         arr(surfTemplate),
  compound:     arr(compoundTemplate),
  clipping:     arr(clippingTemplate),
  derived:      arr(derivedTemplate),
  borrowed:     arr(borrowedTemplate),
  inherited:    arr(inheritedTemplate),
  calque:       arr(calqueTemplate),
  cognate:      arr(cognateTemplate),
  noncognate:   arr(noncognateTemplate),
  root:         arr(rootTemplate),
  doublet:      arr(doubletTemplate),
  blend:        arr(blendTemplate),
  pieword:      arr(piewordTemplate),
  taxlink:      arr(taxlinkTemplate),
  taxfmt:       arr(taxfmtTemplate),
  mention:      arr(mentionTemplate),
  coinage:      arr(coinageTemplate),
  namedfor:     arr(namedforTemplate),
  etymon:       arr(etymonTemplate),
  etymid:       arr(etymidTemplate),
  onomatopoeic: arr(onomatopoeicTemplate),
  qualifier:    arr(qualifierTemplate),
  unknown:      arr(unknownTemplate),
  glossary:     arr(glossaryTemplate),
  uncertain:    arr(uncertainTemplate),
  other:        arr(otherTemplate),
}).strict().partial()

export const etymology = obj({
  text: text4k, number: bareint, templates: etymologyBag,
}).partial({ text: true, number: true, templates: true }).strict()

export const wktExample = obj({
  text:    text4k,
  english: line1k,
  roman:   line1k,
  ref:     line4k,
  type:    oneof(['example', 'quotation']),
  tags,
  raw_tags: tags,
  highlights: obj({ text: highlights, english: highlights, roman: highlights }).partial(),
  // literal_meaning: longstr, // skipped
}).partial().required({ text: true }).strict()

export const attestation  = obj({ date:      longstr, references: arr(obj({ refn: longstr, text: longstr }).strict().partial({ refn: true, text: true })) }).strict()
export const link         = obj({ target:    longstr, text: longstr }).strict()
export const hyphenation  = obj({ parts:     arr(midstr), tags }).strict()
export const abbreviation = obj({ abbrev:    longstr, sense: line1k.optional() }).strict()
const anyurl  = midstr.regex(/^[^\/]+$/).or(urlstr)
const oggurl = anyurl.pipe(coerce.string().regex(/^[\("]?\w+.*\.(ogg|oga)$/))
const mp3url = anyurl.pipe(coerce.string().regex(/^[\("]?\w+.*\.mp3$/))
const audurl = anyurl.pipe(coerce.string().regex(/^[\("]?\w+.*\.(mp3|ogg|oga|wav|flac|m4a|opus|.*)$/))
export const soundlink    = obj({
  text: line1k, source: line1k, tags, note: text4k, other: line1k, topics: arr(midstr),
  ipa: midstr, rhymes: midstr, homophone: midstr, audurl, oggurl, mp3url, enpr: midstr,
}).partial().strict()
export const translation  = obj({
  relterm: longstr, rellang, note: line1k, taxonomic: midstr,
  sense: line4k, english: longstr, roman: longstr, alt: midstr,
  tags, raw_tags: tags, topics: arr(midstr),
 }).strict().partial()
export const nym = obj({
  relterm: longstr, sense: longstr, english: longstr, roman: longstr, alt: midstr,
  tags, raw_tags: tags, topics: arr(midstr),
  urls: arr(anyurl), source: longstr, taxonomic: midstr, qualifier: longstr, extra: longstr,
}).partial().required({ relterm: true }).strict()
export const rel_of  = obj({
  relterm: line1k, source: line1k, tags, extra: longstr,
}).partial({ extra: true, source: true }).strict()
// export const derived = obj({ relterm: longstr, english: longstr, taxonomic: midstr }).partial().required({ relterm: true }) // .strict()

export const descterm = obj({
  /** Descendant term.               */ relterm:      midstr,
  /** Sense ID                       */ senseid:      midstr,
  /** Language code                  */ langcode,
  /** Gender and number              */ gender:       midstr,
  /** Part of speech                 */ poskind:      midstr,
  /** A gloss or short translation   */ gloss:        gloss,
  /** Display form of the term.      */ alt:          midstr,
  /** Transliteration of the term    */ translit:     midstr,
  /** Transcription of the term      */ transcript:   midstr,
  /** Literal translation            */ lit:          midstr,
  /** Script code                    */ scriptcode:   midstr,
  /** Label for the term             */ label:        midstr,
  /** Arbitrary qualifier            */ qualifier:    line1k,
  /** Borrowed                       */ bor:          loosebool,
  /** Learned borrowing              */ learned:      loosebool,
  /** Semi-learned borrowing         */ semilearned:  loosebool,
  /** Calque                         */ calque:       loosebool,
  /** Partial calque                 */ partcalque:   loosebool,
  /** Semantic loan                  */ semloan:      loosebool,
  /** Provenance is uncertain.       */ uncertain:    loosebool,
  /** Derived via morpheme (affix) or analogical leveling. (orig called "der")
   *                                 */ morph:        loosebool,
}).partial().required({ relterm: true, langcode: true }).strict()
export const desctree = obj({
  expansion: text4k, parts: arr<TY.ZodType<WktDescterm>>(descterm),
}).strict()
export const wktDescendant = obj({
  text: line1k, depth, desctrees: arr(desctree),
}).partial().strict()

export const wktSense = obj({
  wikidata:         arr(wikidata),
  senseid:          arr(senseid),
  glosses:          arr(gloss),
  raw_glosses:      arr(gloss),
  wikipedia:        arr(wikipedia),
  qualifier:        longstr,
  topics:           arr(midstr),
  head_nr:          posint,
  taxonomic:        midstr,
  categories,
  tags,
  raw_tags:         tags,
  links:            arr(link),
  //
  hypernyms:        arr(nym),
  coordterms:       arr(nym),
  hyponyms:         arr(nym),
  synonyms:         arr(nym),
  antonyms:         arr(nym),
  holonyms:         arr(nym),
  meronyms:         arr(nym),
  troponyms:        arr(nym),
  related:          arr(nym),
  formof:           arr(nym),
  altof:            arr(nym),
  attestations:     arr(attestation),
  examples:         arr(wktExample),
}).strict().partial()

export const wktLemma = obj({
  headword:        term,
  poskind:          oneof(FW.Poskinds),
  langcode,
  categories,
  forms:            arr(wktWordform),
  etymology,
  wikipedia,
  original_title:   midstr.optional(),
  source,
  //
  senses:           arr(wktSense).nonempty(),
  //
  translations:     arr(translation),
  hyphenations:     arr(hyphenation),
  abbreviations:    arr(abbreviation),
  sounds:           arr(soundlink),
  related:          arr(nym),
  descendants:      arr(wktDescendant),
  instances:        arr(rel_of),
  //
  hypernyms:        arr(nym),
  coordterms:       arr(nym),
  hyponyms:         arr(nym),
  synonyms:         arr(nym),
  antonyms:         arr(nym),
  holonyms:         arr(nym),
  meronyms:         arr(nym),
  troponyms:        arr(nym),
  derived:          arr(nym),
}).partial().required({ headword: true, poskind: true, langcode: true }).strict()

export type WktAttestation   = TY.Zcasted<typeof attestation>
// export type WktDerived       = TY.Zcasted<typeof derived>
export type WktDescendant   = TY.Zcasted<typeof wktDescendant>
export type WktDesctree     = TY.Zcasted<typeof desctree>
export type WktDescterm     = TY.Zcasted<typeof descterm>
export type WktRelated      = TY.Zcasted<typeof rel_of>
export type WktTranslation  = TY.Zcasted<typeof translation>
export type WktHyphenation  = TY.Zcasted<typeof hyphenation>
export type WktAbbreviation = TY.Zcasted<typeof abbreviation>
export type WktSoundlink    = TY.Zcasted<typeof soundlink>
export type WktSense        = TY.Zcasted<typeof wktSense>
export type WktLemma        = TY.Zcasted<typeof wktLemma>
export type WktExample      = TY.Zcasted<typeof wktExample>
export type WktNym          = TY.Zcasted<typeof nym>
