import      _                                /**/ from 'lodash'
import      * as FW                               from '@freeword/meta'
import type * as TY                               from './types/CoreTypes.ts'

// export class WiktionaryWordform extends FW.Wordform implements WktLemma {
//   //
//   declare headword:            TY.Word
//   declare poskind:             TY.Poskind
//   declare langcode:            TY.Langcode
//   declare categories:          string[]
//   declare etymology:           { text: string, number: number, templates: WktEtymologyBag }
//   declare wikipedia:           string[]
//   declare senses:              TY.ArrNZ<WktSense>
//   declare descendants:         WktDescendant[]
//   declare forms:               WktForm[]
//   declare translations:        WktTranslation[]
//   declare abbreviations:       WktAbbreviation[]
//   declare hyphenations:        WktHyphenation[]
//   declare sounds:              WktSoundlink[]
//   //
//   declare instances:           WktInstance[]
//   declare antonyms:            WktNym[]
//   declare coordterms:          WktNym[]
//   declare derived:             WktNym[]
//   declare holonyms:            WktNym[]
//   declare hypernyms:           WktNym[]
//   declare hyponyms:            WktNym[]
//   declare meronyms:            WktNym[]
//   declare synonyms:            WktNym[]
//   declare troponyms:           WktNym[]
//   // declare source:           string
//   // declare original_title:   string
//   // declare related:          WktNym[]
// }

const {
  obj, arr, oneof, tuple, cases, coerce, str, bareint, anything, bool, literal,
  stringish, textish, urlstr,
} = FW.CK
const poskind = oneof(FW.ExtPoskinds)
const BOOLISH_TRUE_SET  = new Set([true,  1, 'true',  'True',  'TRUE',  '1', 'Yes', 'yes', 'YES', 'Y', 'y', '2', '3', '12', 'on'])
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
export const line1k     = stringish.max(1500)
export const line4k     = stringish.max(4000)
export const text4k     = textish.max(4000)
export const loosetag   = midstr.min(1)
export const tags       = arr(loosetag).default([])
export const depth      = bareint.min(0).max(100)
const source            = midstr

export const wktWordform = obj({
  form: longstr, tags, source, raw_tags: tags, topics: arr(longstr), head_nr: bareint.max(30).min(0),
}).partial().strict()

export const EtymologyTemplateNames = [
  'suffix', 'prefix', 'affix', 'surf', 'confix', 'compound', 'clipping',
  'derived', 'borrowed', 'inherited', 'calque', 'cognate', 'noncognate',
  'root', 'doublet', 'blend', 'pieword', 'coinage', 'namedfor', 'glossary',
] as const
export const langcode = str.regex(/^([a-z]{2,3}(-[a-zA-Z]{2,3})?(-[a-zA-Z]{2,3})?|(cmn|zh)-Latn-\w+|zh-hans|la-x-(neo|mid|late|med|eccl|vul))(?:, ?(?:[a-z]{2,3}))*$/)

const wikidata       = str.regex(/^[PQ]\d+$/).max(25)
const senseid        = longstr
const expansion      = line4k
const rellang        = langcode
const relterm        = line1k
const positionals    = arr(line1k)
const root           = longstr
const prefix         = midstr
const suffix         = midstr

const etympart       = obj({ relterm: line1k, langcode: langcode, senseid, gloss: line1k, poskind: longstr, gender: midstr, alt: longstr, translit: longstr, qualifier: longstr, lit: longstr,  }).partial().strict()
const parts          = arr(etympart)
const relterms       = arr(longstr)
const gloss          = line1k
const wikicategory   = longstr
const categories     = arr(wikicategory).default([])
const highlights     = arr(tuple([bareint, bareint]))

