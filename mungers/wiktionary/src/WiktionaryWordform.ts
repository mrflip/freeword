import      _                                /**/ from 'lodash'
import      * as FW                               from '@freeword/meta'
import type * as TY                               from './types/CoreTypes.ts'
// import      * as ZZ                               from 'zod'

export class WiktionaryWordform extends FW.Wordform implements WktLemma {
  //
  //
  declare headword:            TY.Word
  declare original_title:      string
  declare poskind:             TY.Poskind
  declare langcode:            TY.Langcode
  declare categories:          string[]
  declare etymology:           { text: string, number: number, templates: WktEtymologyBag }
  declare wikipedia:           string[]
  declare source:              string
  declare senses:              TY.ArrNZ<WktSense>
  declare descendants:         WktDescendant[]
  // declare templates:           WktEtymologyTemplates
  declare forms:               WktForm[]
  declare translations:        WktTranslation[]
  declare abbreviations:       WktAbbreviation[]
  declare hyphenations:        WktHyphenation[]
  declare sounds:              WktSoundlink[]
  //
  declare instances:           WktInstance[]
  declare antonyms:            WktNym[]
  declare coordterms:          WktNym[]
  declare derived:             WktNym[]
  declare holonyms:            WktNym[]
  declare hypernyms:           WktNym[]
  declare hyponyms:            WktNym[]
  declare meronyms:            WktNym[]
  declare synonyms:            WktNym[]
  declare troponyms:           WktNym[]
  declare related:             WktNym[]
}

const { obj, arr, oneof, tuple, cases, coerce, str, bareint, anything, bool, literal, stringish, textish, urlstr } = FW.CK
const poskind = oneof(FW.Poskinds)
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
export const line1k     = stringish.max(1000)
export const line4k     = stringish.max(4000)
export const text4k     = textish.max(4000)
export const loosetag   = midstr.min(1)
export const tags       = arr(loosetag).default([])
export const depth      = bareint.min(0).max(100)
const source            = midstr

export const wktWordform = obj({
  form: term, tags, source, raw_tags: tags, head_nr: bareint.max(30).min(0),
}).partial().strict()

export const EtymologyTemplateNames = [
  'suffix', 'prefix', 'affix', 'surf', 'confix', 'compound', 'clipping',
  'derived', 'borrowed', 'inherited', 'calque', 'cognate', 'noncognate',
  'root', 'doublet', 'blend', 'pieword', 'coinage', 'namedfor', 'glossary',
] as const
export const langcode = str.regex(/^([a-z]{2,3}(-[a-zA-Z]{2,3})?(-[a-zA-Z]{2,3})?|(cmn|zh)-Latn-\w+|la-x-(neo|mid|late|med|eccl|vul))(?:, ?(?:[a-z]{2,3}))*$/)

const wikidata       = str.regex(/^[PQ]\d+$/).max(25)
const senseid        = longstr
const expansion      = line4k
const rellang        = langcode
const relterm        = line1k
const positionals    = arr(line1k)
const root           = longstr
const prefix         = midstr
const suffix         = midstr

const etympart       = obj({ relterm: line1k, langcode: langcode, senseid, gloss: line1k, poskind: longstr, gender: midstr, alt: midstr, translit: longstr, qualifier: longstr, lit: longstr,  }).partial().strict()
const parts          = arr(etympart)
const relterms       = arr(longstr)
const gloss          = line1k ; const gloss1 = gloss; const gloss2 = gloss
const wikicategory   = longstr
const categories     = arr(wikicategory).default([])
const highlights     = arr(tuple([bareint, bareint]))

