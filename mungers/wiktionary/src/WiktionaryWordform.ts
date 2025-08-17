import      _                                /**/ from 'lodash'
import      * as FW                               from '@freeword/meta'
import type * as TY                               from './types/CoreTypes.ts'
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

const { obj, arr, anybag, oneof, tuple, label, str, bigstr, bareint } = FW.CK

// export const { object:obj, array:arr, enum:oneof, record:bag, tuple } = ZZ
// export const idk        = ZZ.any()
// export const barestr    = ZZ.string()
// export const barenum    = ZZ.number()
// export const float      = ZZ.number()
// export const bool       = ZZ.boolean()
// export const bareint    = barenum.int().max(FW.CO.SAFEINT.max).min(FW.CO.SAFEINT.min)
// export const str        = barestr.trim().regex(FW.CO.STRINGISH.re, FW.CO.STRINGISH.msg)
// export const bigstr     = str.max(250)
// export const label      = barestr.trim().min(1).max(80).regex(FW.CO.LABEL.re, FW.CO.LABEL.msg)
// export const anybag     = bag(label, idk)
export const posint     = bareint.min(0)
export const midstr     = str.max(80)
export const term       = midstr
export const textline   = str.max(500)
export const tags       = arr(label)
const source            = midstr

export const wktWordform = obj({
  form: str, tags, source, rawtags: tags.optional(), head_nr: bareint.max(30).min(0).optional(),
})

const EtymologyTemplateNames = [
  'suffix', 'prefix', 'affix', 'surf', 'confix', 'compound', 'clipping',
  'derived', 'borrowed', 'inherited', 'calque', 'cognate', 'noncognate',
  'root', 'doublet', 'blend', 'pie_word', 'coinage', 'named_after', 'glossary',
] as const
const tname           = oneof([...EtymologyTemplateNames])
export const wikidata = str.regex(/^[PQ]\d+$/)
export const senseid  = midstr
export const wikipedia       = arr(midstr)

const expansion   = midstr
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
const gloss  = bigstr
const wikicategory = midstr.regex(/^s(([A-Z][a-z]*):?)+$/)
const categories = arr(wikicategory)
const highlights = arr(tuple([bareint, bareint]))

const suffixTemplate           = obj({ tname, expansion,         root, suffix,  parts,                                   lc })
const confixTemplate           = obj({ tname, expansion, prefix, root, suffix,  parts,                                   lc })
const prefixTemplate           = obj({ tname, expansion, prefix, root,          parts,                                   lc })
const affixTemplate            = obj({ tname, expansion,                        parts,                                   lc })
const surfTemplate             = obj({ tname, expansion,                        parts,                                   lc })
const compoundTemplate         = obj({ tname, expansion,                        parts,                                   lc })
const clippingTemplate         = obj({ tname, expansion,                        from_term,                               lc })
const derivedTemplate          = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt:   midstr, gloss, lc })
const borrowedTemplate         = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt:   midstr, gloss, lc })
const inheritedTemplate        = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt:   midstr, gloss, lc })
const calqueTemplate           = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt:   midstr, gloss, lc })
const cognateTemplate          = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt:   midstr, gloss,    })
const noncognateTemplate       = obj({ tname, expansion, into_lang,  from_lang, from_term,         alt:   midstr, gloss,    })
const rootTemplate             = obj({ tname, expansion, into_lang,  from_lang, from_terms: parts, alt:   midstr, gloss, lc })
const doubletTemplate          = obj({ tname, expansion, into_lang,             from_terms: parts,                          })
const blendTemplate            = obj({ tname, expansion, into_lang,             from_terms: parts,                          })
const pie_wordTemplate         = obj({ tname, expansion, into_lang,  from_lang, from_term,                               lc })
const taxlinkTemplate          = obj({ tname, expansion, taxon:  midstr,        level:  midstr,    alt:   midstr,        lc })
const taxfmtTemplate           = obj({ tname, expansion, taxon:  midstr,        level:  midstr,    alt:   midstr,        lc })
const mentionTemplate          = obj({ tname, expansion, anchor: midstr,        text:   bigstr,                   gloss, lc })
const coinageTemplate          = obj({ tname, expansion,                        entity: midstr,                          lc })
const named_afterTemplate      = obj({ tname, expansion,                        entity: midstr,                          lc })
const etymonTemplate           = obj({ tname, expansion,                                                                 lc })
const etymidTemplate           = obj({ tname, expansion,                        etymid: midstr,                          lc })
const onomatopoeicTemplate     = obj({ tname, expansion,                                                                 lc })
const qualifierTemplate        = obj({ tname, expansion, qualifier: midstr,     qualifiers: positionals,                 lc })
const unknownTemplate          = obj({ tname, expansion,                                                                 lc })
const uncertainTemplate        = obj({ tname, expansion,                                                                 lc })
const glossaryTemplate         = obj({ tname, expansion, anchor: midstr,        text:   bigstr                              })
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
  text:    textline,
  english: bigstr,
  roman:   bigstr,
  type:    label,
  ref:     bigstr,
  tags,
  highlights: obj({ text: highlights, english: highlights, roman: highlights }).partial(),
}).partial().required({ text: true })

export const attestation = obj({ date: midstr, references: arr(midstr) })
export const link = obj({ anchor: midstr, text: bigstr })

export const nym = obj({
  word: term, source: bigstr, tags, english: bigstr, raw_tags: tags, extra: midstr, alt: midstr,
}).partial().required({ word: true })
export const coordinate_term = obj({ word: term, english: bigstr.optional() })

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
}).strict().partial()

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

export type WktSense = TY.Zcasted<typeof wktSense>
export type WktLemma = TY.Zcasted<typeof wktLemma>