const WktTemplateNames = [
  'suffix',     'confix',     'prefix',     'affix',      'surf',       'compound',   'clipping',   'derived',
  'borrowed',   'inherited',  'calque',     'pcalque', 'cognate',    'noncognate', 'root',       'doublet',    'blend',
  'pieword',    'taxlink',    'taxfmt',     'mention',    'coinage',    'namedfor',   'etymon',     'etymid',
  'qualifier',  'unknown',    'glossary',   'uncertain',  'other',      'abbrevof',   'abbrev',     'onomato',
] as const
export type WktTemplateName = (typeof WktTemplateNames)[number]
const genericTemplate = obj({
  /** Template name                */ tname:     oneof(WktTemplateNames),
  /** Plaintext rendering          */ expansion,
  /** Object term                  */ relterm,
  /** Object terms list            */ relterms,
  /** Language of the object term  */ rellang,
  /** Language of the subject term */ langcode,
  /** Object entity                */ entity:     midstr,
  /** Sense ID                     */ senseid,
  /** Etymology ID                 */ etymid:     midstr,
  /** Prefix morpheme              */ prefix,
  /** Root morpheme                */ root,
  /** Suffix morpheme              */ suffix,
  /** Morpheme parts               */ parts,
  /** Alternative text             */ alt:        longstr,
  /** Gloss                        */ gloss,
  /** Part of speech               */ poskind:    longstr,
  /** Gender of Object term        */ gender:     midstr,
  /** Taxonomy                     */ taxon:      midstr,
  /** Taxonomy level               */ level:      midstr,
  /** Link Target                  */ target:     midstr,
  /** Link Text                    */ text:       line1k,
  /** ??                           */ tree:       text4k,
  /** transliteration              */ translit:   midstr,
  /** transcript                   */ transcript: midstr,
  /** literal meaning              */ lit:        midstr,
  /** Additional text to show      */ addl:       midstr,
  /** Script of text               */ scriptcode: midstr,
  /** ??                           */ qualifier:  midstr,
  /** ??                           */ qualifiers: positionals,
  /** Category                     */ cat:        wikicategory,
  /** Categories                   */ cats:       arr(wikicategory),
  /** Title                        */ title:      longstr,
  /** Is an original coinage?      */ exnihilo:   loosebool,
  /** wikipedia link               */ wplink:     longstr,
}).partial()
const personCks = {
  /** alternate text   */ alt:         longstr,
  /** date of birth    */ born:        midstr,   // not going to try parsing as date
  /** date of death    */ died:        midstr,   // not going to try parsing as date
  /** nationalit (csv) */ nat:         line1k,
  /** occupation (csv) */ occ:         line1k,
  /** nationality list */ nats:        arr(midstr),
  /** occupations list */ occs:        arr(midstr),
  /** Wikipedia link   */ wplink:      longstr,
  /** Year of coinage  */ coinedin:    midstr,
}
const compoundTemplateCks = {
  /** Type of compound, e.g. bahuvrihi or alliterative. See Template:affix/documentation#Compound subtypes */ type: midstr.optional(),
}
const prefixTemplate       = genericTemplate.pick({ expansion: true, parts:     true, prefix:    true, root: true,                                             lit: true, poskind: true,                                                                    qualifier: true,  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('prefix'),    ...compoundTemplateCks }).strict()
const confixTemplate       = genericTemplate.pick({ expansion: true, parts:     true, prefix:    true, root: true, suffix: true,                               lit: true, poskind: true,                                                                    qualifier: true,  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('confix'),    ...compoundTemplateCks }).strict()
const suffixTemplate       = genericTemplate.pick({ expansion: true, parts:     true, root:      true,             suffix: true,                               lit: true, poskind: true,                                                                    qualifier: true,  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('suffix'),    ...compoundTemplateCks }).strict()
const affixTemplate        = genericTemplate.pick({ expansion: true, parts:     true,                                                                          lit: true, poskind: true,                                                                    qualifier: true,  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('affix'),     ...compoundTemplateCks }).strict()
const surfTemplate         = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, relterms:  true,                                        lit: true, poskind: true,                                                                    qualifier: true,  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('surf'),      ...compoundTemplateCks }).strict()
const compoundTemplate     = genericTemplate.pick({ expansion: true, parts:     true,                                                                          lit: true, poskind: true,                                                                    qualifier: true,  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('compound'),  ...compoundTemplateCks }).strict()
const derivedTemplate      = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('derived'), /* is inherited? */ inh: loosebool.optional()  }).strict()
const borrowedTemplate     = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('borrowed')     }).strict()
const inheritedTemplate    = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('inherited')    }).strict()
const calqueTemplate       = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('calque')       }).strict()
const pcalqueTemplate      = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('pcalque')      }).strict()
const rootTemplate         = genericTemplate.pick({ expansion: true, parts:     true, relterms:  true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('root')         }).strict()
const piewordTemplate      = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true,                                                                                                                                          tname: true, langcode: true }).extend({ /** Template name */ tname: literal('pieword')      }).strict()
const clippingTemplate     = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true,                   alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('clipping')     }).strict()
const blendTemplate        = genericTemplate.pick({ expansion: true, parts:     true, relterms:  true,                   alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('blend')        }).strict()
const doubletTemplate      = genericTemplate.pick({ expansion: true, parts:     true, relterms:  true,                   alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('doublet')      }).strict()
const cognateTemplate      = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('cognate')      }).strict()
const noncognateTemplate   = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('noncognate')   }).strict()
const abbrevTemplate       = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, addl:   true, cat: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('abbrev')       }).strict()
const abbrevofTemplate     = genericTemplate.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, addl:   true, cat: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('abbrevof')     }).strict()
const coinageTemplate      = genericTemplate.pick({ expansion: true, parts:     true, entity:    true, exnihilo:  true, cats: true,                                                      scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend(personCks).partial().extend({ /** Template name */ tname: literal('coinage')      }).strict()
const namedforTemplate     = genericTemplate.pick({ expansion: true, parts:     true, entity:    true,                  cats: true,                                                      scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend(personCks).partial().extend({ /** Template name */ tname: literal('namedfor')     }).strict()
const etymonTemplate       = genericTemplate.pick({ expansion: true, text:      true, exnihilo:  true, tree: true,                                             lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, wplink: true,    tname: true, langcode: true }).extend({ /** Template name */ tname: literal('etymon')       }).strict()
const mentionTemplate      = genericTemplate.pick({ expansion: true, text:      true, target:    true,  alt: true, gloss: true, gender: true,                  lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, wplink: true,    tname: true, langcode: true }).extend({ /** Template name */ tname: literal('mention')      }).strict()
const taxlinkTemplate      = genericTemplate.pick({ expansion: true, taxon:     true, level:     true,  alt: true,                                                                                                                                                           tname: true, langcode: true }).extend({ /** Template name */ tname: literal('taxlink')      }).strict()
const taxfmtTemplate       = genericTemplate.pick({ expansion: true, taxon:     true, level:     true,  alt: true,                                                                                                                                                           tname: true, langcode: true }).extend({ /** Template name */ tname: literal('taxfmt')       }).strict()
const glossaryTemplate     = genericTemplate.pick({ expansion: true, text:      true, target:    true,                                                                                                                                                                       tname: true,                }).extend({ /** Template name */ tname: literal('glossary')     }).strict()
const etymidTemplate       = genericTemplate.pick({ expansion: true, etymid:    true,                                                                                                                                                                                        tname: true, langcode: true }).extend({ /** Template name */ tname: literal('etymid')       }).strict()
const qualifierTemplate    = genericTemplate.pick({ expansion: true, qualifier: true, qualifiers: true,                                                                                                                                                                      tname: true, langcode: true }).extend({ /** Template name */ tname: literal('qualifier')    }).strict()
const onomatoTemplate      = genericTemplate.pick({ expansion: true, title:     true,                                                                                                                                                                                        tname: true, langcode: true }).extend({ /** Template name */ tname: literal('onomato')      }).strict()
const unknownTemplate      = genericTemplate.pick({ expansion: true,                  title:      true,                                                                                                                                                                      tname: true, langcode: true }).extend({ /** Template name */ tname: literal('unknown')      }).strict()
const uncertainTemplate    = genericTemplate.pick({ expansion: true,                  title:      true,                                                                                                                                                                      tname: true, langcode: true }).extend({ /** Template name */ tname: literal('uncertain')    }).strict()
const otherTemplate        = genericTemplate.pick({ expansion: true,                                    alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true,                                   tname: true,                }).extend({ /** Template name */ tname: literal('other')        }).passthrough()

// type WktCoinage = TY.Zcasted<typeof coinageTemplate>; const testval: WktCoinage = null!; const xx = testval.born

/** tagged union of all templates */
export const etymologyTemplate = cases('tname', [
  suffixTemplate, confixTemplate, prefixTemplate, affixTemplate, surfTemplate, compoundTemplate, clippingTemplate,
  derivedTemplate, borrowedTemplate, inheritedTemplate, calqueTemplate, pcalqueTemplate, cognateTemplate, noncognateTemplate,
  rootTemplate, doubletTemplate, blendTemplate, piewordTemplate, coinageTemplate, namedforTemplate,
  taxlinkTemplate, taxfmtTemplate, mentionTemplate, abbrevofTemplate, abbrevTemplate,
  glossaryTemplate, etymonTemplate, etymidTemplate, onomatoTemplate, qualifierTemplate, unknownTemplate,
  uncertainTemplate, otherTemplate,
])

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
  pcalque:      arr(pcalqueTemplate),
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
  onomato: arr(onomatoTemplate),
  qualifier:    arr(qualifierTemplate),
  unknown:      arr(unknownTemplate),
  glossary:     arr(glossaryTemplate),
  uncertain:    arr(uncertainTemplate),
  other:        arr(otherTemplate),
  abbrev:       arr(abbrevTemplate),
  abbrevof:     arr(abbrevofTemplate),
} satisfies Record<WktTemplateName, FW.ZodTypeAny>).partial().strict()
export const etymologyBagShape = _.mapValues(etymologyBag._def.shape(), (val) => FW.CK.summarizeCheckerDef(val._def.innerType)) as Record<WktTemplateName, FW.CK.CheckerSummary>

export const etymology = obj({
  text: text4k, number: bareint, records: etymologyBag,
}).partial().strict()

export const wktExample = obj({
  text:    text4k,
  english: line1k,
  roman:   line1k,
  ref:     line4k,
  type:    oneof(['example', 'quotation']),
  tags,
  raw_tags: tags,
  highlights: obj({ text: highlights, english: highlights, roman: highlights, literal: highlights }).partial(),
  // literal_meaning: longstr, // skipped
}).partial().required({ text: true }).strict()

export const attestation  = obj({ date:      longstr, refs: arr(obj({ refn: longstr, text: longstr }).strict().partial()) }).partial({ refs: true }).strict()
export const link         = obj({ target:    longstr, text: longstr }).strict()
export const hyphenation  = obj({ segs:      arr(midstr), tags }).strict()
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
  sense: line4k, english: longstr, roman: longstr, alt: longstr,
  tags, raw_tags: tags, topics: arr(midstr),
 }).partial().strict()
