import      _                                /**/ from 'lodash'
import type * as TY                               from './types/CoreTypes.ts'
import      * as FW                               from '@freeword/meta'
import      * as ZZ                               from 'zod'

export class WiktionaryWordform extends FW.Wordform {
  declare word:                TY.Word
  declare poskind:             TY.Poskind
  declare langcode:            TY.Langcode
  declare categories:          string[]
  declare etymology:           { text: string, number: number, templates: Record<string, object[]> }
  declare wikipedia:           object[]
  declare abbreviations:       TY.AnyBag[]
  declare antonyms:            object[]
  declare coordinate_terms:    object[]
  declare derived:             object[]
  declare descendants:         object[]
  declare templates:           object[] | Record<string, object[]>
  declare forms:               object[]
  declare head_templates:      object[]
  declare holonyms:            object[]
  declare hypernyms:           object[]
  declare hyphenations:        object[]
  declare hyponyms:            object[]
  declare instances:           object[]
  declare meronyms:            object[]
  declare troponyms:           object[]
  declare related:             object[]
  declare senses:              object[]
  declare sounds:              object[]
  declare synonyms:            object[]
  declare translations:        object[]
}

export const { object:obj, array:arr, enum:oneof, record:bag, tuple } = ZZ
export const idk        = ZZ.any()
export const barestr    = ZZ.string()
export const barenum    = ZZ.number()
export const float      = ZZ.number()
export const bool       = ZZ.boolean()
export const bareint    = barenum.int().max(FW.Consts.SAFEINT.max).min(FW.Consts.SAFEINT.min)
export const posint     = bareint.min(0)
export const str        = barestr.trim().regex(FW.Consts.STRINGISH.re, FW.Consts.STRINGISH.msg)
export const longstr    = str.max(120)
export const midstr     = str.max(80)
export const term       = midstr
export const label      = barestr.trim().min(1).max(80).regex(FW.Consts.LABEL.re, FW.Consts.LABEL.msg)
export const tags       = arr(label)
export const anybag     = bag(label, idk)
const source            = midstr

export const wktWordform = obj({
  form: str, tags, source, rawtags: tags.optional(), head_nr: posint.optional(),
})

const EtymologyTemplateNames = [
  'suffix', 'prefix', 'affix', 'surf', 'confix', 'compound', 'clipping',
  'derived', 'borrowed', 'inherited', 'calque', 'cognate', 'noncognate',
  'root', 'doublet', 'blend', 'pie_word', 'coinage', 'named_after', 'glossary',
] as const
const tname      = oneof([...EtymologyTemplateNames])
export const wikidata = str.regex(/^[PQ]\d+$/)
export const senseid  = midstr
export const wikipedia       = arr(midstr)

const expansion   = str
const langcode    = label
const lc          = langcode
const into_lang   = langcode
const from_lang   = langcode
const from_term   = str
const positionals = arr(str)
const args        = anybag
const root        = midstr;
const prefix = midstr.regex(/-$/)
const suffix = midstr.regex(/-$/)
const parts  = arr(midstr)
const gloss  = longstr
const wikicategory = midstr.regex(/^s(([A-Z][a-z]*):?)+$/)
const categories = arr(wikicategory)
const highlights = arr(tuple([bareint, bareint]))

