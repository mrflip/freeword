import      _                                /**/ from 'lodash'
import      * as FW                               from '@freeword/meta'
import type * as TY                               from './types/CoreTypes.ts'

// export class WiktionaryWordform extends FW.Wordform implements WktLemma {
//   //
//   declare headword:            TY.Word
//   declare poskind:             TY.Poskind
//   declare langcode:            TY.Langcode
//   declare categories:          string[]
//   declare etymology:           { text: string, number: number, templates: WktEtymologyRecsBag }
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
  form: longstr, tags, source, topics: arr(longstr), head_nr: bareint.max(30).min(0), // raw_tags: tags,
}).partial().strict()

export const etymologyRecNames = [
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

const etympart       = obj({ relterm: line1k, langcode: langcode, senseid, gloss: line1k, poskind: longstr, gender: midstr, alt: longstr, translit: longstr, qualifier: longstr, lit: longstr }).partial().strict()
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
export const genericetymologyRec = obj({
  /** Template name                */ tname:     oneof(WktTemplateNames),
  /** Plaintext rendering          */ expansion,
  /** Object term                  */ relterm,
  /** Object terms list            */ relterms,
  /** Language of the object term  */ rellang,
  /** Language of the subject term */ langcode,
  /** Part of speech               */ poskind:    longstr,
  /** Sense ID                     */ senseid,
  /** Gloss                        */ gloss,
  /** Alternative text             */ alt:        longstr,
  /** Object entity                */ entity:     midstr,
  /** Etymology ID                 */ etymid:     midstr,
  /** Prefix morpheme              */ prefix,
  /** Root morpheme                */ root,
  /** Suffix morpheme              */ suffix,
  /** Gender of Object term        */ gender:     midstr,
  /** transliteration              */ translit:   midstr,
  /** transcript                   */ transcript: midstr,
  /** literal meaning              */ lit:        midstr,
  /** Taxonomy                     */ taxon:      midstr,
  /** Taxonomy level               */ level:      midstr,
  /** Link Text                    */ text:       line1k,
  /** Link Target                  */ target:     midstr,
  /** Is an original coinage?      */ exnihilo:   loosebool,
  /** ??                           */ tree:       text4k,
  /** Additional text to show      */ addl:       midstr,
  /** Script of text               */ scriptcode: midstr,
  /** ??                           */ qualifier:  midstr,
  /** ??                           */ qualifiers: positionals,
  /** Category                     */ cat:        wikicategory,
  /** Categories                   */ cats:       arr(wikicategory),
  /** Title                        */ title:      longstr,
  /** wikipedia link               */ wplink:     longstr,
  /** Morpheme parts               */ parts,
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

// == [Etymology record types] ==

const prefixTemplate       = genericetymologyRec.pick({ expansion: true, parts:     true, prefix:    true, root: true,                  gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('prefix'),    ...compoundTemplateCks }).strict()
const confixTemplate       = genericetymologyRec.pick({ expansion: true, parts:     true, prefix:    true, root: true, suffix: true,    gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('confix'),    ...compoundTemplateCks }).strict()
const suffixTemplate       = genericetymologyRec.pick({ expansion: true, parts:     true, root:      true,             suffix: true,    gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('suffix'),    ...compoundTemplateCks }).strict()
const affixTemplate        = genericetymologyRec.pick({ expansion: true, parts:     true,                                               gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('affix'),     ...compoundTemplateCks }).strict()
const surfTemplate         = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, relterms:  true,             gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('surf'),      ...compoundTemplateCks }).strict()
const compoundTemplate     = genericetymologyRec.pick({ expansion: true, parts:     true,                                               gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('compound'),  ...compoundTemplateCks }).strict()
const derivedTemplate      = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('derived'),  /* is inherited? */ inh: loosebool.optional(), /* orig template name */ flavor: midstr.optional()  }).strict()
const borrowedTemplate     = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('borrowed'), /* orig template name */ flavor: midstr.optional() }).strict()
const inheritedTemplate    = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('inherited')    }).strict()
const calqueTemplate       = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('calque')       }).strict()
const pcalqueTemplate      = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('pcalque')      }).strict()
const rootTemplate         = genericetymologyRec.pick({ expansion: true, parts:     true, relterms:  true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('root')         }).strict()
const piewordTemplate      = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true,                                                                                                                                          tname: true, langcode: true }).extend({ /** Template name */ tname: literal('pieword')      }).strict()
const clippingTemplate     = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true,                   alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('clipping')     }).strict()
const blendTemplate        = genericetymologyRec.pick({ expansion: true, parts:     true, relterms:  true,                   alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('blend')        }).strict()
const doubletTemplate      = genericetymologyRec.pick({ expansion: true, parts:     true, relterms:  true,                   alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('doublet')      }).strict()
const cognateTemplate      = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('cognate')      }).strict()
const noncognateTemplate   = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, qualifier: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('noncognate')   }).strict()
const abbrevTemplate       = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, addl:   true, cat: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('abbrev')       }).strict()
const abbrevofTemplate     = genericetymologyRec.pick({ expansion: true, parts:     true, relterm:   true, rellang:   true,  alt: true, gloss: true, addl:   true, cat: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('abbrevof')     }).strict()
const coinageTemplate      = genericetymologyRec.pick({ expansion: true, parts:     true, entity:    true, exnihilo:  true, cats: true,                                                      scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend(personCks).partial().extend({ /** Template name */ tname: literal('coinage')      }).strict()
const namedforTemplate     = genericetymologyRec.pick({ expansion: true, parts:     true, entity:    true,                  cats: true,                                                      scriptcode: true, translit: true, senseid: true, transcript: true,                  tname: true, langcode: true }).extend(personCks).partial().extend({ /** Template name */ tname: literal('namedfor')     }).strict()
const etymonTemplate       = genericetymologyRec.pick({ expansion: true, text:      true, exnihilo:  true, tree: true,                                             lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, wplink: true,    tname: true, langcode: true }).extend({ /** Template name */ tname: literal('etymon')       }).strict()
const mentionTemplate      = genericetymologyRec.pick({ expansion: true, text:      true, target:    true,  alt: true, gloss: true, gender: true,                  lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, wplink: true,    tname: true, langcode: true }).extend({ /** Template name */ tname: literal('mention')      }).strict()
const taxlinkTemplate      = genericetymologyRec.pick({ expansion: true, taxon:     true, level:     true,  alt: true, gloss: true, gender: true,                  lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, wplink: true,    tname: true, langcode: true }).extend({ /** Template name */ tname: literal('taxlink')      }).strict()
const taxfmtTemplate       = genericetymologyRec.pick({ expansion: true, taxon:     true, level:     true,  alt: true,                                                                                                                                                           tname: true, langcode: true }).extend({ /** Template name */ tname: literal('taxfmt')       }).strict()
const glossaryTemplate     = genericetymologyRec.pick({ expansion: true, text:      true, target:    true,                                                                                                                                                                       tname: true,                }).extend({ /** Template name */ tname: literal('glossary')     }).strict()
const etymidTemplate       = genericetymologyRec.pick({ expansion: true, etymid:    true,                                                                                                                                                                                        tname: true, langcode: true }).extend({ /** Template name */ tname: literal('etymid')       }).strict()
const qualifierTemplate    = genericetymologyRec.pick({ expansion: true, qualifier: true, qualifiers: true,                                                                                                                                                                      tname: true, langcode: true }).extend({ /** Template name */ tname: literal('qualifier')    }).strict()
const onomatoTemplate      = genericetymologyRec.pick({ expansion: true, title:     true,                                                                                                                                                                                        tname: true, langcode: true }).extend({ /** Template name */ tname: literal('onomato')      }).strict()
const unknownTemplate      = genericetymologyRec.pick({ expansion: true,                  title:      true,                                                                                                                                                                      tname: true, langcode: true }).extend({ /** Template name */ tname: literal('unknown')      }).strict()
const uncertainTemplate    = genericetymologyRec.pick({ expansion: true,                  title:      true,                                                                                                                                                                      tname: true, langcode: true }).extend({ /** Template name */ tname: literal('uncertain')    }).strict()
const otherTemplate        = genericetymologyRec.pick({ expansion: true,                                    alt: true, gloss: true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true,                                   tname: true,                }).extend({ /** Template name */ tname: literal('other')        }).passthrough()

/** tagged union of all templates */
export const anyEtymologyRec = cases('tname', [
  suffixTemplate, confixTemplate, prefixTemplate, affixTemplate, surfTemplate, compoundTemplate, clippingTemplate,
  derivedTemplate, borrowedTemplate, inheritedTemplate, calqueTemplate, pcalqueTemplate, cognateTemplate, noncognateTemplate,
  rootTemplate, doubletTemplate, blendTemplate, piewordTemplate, coinageTemplate, namedforTemplate,
  taxlinkTemplate, taxfmtTemplate, mentionTemplate, abbrevofTemplate, abbrevTemplate,
  glossaryTemplate, etymonTemplate, etymidTemplate, onomatoTemplate, qualifierTemplate, unknownTemplate,
  uncertainTemplate, otherTemplate,
])
// --

export const etymologyRecsBag = obj({ // total: 411_540,
  prefix:     arr(prefixTemplate),          // prefix:     ~ 93_478:  { tname:  93_547, expansion:  93_547, langcode:  93_547, prefix:   93_547, root:    93_300,                  lit:    1,                poskind:   104, parts: 93_547: { relterm: 186_917, langcode:  186_917, alt:     186, lit: 3   senseid:    478, poskind:   404, gloss:    1_185, translit:   1,                               } },
  confix:     arr(confixTemplate),          // confix:     ~ 9_239:   { tname:   9_258, expansion:   9_258, langcode:   9_258, prefix:    9_258, root:     9_258, suffix:   1_141, lit:    2,                                parts:  9_258: { relterm:  19_657, langcode:   19_657, alt:      99, lit: 4   senseid:    148, poskind:    75, gloss:      681,                                              } },
  suffix:     arr(suffixTemplate),          // suffix:     ~ 105_124: { tname: 105_608, expansion: 105_608, langcode: 105_608,                   root:   100_966, suffix: 105_565, lit:    3,                poskind: 1_101, parts:105_608: { relterm: 206_573, langcode:  206_573, alt:     602, lit: 7,  senseid:  6_273, poskind: 3_632, gloss:    1_635, translit:   15, qualifier:  2                } },
  affix:      arr(affixTemplate),           // affix:      ~ 35_113:  { tname:  36_404, expansion:  36_404, langcode:  36_404,                                                     lit:    6,                poskind:   145, parts: 36_404: { relterm:  72_917, langcode:   72_917, alt:   2_368, lit: 83, senseid:  7_242, poskind: 3_307, gloss:    6_425, translit:   67, qualifier: 71, gender: 6     }, type:  20, qualifier: 2,   },
  surf:       arr(surfTemplate),            // surf:       ~ 3_412:   { tname:   3_463, expansion:   3_463, langcode:   3_463, relterm:     293, relterms:   293,                  lit:    5,                poskind:    11, parts:  3_463: { relterm:   7_187, langcode:    6_597, alt:     114, lit: 13  senseid:    235, poskind:   120, gloss:      181, translit:   1,                               }, type:   3,                 },
  compound:   arr(compoundTemplate),        // compound:   ~ 25_481:  { tname:  25_539, expansion:  25_539, langcode:  25_539,                                                     lit:    9,                poskind:    98, parts: 25_538: { relterm:  51_559, langcode:   51_559, alt:     138, lit: 20, senseid:     52, poskind:   468, gloss:    1_858, translit:   73, qualifier: 2                 }, type: 280,                 },
  root:       arr(rootTemplate),            // root:       ~ 13_353:  { tname:  13_547,                     langcode:  13_547, rellang:  13_547, relterms: 13_547,                            senseid: 1_429,                parts: 13_547: { relterm:  14_750,                                            senseid:  1_789                                                                                } },
  doublet:    arr(doubletTemplate),         // doublet:    ~ 9_788:   { tname:   9_924, expansion:   9_921, langcode:   9_924,                   relterms:  9_898,                                                           parts:  9_898: { relterm:  15_575, langcode:   15_575, alt:      14,          senseid:     86, poskind:    22, gloss:      116,                 qualifier:  1                } },
  blend:      arr(blendTemplate),           // blend:      ~ 5_512:   { tname:   5_567, expansion:   5_567, langcode:   5_567,                   relterms:  5_555,                                                           parts:  5_554: { relterm:  11_157, langcode:   11_157, alt:     164,          senseid:      5, poskind:    38, gloss:      224, translit:   10, qualifier:  1                } },
  clipping:   arr(clippingTemplate),        // clipping:   ~ 1_747:   { tname:   1_769, expansion:   1_769, langcode:   1_769,                   relterm:   1_675, alt:    25,     lit:     1, senseid:    1,                gloss:     86,  translit:       1                                                                                       },
  derived:    arr(derivedTemplate),         // derived:    ~ 62_974:  { tname: 105_137, expansion: 104_384, langcode: 105_137, rellang: 105_137, relterm: 103_071, alt: 3_003,     lit:   800, senseid:  187, poskind:  648, gloss: 39_303,  translit:   2_328, scriptcode:    141, gender:  134,  transcript: 141, flavor:    16_099, inh:       43 },
  borrowed:   arr(borrowedTemplate),        // borrowed:   ~ 43_821:  { tname:  47_129, expansion:  47_129, langcode:  47_129, rellang:  47_129, relterm:  46_525, alt:   545,     lit: 1_180, senseid:   25, poskind:  194, gloss:  7_410,  translit:   3_158, scriptcode:     81, gender:   68,  transcript: 22,  flavor:    2_142,                },
  inherited:  arr(inheritedTemplate),       // inherited:  ~ 26_543:  { tname:  47_401, expansion:  47_399, langcode:  47_401, rellang:  47_401, relterm:  47_092, alt:   731,     lit:   163, senseid:  276, poskind:  420, gloss: 11_094,  translit:       2, scriptcode:      4, gender:   62,                   qualifier:     2 },
  calque:     arr(calqueTemplate),          // calque:     ~ 1_382:   { tname:   1_440, expansion:   1_440, langcode:   1_440, rellang:   1_440, relterm:   1_424, alt:    11,     lit:    69,                poskind:    6, gloss:    174,  translit:     123, scriptcode:      2  gender:    1,                                    },
  pcalque:    arr(pcalqueTemplate),         // pcalque:    ~ 105:     { tname:     105, expansion:     105, langcode:     105, rellang:     105, relterm:     105,                 lit:    11                                gloss:      8,  translit:       7,                                                                      },
  cognate:    arr(cognateTemplate),         // cognate:    ~ 18_746:  { tname:  62_242, expansion:  62_242, langcode:  62_242, rellang:  62_242, relterm:  62_049, alt:   566,     lit:   249, senseid:   28, poskind:  313, gloss: 33_636,  translit:     995, scriptcode:     89, gender:   47,  transcript: 37,  qualifier:    1  },
  noncognate: arr(noncognateTemplate),      // noncognate: ~ 1_929:   { tname:   2_962, expansion:   2_962, langcode:   2_962, rellang:   2_962, relterm:   2_950, alt:    68,     lit:   187, senseid:    6, poskind:  21,  gloss:  1_078,  translit:      86, scriptcode:      2                 transcript: 3,                    },
  mention:    arr(mentionTemplate),         // mention:    ~ 1_131:   { tname:   1_693, expansion:   1_693, langcode:   1_693, text:      1_691, target:    1_655, wplink: 17,     lit:     6, senseid:    7, poskind:    6, gloss:    459,  translit:      45,                                                                      },
  etymon:     arr(etymonTemplate),          // etymon:     ~ 865:     { tname:     867, expansion:     590, langcode:     867, text:         60, exnihilo:     10, tree:  572,                 senseid:  867, poskind:    1                  },
  abbrev:     arr(abbrevTemplate),          // abbrev:     ~ 158:     { tname:     159, expansion:     159, langcode:     159, rellang:     159, relterm:     134, alt:    12                                                gloss:     7    },
  abbrevof:   arr(abbrevofTemplate),        // abbrevof:   ~ 44:      { tname:      56, expansion:      56, langcode:      56, rellang:      56, relterm:      56                                                                            },
  pieword:    arr(piewordTemplate),         // pieword:    ~ 733:     { tname:     784, expansion:     780, langcode:     784, rellang:     784, relterm:     784                                                                            },
  coinage:    arr(coinageTemplate),         // coinage:    ~ 1_165:   { tname:   1_194, expansion:   1_194, langcode:   1_194, nats:      ~ 444, occs:      ~ 535, alt:     8, entity:  1_194, exnihilo:   1, wplink: 201, nat:  452, occ:  548, coinedin:        706  },
  namedfor:   arr(namedforTemplate),        // namedfor:   ~ 857:     { tname:     877, expansion:     877, langcode:     877, nats:      ~ 465, occs:      ~ 537, alt:     1, entity:  874,   translit:   3, wplink: 607, nat:  551, occ:  627, born: 422, died: 399  },
  onomato:    arr(onomatoTemplate),         // onomato:    ~ 890:     { tname:     892, expansion:     890, langcode:     892, title:        515 },
  etymid:     arr(etymidTemplate),          // etymid:     ~ 766:     { tname:     766, langcode:      766, etymid:       766                                                                                                      },
  taxlink:    arr(taxlinkTemplate),         // taxlink:    ~ 572:     { tname:     668, expansion:     668, taxon:        668, level:        668,wplink:        6, alt: 11                                                       },
  taxfmt:     arr(taxfmtTemplate),          // taxfmt:     ~ 1_234:   { tname:   1_283, expansion:   1_283, taxon:      1_283, level:      1_283 },
  glossary:   arr(glossaryTemplate),        // glossary:   ~ 5_153:   { tname:  12_134, expansion:  12_134, target:    12_134, text:      12_134 },
  qualifier:  arr(qualifierTemplate),       // qualifier:  ~ 428:     { tname:     560, expansion:     560, qualifier:    560, qualifiers:   ~ 560   },
  uncertain:  arr(uncertainTemplate),       // uncertain:  ~ 1_217:   { tname:   1_220, expansion:   1_218, title:         73                        },
  unknown:    arr(unknownTemplate),         // unknown:    ~ 1_237:   { tname:   1_246, expansion:   1_246, title:        292                        },
  other:      arr(otherTemplate),           // other:
} satisfies Record<WktTemplateName, FW.ZodTypeAny>).partial().strict()
export const etymologyRecsBagShape = _.mapValues(etymologyRecsBag._def.shape(), (val) => FW.CK.summarizeCheckerDef(val._def.innerType)) as Record<WktTemplateName, FW.CK.CheckerSummary>

export const etymology = obj({
  text: text4k, number: bareint, records: etymologyRecsBag,
}).partial().strict()

export const wktExample = obj({
  text:    text4k,
  english: line1k,
  roman:   line1k,
  ref:     line4k,
  type:    oneof(['example', 'quotation']),
  tags,
  highlights: obj({ text: highlights, english: highlights, roman: highlights, literal: highlights }).partial(),
  // raw_tags: tags,
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

/** Pronunciation and audio files of a word */
export const soundlink    = obj({
  /** associated text, ymmv         */ text:       line1k,
  /** Engl pronunciation respelling */ enpr: midstr,
  /** topics                        */ topics:     arr(midstr),
  /** pronunciation as IPA string   */ ipa:        midstr,
  /** rhymes with words             */ rhymes:     midstr,
  /** words with same sound         */ homophone:  midstr,
  /** source of the sound file      */ source:     line1k,
  /** tags for the sound file       */ tags,
  /** note for the sound file       */ note:       text4k,
  /** audio file URL                */ audurl,
  /** ogg file URL                  */ oggurl,
  /** mp3 file URL                  */ mp3url,
  /** other                         */ other:      line1k,
}).partial().strict()

/** Translation of a word */
export const translation  = obj({
  /** translated term; opt if note  */ relterm:    longstr,
  /** comment on the translation    */ note:       line1k,
  /** language translated into      */ rellang,
  /** taxonomic name if mentioned   */ taxonomic:  midstr,
  /** sense being translated        */ sense:      line4k,
  /** sense, in English             */ english:    longstr,
  /** sense, romanized              */ roman:      longstr,
  /** alt form (eg in diff script)  */ alt:        longstr,
  /** qualifiers, eg, gender        */ tags,
  /** topics for the translation    */ topics:     arr(midstr),
  // /** raw tags                   */ raw_tags:   tags,

}).partial().strict()

/** Related word */
export const nym = obj({
  /** related term                  */ relterm:   longstr,
  /** sense                         */ sense:     longstr,
  /** English text                  */ english:   longstr,
  /** romanized text                */ roman:     longstr,
  /** alternative form              */ alt:       longstr,
  /** qualifiers, eg, gender        */ tags,
  /** topics for the target word    */ topics:    arr(midstr),
  /** URLs for the target word      */ urls:      arr(anyurl),
  /** source of the assertion       */ source:    longstr,
  /** taxonomic name if mentioned   */ taxonomic: midstr,
  /** qualifier                     */ qualifier: longstr,
  /** extra                         */ extra:     longstr,
  // /** raw tags                   */ raw_tags:  tags,
}).partial().required({ relterm: true }).strict()
export const instance  = obj({
  relterm: line1k, source: line1k, tags, extra: longstr,
}).partial({ extra: true, source: true }).strict()

/** Descendant step info */
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
  /** Partial calque                 */ pcalque:      loosebool,
  /** Semantic loan                  */ semloan:      loosebool,
  /** Provenance is uncertain.       */ uncertain:    loosebool,
  /** Inherited                      */ inh:          loosebool,
  /** Derived via morpheme (affix) or analogical leveling. (orig called "der")
   *                                 */ morph:        loosebool,
}).partial().required({ relterm: true, langcode: true }).strict()

/** Descendant tree */
export const desctree = obj({
  expansion: text4k, parts: arr<TY.ZodType<WktDescterm>>(descterm),
}).strict()

/** Descendant word */
export const wktDescendant = obj({
  text: line1k, depth, desctrees: arr(desctree),
}).partial().strict()

export const wktSense = obj({
  /** wikidata ID (eg Q12345) for the sense          */ wikidata:         arr(wikidata),     // wikidata:     ~ 5_036,
  /** any textual ids for the sense                  */ senseid:          arr(senseid),      // senseid:      ~ 15_483,
  /** number for the sense                           */ headnum:          posint.max(20),    // headnum:      ~ 577,
  /** glosses for the sense                          */ glosses:          arr(gloss),        // glosses:      ~ 1_243_707,
  /** Wikipedia page titles (+ opt lang)             */ wikipedia:        arr(midstr),       // wikipedia:    ~ 63_396,
  /** qualifier for the sense                        */ qualifier:        longstr,           // qualifier:    ~ 16_280,
  /** topics for the sense                           */ topics:           arr(midstr),       // topics:       ~ 181_918,
  /** taxonomic structure if approp.                 */ taxonomic:        midstr,            // taxonomic:    ~ 55,
  /** categories for the sense                       */ categories,                          // categories:   ~ 1_117_958,
  /** tags for the sense                             */ tags,                                // tags:         ~ 871_792,
  /** other web links for the sense                  */ links:            arr(link),         // links:        ~ (1_189_975): target:  2_581_793, text:    2_581_793 },
  /** same meaning:     "happy" ~ "glad"             */ synonyms:         arr(nym),          // synonyms:     ~ (53_734):    relterm: 339_400,   source:  251_554,    tags:       ~ 81_823,    english: 552,      extra:  2_889,     alt:     87,                   topics: ~ 63 },
  /** opposite meaning: "happy" <> "sad"             */ antonyms:         arr(nym),          // antonyms:     ~ (6_758):     relterm: 13_130,    source:  1_817,      english:    41,          tags:    ~ 82,     alt:    5,         topics:  ~ 2 },
  /** "part of":        "eye":  ["face",   "head"]   */ holonyms:         arr(nym),          // holonyms:     ~ (100):       relterm: 122 },
  /** "has part":       "eye":  ["retina", "lens"]   */ meronyms:         arr(nym),          // meronyms:     ~ (138):       relterm: 371,       alt:     2,          english:    1 },
  /** "super":          "dog":  ["mammal", "animal"] */ hypernyms:        arr(nym),          // hypernyms:    ~ (3_459):     relterm: 7_790,     source:  86,         tags:       ~ 9,         english: 11,       alt:    9,         topics:  ~ 1 },
  /** "subcategory":    "dog":  ["beagle", "poodle"] */ hyponyms:         arr(nym),          // hyponyms:     ~ (512):       relterm: 1_134,     source:  112,        tags:       ~ 10,        english: 6,        topics: ~ 1 },
  /** shares hypernym : "oak" ~ "maple" ~ "pine"     */ coordterms:       arr(nym),          // coordterms:   ~ (8_484):     relterm: 20_118,    english: 235,        tags:       ~ 24,        alt:     18,       source: 58,        topics:  ~ 2 },
  /** "manner of":      "walk": ["stroll", "waddle"] */ troponyms:        arr(nym),          // troponyms:    ~ (15):        relterm: 25 },
  /** related words                                  */ related:          arr(nym),          // related:      ~ (831):       relterm: 1_756,     tags:    ~ 1_756,    english:    2 },
  /** sense is an alternative form of                */ altof:            arr(instance),     // altof:        ~ (105_052):   relterm: 107_702,   tags:    ~ 107_702,  extra:      10_940 },
  /** sense is an inflected form of                  */ formof:           arr(instance),     // formof:       ~ (354_138):   relterm: 354_275,   tags:    ~ 354_275,  extra:      6_403 },
  /** attestations for the sense                     */ attestations:     arr(attestation),  // attestations: ~ (11_051):    date:    11_144,    refs:    ~ (90):     refn:       80,          text:    16 } },
  /** examples for the sense                         */ examples:         arr(wktExample),   // examples:     ~ (298_359):   text:    558_692,   type:    518_931,    highlights: ~ (513_688): text:    513_676, english: 326, roman: 2, literal: 1 }, ref: 452_624, tags: ~ 4_859, english: 1_313, roman: 246 },
  // /** raw tags for the sense                      */ raw_tags:         tags,              //
  // /** raw glosses for the sense                   */ raw_glosses:      arr(gloss),        //
}).partial().strict()

export const wktLemma = obj({
  /** Base form of the subject word (eg happy)       */ headword:        term,                      // headword:      ~ 1_000_000,
  /** Part-of-speech tag                             */ poskind,                                    // poskind:       ~ 1_000_000,
  /** Wiktionary language code                       */ langcode,                                   // langcode:      ~ 1_000_000,
  /** WP Title (+opt lang code prefix)               */ wikipedia:        arr(longstr),             // categories:    ~ 237_268,
  /** Categories for the topic                       */ categories,                                 // wikipedia:     ~ 42_717,
  /** Inflections (pl, tense, etc) or alt forms      */ forms:            arr(wktWordform),         // forms:         ~ (418_000):  form:      729_905,        tags:     ~ 729_904, source:    10_443,    head_nr:    247,       topics:    ~ 18 },
  /** translations                                   */ translations:     arr(translation),         // translations:  ~ (132_121):  relterm:   3_283_117,      rellang:  3_288_708, sense:     3_288_751, roman:      1_035_135, tags:      ~ 1_377_951, note:     16_212,  english: 32_388,  alt:       52_527, topics:    ~ 2_719, taxonomic: 227 },
  /** hyphenations                                   */ hyphenations:     arr(hyphenation),         // hyphenations:  ~ (17_997):   segs:      ~ 18_785,       tags:     ~ 18_785 },
  /** pronunciation & sound files                    */ sounds:           arr(soundlink),           // sounds:        ~ (168_363):  ipa:       226_107,        tags:     ~ 155_456, audurl:    128_745,   oggurl:     128_746,   mp3url:    128_746,     enpr:     19_904,  rhymes:  78_922,  homophone: 19_274, note:      10_134,  other:     1_480, text:      242,  topics:    ~ 43 },
  /** derived-from relation                          */ derived:          arr(nym),                 // derived:       ~ (81_362):   relterm:   585_204,        english:  2_021,     taxonomic: 14_158,    alt:        2_019,     sense:     1_149,       topics:   ~ 476,   tags:    ~ 3_122, urls:      ~ 24,   qualifier: 11,      roman:     30 },
  /** related words                                  */ related:          arr(nym),                 // related:       ~ (91_811):   relterm:   290_531,        source:   9_373,     tags:      ~ 8_191,   english:    5_798,     sense:     10_906,      alt:      2_842,   topics:  ~ 1_208, roman:     233,    qualifier: 567,     urls:      ~ 399, taxonomic: 148 },
  /** same meaning:     "happy" ~ "glad"             */ synonyms:         arr(nym),                 // synonyms:      ~ (46_886):   relterm:   136_271,        source:   32_757,    tags:      ~ 14_440,  english:    1_940,     sense:     30_598,      topics:   ~ 1_718, alt:     364,     taxonomic: 17,     roman:     31,      urls:      ~ 14,  qualifier: 23 },
  /** opposite meaning: "happy" <> "sad"             */ antonyms:         arr(nym),                 // antonyms:      ~ (10_228):   relterm:   18_950,         source:   4_685,     sense:     3_385,     english:    464,       alt:       23,          tags:     ~ 323,   topics:  ~ 71,    roman:     1 },
  /** "part of":        "eye":  ["face",   "head"]   */ holonyms:         arr(nym),                 // holonyms:      ~ (644):      relterm:   1_505,          source:   1_033,     sense:     76,        topics:     ~ 10,      tags:      ~ 25,        english:  12,      roman:   1,       alt:       3,      qualifier: 13 },
  /** "has part":       "eye":  ["retina", "lens"]   */ meronyms:         arr(nym),                 // meronyms:      ~ (675):      relterm:   5_101,          source:   3_091,     tags:      ~ 103,     sense:      374,       topics:    ~ 34,        english:  118,     alt:     64,      roman:     1,      taxonomic: 5 },
  /** "super":          "dog":  ["mammal", "animal"] */ hypernyms:        arr(nym),                 // hypernyms:     ~ (5_911):    relterm:   9_717,          tags:     ~ 132,     source:    2_926,     sense:      735,       english:   298,         topics:   ~ 145,   alt:     40,      roman:     1 },
  /** "subcategory":    "dog":  ["beagle", "poodle"] */ hyponyms:         arr(nym),                 // hyponyms:      ~ (5_978):    relterm:   53_860,         source:   22_738,    tags:      ~ 1_562,   taxonomic:  766,       alt:       311,         english:  815,     sense:   2_543,   topics:    ~ 489,  qualifier: 15,      urls:      ~ 1,   roman:     30 },
  /** shares hypernym : "oak" ~ "maple" ~ "pine"     */ coordterms:       arr(nym),                 // coordterms:    ~ (7_620):    relterm:   32_068,         source:   355,       tags:      ~ 552,     sense:      3_142,     english:   1_706,       alt:      503,     topics:  ~ 408,   roman:     40,     taxonomic: 26 },
  /** "manner of":      "walk": ["stroll", "waddle"] */ troponyms:        arr(nym),                 // troponyms:     ~ (12):       relterm:   37,             source:   5,         sense:     17 },
  /** abbreviations                                  */ abbreviations:    arr(abbreviation),        // abbreviations: ~ (68):       abbrev:    75,             sense:    8 },
  /** instances                                      */ instances:        arr(instance),            // instances:     ~ (99):       relterm:   2_216,          source:   2_216,     tags:      ~ 2_216 },
  /** descendant words                               */ descendants:      arr(wktDescendant),       // descendants:   ~ (13_887):   relterm:   14_480,         langcode: 14_480,    bor:       12_492,    scriptcode: 23,        qualifier: 127,         translit: 1_469,   morph:   204,     senseid:   18,     gloss:     65,      inh:       3,     calque:    401,  uncertain: 55,    poskind: 5, alt: 11, semilearned: 3, semloan: 27, gender: 113, pcalque: 17, obor: 5, learned: 4, lit: 3, label: 2,
  /** Etymology records                              */ etymology,                                  // etymology:     ~ 1_000_000: { ...etymology }
  /** Each distinct meaning of headword              */ senses:           arr(wktSense).nonempty(), // senses:        ~ 1_000_000: { ...senses }
  //
  // /** Original title                              */ origtitle:        midstr.optional(),        //
  // /** Where information was found                 */ source,                                     //
}).partial().required({ headword: true, poskind: true, langcode: true }).strict()

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
export type WktanyEtymologyRec    = TY.Zcasted<typeof  anyEtymologyRec>
export type WktetymologyRecBag    = TY.Zcasted<typeof  etymologyRecsBag>