export const nym = obj({
  relterm: longstr, sense: longstr, english: longstr, roman: longstr, alt: longstr,
  tags, raw_tags: tags, topics: arr(midstr),
  urls: arr(anyurl), source: longstr, taxonomic: midstr, qualifier: longstr, extra: longstr,
}).partial().required({ relterm: true }).strict()
export const instance  = obj({
  relterm: line1k, source: line1k, tags, extra: longstr,
}).partial({ extra: true, source: true }).strict()

export const descterm = obj({
  /** Descendant term.               */ relterm:      midstr,
  /** Sense ID                       */ senseid:      midstr,
  /** Language code                  */ langcode,
  /** Gender and number              */ gender:       midstr,
  /** Part of speech                 */ poskind,
  /** A gloss or short translation   */ gloss:        gloss,
  /** Display form of the term.      */ alt:          midstr,
  /** Transliteration of the term    */ translit:     midstr,
  /** Transcription of the term      */ transcript:   midstr,
  /** Literal translation            */ lit:          midstr,
  /** Script code                    */ scriptcode:   midstr,
  /** Label for the term             */ label:        midstr,
  /** Arbitrary qualifier            */ qualifier:    line1k,
  /** Borrowed                       */ bor:          loosebool,
  /** Orthographic borrowing         */ obor:         loosebool,
  /** Learned borrowing              */ learned:      loosebool,
  /** Semi-learned borrowing         */ semilearned:  loosebool,
  /** Calque                         */ calque:       loosebool,
  /** Partial calque                 */ pcalque:   loosebool,
  /** Semantic loan                  */ semloan:      loosebool,
  /** Provenance is uncertain.       */ uncertain:    loosebool,
  /** Inherited                      */ inh:          loosebool,
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
  wikipedia:        arr(midstr),
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
  formof:           arr(instance),
  altof:            arr(instance),
  attestations:     arr(attestation),
  examples:         arr(wktExample),
}).partial().strict()