const WktTemplateNames = [
  'suffix',     'confix',     'prefix',     'affix',      'surf',       'compound',   'clipping',   'derived',
  'borrowed',   'inherited',  'calque',     'partcalque', 'cognate',    'noncognate', 'root',       'doublet',    'blend',
  'pieword',    'taxlink',    'taxfmt',     'mention',    'coinage',    'namedfor',   'etymon',     'etymid',
  'qualifier',  'unknown',    'glossary',   'uncertain',  'other',      'abbrevof',   'abbrev',     'onomatopoeic',
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
  /** Alternative text             */ alt:        midstr,
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
  /** Title                        */ title:      longstr,
}).partial()
const suffixTemplate       = genericTemplate.pick({ expansion: true, root:      true,             suffix: true, parts: true,                                                                                                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('suffix')       }).passthrough()
const confixTemplate       = genericTemplate.pick({ expansion: true, prefix:    true, root: true, suffix: true, parts: true,                                                                                                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('confix')       }).passthrough()
const prefixTemplate       = genericTemplate.pick({ expansion: true, prefix:    true, root: true,               parts: true,                                                                                                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('prefix')       }).passthrough()
const affixTemplate        = genericTemplate.pick({ expansion: true, parts:     true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('affix')        }).passthrough()
const surfTemplate         = genericTemplate.pick({ expansion: true, parts:     true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('surf')         }).passthrough()
const compoundTemplate     = genericTemplate.pick({ expansion: true, parts:     true,                                                            lit: true,                                                                                   tname: true, langcode: true }).extend({ /** Template name */ tname: literal('compound')     }).passthrough()
const derivedTemplate      = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true, alt:    true, gloss:  true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true,                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('derived')      }).passthrough()
const borrowedTemplate     = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true, alt:    true, gloss:  true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('borrowed')     }).passthrough()
const inheritedTemplate    = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true, alt:    true, gloss:  true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true, senseid: true, transcript: true, tname: true, langcode: true }).extend({ /** Template name */ tname: literal('inherited')    }).passthrough()
const calqueTemplate       = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true, alt:    true, gloss:  true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true,                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('calque')       }).passthrough()
const partcalqueTemplate   = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true, alt:    true, gloss:  true, gender: true, lit: true, poskind: true, scriptcode: true, translit: true,                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('partcalque')   }).passthrough()
const cognateTemplate      = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true, alt:    true, gloss:  true,               lit: true, poskind: true,                   translit: true,                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('cognate')      }).passthrough()
const rootTemplate         = genericTemplate.pick({ expansion: true, relterms:  true, rellang:   true, alt:    true, gloss:  true,                                                                           senseid: true,                   tname: true, langcode: true }).extend({ /** Template name */ tname: literal('root')         }).passthrough()
const noncognateTemplate   = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true, alt:    true, gloss:  true,                 lit: true,                                                                                 tname: true, langcode: true }).extend({ /** Template name */ tname: literal('noncognate')   }).passthrough()
const clippingTemplate     = genericTemplate.pick({ expansion: true, relterm:   true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('clipping')     }).passthrough()
const doubletTemplate      = genericTemplate.pick({ expansion: true, relterms:  true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('doublet')      }).passthrough()
const blendTemplate        = genericTemplate.pick({ expansion: true, relterms:  true,                                                                                                                                                         tname: true,                }).extend({ /** Template name */ tname: literal('blend')        }).passthrough()
const piewordTemplate      = genericTemplate.pick({ expansion: true, relterm:   true, rellang:   true,                                                                                                                                        tname: true, langcode: true }).extend({ /** Template name */ tname: literal('pieword')      }).passthrough()
const taxlinkTemplate      = genericTemplate.pick({ expansion: true, taxon:     true, level:     true, alt:   true,                                                                                                                           tname: true, langcode: true }).extend({ /** Template name */ tname: literal('taxlink')      }).passthrough()
const taxfmtTemplate       = genericTemplate.pick({ expansion: true, taxon:     true, level:     true, alt:   true,                                                                                                                           tname: true, langcode: true }).extend({ /** Template name */ tname: literal('taxfmt')       }).passthrough()
const mentionTemplate      = genericTemplate.pick({ expansion: true, target:    true, text:      true, gloss: true,    lit: true,                                                                                                             tname: true, langcode: true }).extend({ /** Template name */ tname: literal('mention')      }).passthrough()
const glossaryTemplate     = genericTemplate.pick({ expansion: true, target:    true, text:      true,                                                                                                                                        tname: true,                }).extend({ /** Template name */ tname: literal('glossary')     }).passthrough()
const coinageTemplate      = genericTemplate.pick({ expansion: true, entity:    true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('coinage')      }).passthrough()
const namedforTemplate     = genericTemplate.pick({ expansion: true, entity:    true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('namedfor')     }).passthrough()
const etymonTemplate       = genericTemplate.pick({ expansion: true, senseid:   true, tree: true, translit: true, lit: true,                                                                                                                  tname: true, langcode: true }).extend({ /** Template name */ tname: literal('etymon')       }).passthrough()
const etymidTemplate       = genericTemplate.pick({ expansion: true, etymid:    true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('etymid')       }).passthrough()
const onomatopoeicTemplate = genericTemplate.pick({ expansion: true, title:     true,                                                                                                                                                         tname: true, langcode: true }).extend({ /** Template name */ tname: literal('onomatopoeic') }).passthrough()
const qualifierTemplate    = genericTemplate.pick({ expansion: true, qualifier: true, qualifiers: true,                                                                                                                                       tname: true, langcode: true }).extend({ /** Template name */ tname: literal('qualifier')    }).passthrough()
const abbrevofTemplate     = genericTemplate.pick({ expansion: true, entity:    true, relterm: true, alt: true, gloss: true, scriptcode: true, senseid: true, translit: true, transcript: true, addl: true, cat: true,                        tname: true, langcode: true }).extend({ /** Template name */ tname: literal('abbrevof')     }).passthrough()
const abbrevTemplate       = genericTemplate.pick({ expansion: true, entity:    true, relterm: true, alt: true, gloss: true, scriptcode: true, senseid: true, translit: true, transcript: true, addl: true, cat: true,                        tname: true, langcode: true }).extend({ /** Template name */ tname: literal('abbrev')        }).passthrough()
const unknownTemplate      = genericTemplate.pick({ expansion: true,                                                                                                                                                                          tname: true, langcode: true }).extend({ /** Template name */ tname: literal('unknown')      }).passthrough()
const uncertainTemplate    = genericTemplate.pick({ expansion: true,                                                                                                                                                                          tname: true, langcode: true }).extend({ /** Template name */ tname: literal('uncertain')    }).passthrough()
const otherTemplate        = genericTemplate.pick({ expansion: true,                                                                                                                                                                          tname: true,                }).extend({ /** Template name */ tname: literal('other')        }).passthrough()