const suffixTemplate           = obj({ tname, expansion,         root, suffix,  parts,                                 lc, ...args })
const confixTemplate           = obj({ tname, expansion, prefix, root, suffix,  parts,                                 lc, ...args })
const prefixTemplate           = obj({ tname, expansion, prefix, root,          parts,                                 lc, ...args })
const affixTemplate            = obj({ tname, expansion,                        parts,                                 lc, ...args })
const surfTemplate             = obj({ tname, expansion,                        parts,                                 lc, ...args })
const compoundTemplate         = obj({ tname, expansion,                        parts,                                 lc, ...args })
const clippingTemplate         = obj({ tname, expansion,                        from_term,                             lc, ...args })
const derivedTemplate          = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt: midstr, gloss, lc, ...args })
const borrowedTemplate         = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt: midstr, gloss, lc, ...args })
const inheritedTemplate        = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt: midstr, gloss, lc, ...args })
const calqueTemplate           = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt: midstr, gloss, lc, ...args })
const cognateTemplate          = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt: midstr, gloss,     ...args })
const noncognateTemplate       = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt: midstr, gloss,     ...args })
const rootTemplate             = obj({ tname, expansion, into_lang,  from_lang, from_terms: parts, alt: midstr, gloss, lc, ...args })
const doubletTemplate          = obj({ tname, expansion, into_lang,             from_terms: parts,                         ...args })
const blendTemplate            = obj({ tname, expansion, into_lang,             from_terms: parts,                         ...args })
const pie_wordTemplate         = obj({ tname, expansion, into_lang,  from_lang, from_term,                             lc, ...args })
const taxlinkTemplate          = obj({ tname, expansion, taxon:  midstr,        level:  midstr,     alt:      midstr,  lc, ...args })
const taxfmtTemplate           = obj({ tname, expansion, taxon:  midstr,        level:  midstr,     alt:      midstr,  lc, ...args })
const mentionTemplate          = obj({ tname, expansion, anchor: midstr,        text:   longstr,    gloss:    gloss,   lc, ...args })
const coinageTemplate          = obj({ tname, expansion,                        entity: midstr,                        lc, ...args })
const named_afterTemplate      = obj({ tname, expansion,                        entity: midstr,                        lc, ...args })
const glossaryTemplate         = obj({ tname, expansion, anchor: midstr,        text:   longstr,                           ...args })
const etymonTemplate           = obj({ tname, expansion,                                                               lc, ...args })
const etymidTemplate           = obj({ tname, expansion,                        etymid: midstr,                        lc, ...args })
const onomatopoeicTemplate     = obj({ tname, expansion,                                                               lc, ...args })
const qualifierTemplate        = obj({ tname, expansion, qualifier: midstr,     qualifiers: positionals,               lc, ...args })
const unknownTemplate          = obj({ tname, expansion,                                                               lc, ...args })
const uncertainTemplate        = obj({ tname, expansion,                                                               lc, ...args })
//
const etymologyTemplate = ZZ.discriminatedUnion('tname', [
  suffixTemplate, confixTemplate, prefixTemplate, affixTemplate, surfTemplate, compoundTemplate, clippingTemplate,
  derivedTemplate, borrowedTemplate, inheritedTemplate, calqueTemplate, cognateTemplate, noncognateTemplate,
  rootTemplate, doubletTemplate, blendTemplate, pie_wordTemplate, coinageTemplate, named_afterTemplate,
  taxlinkTemplate, taxfmtTemplate, mentionTemplate,
  glossaryTemplate, etymonTemplate, etymidTemplate, onomatopoeicTemplate, qualifierTemplate, unknownTemplate,
  uncertainTemplate,
])

export const etymology = obj({
  text: str, number: bareint, templates: arr(etymologyTemplate)
}).partial({ text: true, number: true, templates: true })

export const wktExample = obj({
  text:    longstr,
  english: longstr,
  roman:   longstr,
  type:    label,
  ref:     midstr,
  tags,
  highlights: obj({ text: highlights, english: highlights, roman: highlights }).partial(),
})

export const attestation = obj({ date: midstr, references: arr(midstr) })
export const link = obj({ anchor: midstr, text: longstr })

export const nym = obj({
  word: term, source: longstr, tags, english: longstr, raw_tags: tags, extra: midstr, alt: midstr,
}).partial().required({ word: true })
export const coordinate_term = obj({ word: term, english: longstr.optional() })

export const wktSense = obj({
  examples:         arr(wktExample),
  wikidata:         arr(wikidata),
  senseid:          arr(senseid),
  attestations:     arr(attestation),
  links:            arr(link),
  hypernyms:        arr(nym),
  coordinate_terms: arr(coordinate_term),
  categories,
  glosses:          arr(gloss),
  raw_glosses:      arr(gloss),
  tags,
  raw_tags:         tags,
  qualifier:        midstr,
  topics:           arr(midstr),
  hyponyms:         arr(nym),
  synonyms:         arr(nym),
  antonyms:         arr(nym),
  holonyms:         arr(nym),
  meronyms:         arr(nym),
  head_nr:          posint,
  taxonomic:        midstr,
  info_templates:   arr(etymologyTemplate),
  alt_of:           arr(obj({ word: term, extra: midstr })),
  form_of:          arr(obj({ word: term, extra: midstr })),
  related:          arr(obj({ word: term, tags, source })),
  wikipedia:        arr(wikipedia),
})

export const wktLemma = obj({
  word:           term,
  poskind:        oneof(FW.Poskinds),
  langcode,
  categories,
  forms:          arr(wktWordform),
  etymology,
  wikipedia,
  original_title: midstr.optional(),
  source,
}).partial({ forms: true, etymology: true, categories: true, wikipedia: true, original_title: true, source: true })

export type Zcasted<IT> = ZZ.infer<IT>
export type Zsketch<IT> = ZZ.input<IT>
export type WktSense = Zcasted<typeof wktSense>
export type WktLemma = Zcasted<typeof wktLemma>