export const wktLemma = obj({
  /** Base form of the subject word (eg happy)       */ headword:        term,                      // headword:    1_000_000,
  /** Part-of-speech tag                             */ poskind,                                    // poskind:     1_000_000,
  /** Wiktionary language code                       */ langcode,                                   // langcode:    1_000_000,
  /** WP Title (+opt lang code prefix)               */ wikipedia:        arr(longstr),             // wikipedia:      22_940:   strings
  /** Records for each distinct meaning of headword  */ senses:           arr(wktSense).nonempty(), // senses:      1_000_000:   { ...senses }
  /** Categories for the topic                       */ categories,                                 // categories:    176_772:   strings
  /** Etymology records                              */ etymology,                                  //
  /** descendant words                               */ descendants:      arr(wktDescendant),       // descendants     13_887: { relterm: 14_480,  langcode: 14_480,    bor:     12_492,  scriptcode: 23,        qualifier: 127,     translit:  1_469,  morph:    204,      senseid:   18,    gloss:     65,    inh:       3,     calque:    401,  uncertain: 55, poskind: 5, alt: 11, semilearned: 3, semloan: 27, gender: 113, pcalque: 17, obor: 5, learned: 4, lit: 3, label: 2,
  /** related words                                  */ related:          arr(nym),                 // related:        70_278: { relterm: 178_221, english:  3_547,     sense:   7_364,   tags:   ~ 2_393,       source:    1_616,   alt:       1_590,  urls: ~ 134,        topics:~ 659,     taxonomic: 110,   roman:     91,    raw_tags:~ 29,   qualifier: 15 }
  /** Inflections (pl, tense, etc) or alt forms      */ forms:            arr(wktWordform),         // forms:         379_658: { form:    618_412, tags: ~ 618_412,     source:  907,     head_nr:    165,       raw_tags:~ 85,      topics:~ 4     },
  /** translations                                   */ translations:     arr(translation),         // translations:   87_236: { relterm: 816_616, rellang:  818_225,   sense:   818_216, tags:     ~ 365_968,   roman:     228_759, alt:       11_378, english:  6_625,    note:      3_801, raw_tags:~ 381,   topics:  ~ 524,   taxonomic: 81 },
  /** hyphenations                                   */ hyphenations:     arr(hyphenation),         // hyphenations:    6_820: { segs:  ~ 7_098,   tags:   ~ 7_098   },
  /** abbreviations                                  */ abbreviations:    arr(abbreviation),        // abbreviations:      49: { abbrev:  51,      sense:    1 },
  /** pronunciation & sound files                    */ sounds:           arr(soundlink),           // sounds:        101_773: { audurl:  52_761,  oggurl:   52_762,    mp3url:  52_762,  ipa:        94_753,    rhymes:    31_907,  homophone: 4_556,  tags:   ~ 57_240,   note:      1_753, enpr:      5_159, other:     508,   text:      92,   topics:  ~ 4   },
  /** instances                                      */ instances:        arr(instance),            // instances:          15: { relterm: 223,     source:   223,       tags:  ~ 223   },
  /** derived-from relation                          */ derived:          arr(nym),                 // derived:        47_906: { relterm: 116_266, topics: ~ 238,       tags:  ~ 1_315,   alt:        761,       taxonomic: 5_045,   sense:     330,    english:  790,      urls:    ~ 12,    roman:     15,    raw_tags:~ 10   },
  /** same meaning:     "happy" ~ "glad"             */ synonyms:         arr(nym),                 // synonyms:       33_883: { relterm: 68_358,  sense:    12_958,    topics:~ 728,     source:     3_463,     tags:    ~ 4_613,   english:   1_160,  alt:      270,      raw_tags:~ 50,    roman:     22,    urls:    ~ 10,    taxonomic: 6,    qualifier: 17 },
  /** opposite meaning: "happy" <> "sad"             */ antonyms:         arr(nym),                 // antonyms:        6_157: { relterm: 8_188,   sense:    751,       topics:~ 17,      source:     666,       english:   146,     tags:    ~ 78,     alt:      15,       roman:     1 },
  /** "part of":        "eye":  ["face",   "head"]   */ holonyms:         arr(nym),                 // holonyms:          224: { relterm: 337,     source:   113,       sense:   23,      english:    5,         tags:    ~ 10,      alt:       1 },
  /** "has part":       "eye":  ["retina", "lens"]   */ meronyms:         arr(nym),                 // meronyms:          202: { relterm: 892,     sense:    101,       source:  249,     english:    93,        topics:  ~ 6,       alt:       49,     tags:   ~ 12,       taxonomic: 5 },
  /** "super":          "dog":  ["mammal", "animal"] */ hypernyms:        arr(nym),                 // hypernyms:       3_744: { relterm: 5_649,   english:  277,       source:  435,     sense:      382,       tags:    ~ 55,      topics:  ~ 81,     raw_tags: ~ 2,      alt:       40 },
  /** "subcategory":    "dog":  ["beagle", "poodle"] */ hyponyms:         arr(nym),                 // hyponyms:        2_775: { relterm: 10_659,  english:  498,       source:  2_207,   taxonomic:  245,       tags:    ~ 300,     topics:  ~ 124,    alt:      167,      sense:     1_205, roman:     9 },
  /** shares hypernym : "oak" ~ "maple" ~ "pine"     */ coordterms:       arr(nym),                 // coordterms:      5_936: { relterm: 22_755,  topics: ~ 176,       english: 1_380,   sense:      1_913,     alt:       421,     roman:     34,     source:   104,      tags:    ~ 257,   raw_tags:~ 6,     taxonomic: 24 },
  /** "manner of":      "walk": ["stroll", "waddle"] */ troponyms:        arr(nym),                 // troponyms:           1: { relterm: 1 },
  // /** Original title                              */ origtitle:        midstr.optional(),        //
  // /** Where information was found                 */ source,                                     //
}).partial().required({ headword: true, poskind: true, langcode: true }).strict()