// interface SuffixTemplate  extends TY.Bake<TY.Zcasted<typeof suffixTemplate>>  {}
// interface CompoundTemplate extends TY.Bake<TY.Zcasted<typeof compoundTemplate>> {}
// interface GenericTemplate extends TY.Bake<TY.Zcasted<typeof genericTemplate>> {}
// const yy: GenericTemplate = {} as any; const zz = yy?.rellang
// // const yy2: CompoundTemplate = {} as any; const zz2 = yy2?.parts
// const yy2: SuffixTemplate = {} as any; const zz2 = yy2?.suffix

// const suffixTemplate       = obj({ tname: literal('suffix'),        expansion,         root, suffix,  parts,                    langcode                                                                                                         }).partial().required({ tname: true  })
// const confixTemplate       = obj({ tname: literal('confix'),        expansion, prefix, root, suffix,  parts,                    langcode                                                                                                         }).partial().required({ tname: true  })
// const prefixTemplate       = obj({ tname: literal('prefix'),        expansion, prefix, root,          parts,                    langcode                                                                                                         }).partial().required({ tname: true  })
// const affixTemplate        = obj({ tname: literal('affix'),         expansion,                        parts,                    langcode                                                                                                         }).partial().required({ tname: true  })
// const surfTemplate         = obj({ tname: literal('surf'),          expansion,                        parts,                    langcode                                                                                                         }).partial().required({ tname: true  })
// const compoundTemplate     = obj({ tname: literal('compound'),      expansion,                        parts,                    langcode, alt1: line1k, gloss1: gloss, gloss2: gloss, lit: bool, poskind1, poskind2                              }).partial().required({ tname: true  })
// const derivedTemplate      = obj({ tname: literal('derived'),       expansion, rellang, relterm,  alt: longstr, gloss,          langcode                                                                                                         }).partial().required({ tname: true  })
// const clippingTemplate     = obj({ tname: literal('clipping'),      expansion,          relterm,                                langcode                                                                                                         }).partial().required({ tname: true  })
// const borrowedTemplate     = obj({ tname: literal('borrowed'),      expansion, rellang, relterm,  alt: midstr,  gloss,          langcode                                                                                                         }).partial().required({ tname: true  })
// const inheritedTemplate    = obj({ tname: literal('inherited'),     expansion, rellang, relterm,  alt: midstr,  gloss,          langcode                                                                                                         }).partial().required({ tname: true  })
// const calqueTemplate       = obj({ tname: literal('calque'),        expansion, rellang, relterm,  alt: midstr,  gloss,          langcode                                                                                                         }).partial().required({ tname: true  })
// const cognateTemplate      = obj({ tname: literal('cognate'),       expansion, rellang, relterm,  alt: midstr,  gloss,                                                                                                                           }).partial().required({ tname: true  })
// const noncognateTemplate   = obj({ tname: literal('noncognate'),    expansion, rellang, relterm,  alt: midstr,  gloss,                                                                                                                           }).partial().required({ tname: true  })
// const rootTemplate         = obj({ tname: literal('root'),          expansion, rellang, relterms, alt: midstr,  gloss,          langcode                                                                                                         }).partial().required({ tname: true  })
// const doubletTemplate      = obj({ tname: literal('doublet'),       expansion,          relterms,                                                                                                                                                }).partial().required({ tname: true  })
// const blendTemplate        = obj({ tname: literal('blend'),         expansion,          relterms,                                                                                                                                                }).partial().required({ tname: true  })
// const piewordTemplate      = obj({ tname: literal('pieword'),       expansion, rellang, relterm,                                langcode                                                                                                         }).partial().required({ tname: true  })
// const taxlinkTemplate      = obj({ tname: literal('taxlink'),       expansion, taxon:  midstr, level:  midstr,  alt: midstr,    langcode                                                                                                         }).partial().required({ tname: true  })
// const taxfmtTemplate       = obj({ tname: literal('taxfmt'),        expansion, taxon:  midstr, level:  midstr,  alt: midstr,    langcode                                                                                                         }).partial().required({ tname: true  })
// const mentionTemplate      = obj({ tname: literal('mention'),       expansion, target: midstr, text:   longstr, gloss,          langcode                                                                                                         }).partial().required({ tname: true, target: true, text: true })
// const glossaryTemplate     = obj({ tname: literal('glossary'),      expansion, target: midstr, text:   longstr                                                                                                                                   }).partial().required({ tname: true  })
// const coinageTemplate      = obj({ tname: literal('coinage'),       expansion,                         entity: midstr,          langcode                                                                                                         }).partial().required({ tname: true  })
// const namedforTemplate     = obj({ tname: literal('namedfor'),      expansion,                         entity: midstr,          langcode                                                                                                         }).partial().required({ tname: true  })
// const etymonTemplate       = obj({ tname: literal('etymon'),        expansion,                                                  langcode, senseid, tree: text4k, translit: midstr, lit: midstr, alt1: midstr, gloss1, gloss2, poskind1, poskind2 }).partial().required({ tname: true  }).strict()
// const etymidTemplate       = obj({ tname: literal('etymid'),        expansion,                         etymid: midstr,          langcode                                                                                                         }).partial().required({ tname: true  })
// const onomatopoeicTemplate = obj({ tname: literal('onomatopoeic'),  expansion,                                                  langcode                                                                                                         }).partial().required({ tname: true  })
// const qualifierTemplate    = obj({ tname: literal('qualifier'),     expansion, qualifier: midstr,      qualifiers: positionals, langcode                                                                                                         }).partial().required({ tname: true  })
// const unknownTemplate      = obj({ tname: literal('unknown'),       expansion,                                                  langcode                                                                                                         }).partial().required({ tname: true  })
// const uncertainTemplate    = obj({ tname: literal('uncertain'),     expansion,                                                  langcode                                                                                                         }).partial().required({ tname: true  })
// const otherTemplate        = obj({ tname: literal('other'),         expansion,                                                                                                                                                                   }).partial().required({ tname: true  }).passthrough()
//
const etymologyTemplate = cases('tname', [
  suffixTemplate, confixTemplate, prefixTemplate, affixTemplate, surfTemplate, compoundTemplate, clippingTemplate,
  derivedTemplate, borrowedTemplate, inheritedTemplate, calqueTemplate, cognateTemplate, noncognateTemplate,
  rootTemplate, doubletTemplate, blendTemplate, piewordTemplate, coinageTemplate, namedforTemplate,
  taxlinkTemplate, taxfmtTemplate, mentionTemplate, abbrevofTemplate, abbrevTemplate,
  glossaryTemplate, etymonTemplate, etymidTemplate, onomatopoeicTemplate, qualifierTemplate, unknownTemplate,
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
  partcalque:   arr(partcalqueTemplate),
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
  abbrev:       arr(abbrevTemplate),
  abbrevof:     arr(abbrevofTemplate),
} satisfies Record<WktTemplateName, FW.ZodTypeAny>).partial().strict()