// {
//   headword:    999_998,
//   poskind:     999_998,
//   langcode:    999_998,
//   sounds:      { _self: 101_773, audurl: 52_761, oggurl: 52_762, mp3url: 52_762, ipa: 94_753, rhymes: 31_907, homophone: 4_556, tags: ~ 57_240, note: 1_753, enpr: 5_159, other: 508, text: 92, topics: ~ 4 },
//   forms:       { _self: 379_658, form: 618_412, tags: ~ 618_412, source: 907, head_nr: 165, raw_tags: ~ 85, topics: ~ 4 },
//   translations: { _self: 87_236, relterm: 816_616, rellang: 818_225, sense: 818_216, tags: ~ 365_968, roman: 228_759, alt: 11_378, english: 6_625, note: 3_801, raw_tags: ~ 381, topics: ~ 524, taxonomic: 81 },
//   related:     { _self: 70_278, relterm: 178_221, english: 3_547, sense: 7_364, tags: ~ 2_393, source: 1_616, alt: 1_590, urls: ~ 134, topics: ~ 659, taxonomic: 110, roman: 91, raw_tags: ~ 29, qualifier: 15 },
//   synonyms:    { _self: 33_883, relterm: 68_358, sense: 12_958, topics: ~ 728, source: 3_463, tags: ~ 4_613, english: 1_160, alt: 270, raw_tags: ~ 50, roman: 22, urls: ~ 10, taxonomic: 6, qualifier: 17 },
//   categories:~ 176_772,
//   derived:     { _self: 47_906, relterm: 116_266, topics: ~ 238, tags: ~ 1_315, alt: 761, taxonomic: 5_045, sense: 330, english: 790, urls: ~ 12, roman: 15, raw_tags: ~ 10 },
//   wikipedia: ~ 22_940,
//   antonyms:    { _self: 6_157, relterm: 8_188, sense: 751, topics: ~ 17, source: 666, english: 146, tags: ~ 78, alt: 15, roman: 1 },
//   hyphenations: { _self: 6_820, segs: ~ 7_098, tags: ~ 7_098 },
//   coordterms:  { _self: 5_936, relterm: 22_755, topics: ~ 176, english: 1_380, sense: 1_913, alt: 421, roman: 34, source: 104, tags: ~ 257, raw_tags: ~ 6, taxonomic: 24 },
//   hypernyms:   { _self: 3_744, relterm: 5_649, english: 277, source: 435, sense: 382, tags: ~ 55, topics: ~ 81, raw_tags: ~ 2, alt: 40 },
//   hyponyms:    { _self: 2_775, relterm: 10_659, english: 498, source: 2_207, taxonomic: 245, tags: ~ 300, topics: ~ 124, alt: 167, sense: 1_205, roman: 9 },
//   meronyms:    { _self: 202, relterm: 892, sense: 101, source: 249, english: 93, topics: ~ 6, alt: 49, tags: ~ 12, taxonomic: 5 },
//   holonyms:    { _self: 224, relterm: 337, source: 113, sense: 23, english: 5, tags: ~ 10, alt: 1 },
//   troponyms:   { _self: 1, relterm: 1 },
//   instances:   { _self: 15, relterm: 223, source: 223, tags: ~ 223 },
//   abbreviations: { _self: 49, abbrev: 51, sense: 1 },
//   }

//   {
//   _self:       999_998,
//   glosses:   ~ 1_127_625,
//   categories:~ 1_034_399,
//   tags:      ~ 801_555,
//   links:       { _self: 1_093_410, target: 2_193_689, text: 2_193_689 },
//   formof:      { _self: 377_840, relterm: 377_962, tags: ~ 377_962, extra: 6_168 },
//   examples:    { _self: 202_018, text: 374_936, type: 346_313, highlights: { _self: 342_726, text: { '0': 381_831, '1': 381_831, _self: 342_717 }, english: { '0': 155, '1': 155, _self: 135 }, roman: { '0': 1, '1': 1, _self: 1 }, literal: { '0': 1, '1': 1, _self: 1 } }, ref: 327_462, tags: ~ 1_823, english: 849, roman: 159, raw_tags: ~ 19 },
//   raw_glosses: ~ 279_193,
//   altof:       { _self: 97_819, relterm: 100_044, tags: ~ 100_044, extra: 8_344 },
//   topics:    ~ 149_306,
//   synonyms:    { _self: 37_990, relterm: 150_885, source: 97_100, tags: ~ 39_524, raw_tags: ~ 121, extra: 2_637, english: 235, alt: 49, topics: ~ 28 },
//   raw_tags:  ~ 6_551,
//   qualifier:   10_718,
//   senseid:   ~ 4_538,
//   hypernyms:   { _self: 2_407, relterm: 5_395, source: 55, tags: ~ 3, english: 6, alt: 15, topics: ~ 1 },
//   coordterms:  { _self: 5_735, relterm: 13_245, topics: ~ 2, english: 100, tags: ~ 9, alt: 10, source: 28 },
//   wikipedia: ~ 63_296,
//   wikidata:  ~ 1_964,
//   antonyms:    { _self: 3_446, relterm: 5_753, source: 470, tags: ~ 36, alt: 4, raw_tags: ~ 4, english: 19 },
//   attestations: { _self: 4_276, date: 4_288, refs: { _self: 38, refn: 33, text: 6 } },
//   hyponyms:    { _self: 342, relterm: 565, tags: ~ 5, english: 3, topics: ~ 1, source: 9 },
//   related:     { _self: 418, relterm: 671, tags: ~ 671 },
//   holonyms:    { _self: 58, relterm: 63 },
//   troponyms:   { _self: 6, relterm: 9 },
//   meronyms:    { _self: 109, relterm: 344 },
//   }

//     at Object.<anonymous> (tests/mungers/wiktionary/WiktionaryExtractRaw.test.ts:79:13)