export const etymologyBagShape = _.mapValues(etymologyBag._def.shape(), (val) => FW.CK.summarizeCheckerDef(val._def.innerType)) as Record<WktTemplateName, FW.CK.CheckerSummary>
// console.log('[[etymologyBag]]', ..._.flatten(_.entries(etymologyBagShape)))

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
  sense: line4k, english: longstr, roman: longstr, alt: midstr,
  tags, raw_tags: tags, topics: arr(midstr),
 }).partial().strict()
export const nym = obj({
  relterm: longstr, sense: longstr, english: longstr, roman: longstr, alt: midstr,
  tags, raw_tags: tags, topics: arr(midstr),
  urls: arr(anyurl), source: longstr, taxonomic: midstr, qualifier: longstr, extra: longstr,
}).partial().required({ relterm: true }).strict()
export const instance  = obj({
  relterm: line1k, source: line1k, tags, extra: longstr,
}).partial({ extra: true, source: true }).strict()
// export const derived = obj({ relterm: longstr, english: longstr, taxonomic: midstr }).partial().required({ relterm: true }) // .strict()

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
  /** Partial calque                 */ partcalque:   loosebool,
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
  headword:        term,
  poskind,
  langcode,
  categories,
  forms:            arr(wktWordform),
  etymology,
  wikipedia:        arr(longstr),
  origtitle:        midstr.optional(),
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
  instances:        arr(instance),
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

// export type WktDerived         = TY.Zcasted<typeof derived>
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