// console.log
//   {
//   _self:       372_818,
//   suffix:       { _self: 102_020, expansion: 102_399, root: 98_345, suffix: 102_361, parts: { _self: 102_399, relterm: 200_754, langcode: 200_754, senseid: 5_119, gloss: 342, poskind: 2_669, alt: 112, translit: 5, lit: 2 }, tname: 102_399, langcode: 102_399, senseid2: 5_264, poskind1: 230, gloss2: 444, gloss1: 693, poskind2: 671, alt1: 382, langcode1: 144, poskind: 1_057, alt2: 118, senseid1: 26, translit1: 7, translit2: 4, qualifier2: 1, lit: 1, langcode2: 1, qualifier1: 2, translit3: 1, poskind3: 1, lit1: 1, senseid3: 1 },
//   inherited:    { _self: 9_059, expansion: 13_622, relterm: 13_488, rellang: 13_622, tname: 13_622, langcode: 13_622, gloss: 3_057, poskind: 81, alt: 196, lit: 48, senseid: 43, gender: 21, qualifier: 2, translit: 2 },
//   cognate:      { _self: 6_925, expansion: 13_747, relterm: 13_679, rellang: 13_747, tname: 13_747, langcode: 13_747, gloss: 6_406, alt: 126, translit: 215, poskind: 55, lit: 82, senseid: 7, scriptcode: 10, gender: 6, transcript: 8 },
//   other:        { '1': 1_117, '2': 1_106, '3': 7, '4': 4, '5': 1, _self: 1_211, expansion: 1_215, tname: 1_215, origname: 1_215, sl: 1, gloss: 14, translit: 4, poskind: 7 },
//   affix:        { _self: 30_086, expansion: 30_901, parts: { _self: 30_900, relterm: 62_662, langcode: 62_662, senseid: 3_714, gloss: 2_306, poskind: 1_387, alt: 853, qualifier: 11, translit: 24, lit: 48, gender: 1 }, tname: 30_901, langcode: 30_901, senseid2: 3_549, senseid1: 1_294, poskind1: 592, senseid3: 189, gloss1: 2_079, gloss2: 2_506, poskind2: 1_035, alt1: 1_353, alt2: 662, langcode1: 554, poskind3: 102, gloss3: 579, alt3: 233, langcode2: 155, translit1: 38, qualifier1: 58, qualifier2: 10, poskind: 130, translit2: 19, type: 12, lit: 21, gender2: 1, gloss4: 37, langcode3: 13, lit3: 2, alt4: 41, langcode4: 2, alt5: 5, senseid4: 10, gender1: 7, poskind4: 2, translit3: 5, qualifier3: 1, gloss5: 1 },
//   prefix:       { _self: 99_224, expansion: 99_287, prefix: 99_287, root: 99_068, parts: { _self: 99_287, relterm: 198_439, langcode: 198_439, gloss: 325, alt: 25, poskind: 253, translit: 1, senseid: 13, lit: 2 }, tname: 99_287, langcode: 99_287, gloss2: 325, gloss1: 549, langcode2: 9, poskind1: 98, alt1: 129, senseid1: 434, alt2: 25, poskind: 103, poskind2: 48, translit2: 1, senseid2: 13, lit: 1 },
//   doublet:      { '21': 4, _self: 3_922, expansion: 3_945, relterms: ~ 3_936, tname: 3_946, langcode: 3_946, senseid3: 8, gloss1: 21, senseid4: 5, poskind1: 6, qualifier1: 1, alt1: 3, alt4: 2, senseid1: 12, gloss3: 3, gloss2: 3, poskind3: 1, poskind4: 1, senseid2: 1, gloss5: 1, senseid5: 1 },
//   derived:      { _self: 38_492, expansion: 52_115, relterm: 51_326, rellang: 52_417, tname: 52_417, langcode: 52_417, gloss: 17_579, alt: 966, scriptcode: 77, transcript: 92, translit: 1_573, flavor: 11_844, lit: 446, poskind: 270, gender: 50, senseid: 35, inh: 8 },
//   root:         { _self: 4_290, relterms: ~ 4_331, rellang: 4_331, tname: 4_331, langcode: 4_331, alt: 408, senseid: 466, gloss: 48, senseid1: 26, senseid2: 40, senseid3: 5, senseid5: 1, senseid6: 1 },
//   borrowed:     { _self: 36_576, expansion: 40_117, relterm: 39_595, rellang: 40_117, tname: 40_117, langcode: 40_117, gloss: 4_465, flavor: 1_941, translit: 2_900, lit: 992, alt: 339, poskind: 111, gender: 47, scriptcode: 52, transcript: 20, senseid: 11 },
//   onomato: { _self: 307, expansion: 306, tname: 307, langcode: 307, title: 160 },
//   surf:         { _self: 1_622, expansion: 1_668, parts: { _self: 1_666, relterm: 3_527, poskind: 38, langcode: 3_325, senseid: 78, gloss: 26, alt: 12, lit: 10 }, poskind: 2, tname: 1_668, langcode: 1_666, relterm: 99, relterms: ~ 99, senseid2: 82, poskind2: 33, gloss1: 43, poskind1: 8, gloss2: 30, alt1: 40, alt2: 13, lit: 4, senseid1: 9, langcode1: 2, senseid3: 5, translit1: 1, poskind3: 2, type: 3, lit1: 1 },
//   pieword:      { _self: 184, expansion: 203, relterm: 203, rellang: 203, tname: 203, langcode: 203 },
//   glossary:     { _self: 2_082, expansion: 4_387, target: 4_387, text: 4_387, tname: 4_387 },
//   calque:       { _self: 1_200, expansion: 1_241, relterm: 1_232, rellang: 1_241, tname: 1_241, langcode: 1_241, gloss: 125, scriptcode: 2, translit: 116, lit: 57, alt: 9, poskind: 6 },
//   compound:     { _self: 23_488, expansion: 23_526, parts: { _self: 23_525, relterm: 47_511, langcode: 47_511, gloss: 670, poskind: 271, alt: 55, senseid: 21, lit: 14, translit: 29 }, tname: 23_526, langcode: 23_526, gloss1: 724, type: 208, gloss2: 640, poskind2: 91, alt1: 61, poskind: 88, alt2: 55, gloss3: 31, poskind1: 115, senseid2: 19, senseid1: 21, lit: 7, translit1: 26, translit2: 29, langcode1: 31, langcode2: 12, poskind3: 4, langcode4: 1, gloss4: 1, alt3: 1, senseid3: 2 },
//   confix:       { _self: 8_813, expansion: 8_830, prefix: 8_830, root: 8_830, parts: { _self: 8_830, relterm: 18_830, langcode: 18_830, gloss: 264, senseid: 98, alt: 35, poskind: 23, lit: 2 }, tname: 8_830, langcode: 8_830, gloss1: 318, gloss2: 254, suffix: 1_170, alt1: 55, senseid2: 79, alt2: 34, poskind1: 20, poskind2: 20, senseid1: 45, gloss3: 10, langcode2: 2, senseid3: 19, poskind3: 3, alt3: 1, lit: 1 },
//   clipping:     { _self: 950, expansion: 966, relterm: 920, tname: 966, langcode: 966, alt: 7, lit: 1, gloss: 1, translit: 1 },
//   blend:        { _self: 5_500, expansion: 5_541, relterms: ~ 5_534, tname: 5_541, langcode: 5_541, gloss1: 120, gloss2: 90, alt1: 95, alt2: 56, alt3: 2, poskind1: 17, translit1: 3, translit2: 4, langcode1: 11, poskind2: 7, qualifier1: 1, gloss3: 4, senseid1: 3, langcode2: 8, senseid2: 2, langcode3: 1 },
//   mention:      { _self: 375, expansion: 516, target: 501, text: 511, tname: 516, langcode: 516, gloss: 143, translit: 29, wplink: 2, poskind: 1, senseid: 1 },
//   noncognate:   { _self: 402, expansion: 514, relterm: 511, rellang: 514, gloss: 192, tname: 514, langcode: 514, lit: 19, poskind: 3, translit: 40, alt: 8, transcript: 1, scriptcode: 2 },
//   etymon:       { _self: 218, senseid: 218, tname: 218, langcode: 218, expansion: 150, tree: 134, text: 38, exnihilo: 4, poskind: 1 },
//   coinage:      { _self: 807, expansion: 823, entity: 823, tname: 823, langcode: 823, nat: 284, occ: 359, nats: ~ 278, occs: ~ 349, wplink: 158, coinedin: 474, alt: 6, exnihilo: 2 },
//   namedfor:     { _self: 713, expansion: 731, entity: 728, tname: 731, langcode: 731, wplink: 455, nat: 450, occ: 509, nats: ~ 388, occs: ~ 442, born: 336, died: 316, translit: 3, alt: 2 },
//   qualifier:    { _self: 179, expansion: 218, qualifier: 218, qualifiers: ~ 218, tname: 218 },
//   unknown:      { _self: 585, expansion: 586, tname: 586, title: 160 },
//   uncertain:    { _self: 459, expansion: 458, tname: 459, title: 12 },
//   taxfmt:       { _self: 1_074, expansion: 1_101, taxon: 1_101, level: 1_101, tname: 1_101 },
//   abbrev:       { _self: 104, expansion: 105, relterm: 96, tname: 105, langcode: 105, rellang: 105, gloss: 4, alt: 7 },
//   taxlink:      { _self: 450, expansion: 505, taxon: 505, level: 505, tname: 505, alt: 10, wplink: 6 },
//   etymid:       { _self: 105, etymid: 105, tname: 105, langcode: 105 },
//   pcalque:      { _self: 98, expansion: 98, relterm: 98, rellang: 98, lit: 9, tname: 98, langcode: 98, translit: 7, gloss: 8 },
//   abbrevof:     { _self: 13, expansion: 13, relterm: 13, tname: 13, langcode: 13, rellang: 13 },
//   }


export type WktForm               = TY.Zcasted<typeof  wktWordform>
export type WktLemma              = TY.Zcasted<typeof  wktLemma>
export type WktSense              = TY.Zcasted<typeof  wktSense>
export type WktExample            = TY.Zcasted<typeof  wktExample>
export type WktDescendant         = TY.Zcasted<typeof  wktDescendant>
//
export type WktAbbreviation       = TY.Zcasted<typeof  abbreviation>
export type WktAttestation        = TY.Zcasted<typeof  attestation>
export type WktDescterm           = TY.Zcasted<typeof  descterm>
export type WktDesctree           = TY.Zcasted<typeof  desctree>
export type WktHyphenation        = TY.Zcasted<typeof  hyphenation>
export type WktLink               = TY.Zcasted<typeof  link>
export type WktNym                = TY.Zcasted<typeof  nym>
export type WktInstance           = TY.Zcasted<typeof  instance>
export type WktSoundlink          = TY.Zcasted<typeof  soundlink>
export type WktTranslation        = TY.Zcasted<typeof  translation>
export type WktEtymologyTemplates = TY.Zcasted<typeof  etymologyTemplate>
export type WktEtymologyBag       = TY.Zcasted<typeof  etymologyBag>
