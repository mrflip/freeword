import      _                                /**/ from 'lodash'
import      { Filer, UF, CK }                     from '@freeword/meta'
import type * as TY                               from './internal.ts'
import      * as WKT                              from '../WiktionaryWordform.ts'
import      { templateNameAliases } from './ExtractRawTables.ts'

const RAWDIR = Filer.__relname(import.meta.url, '../../raw')
const Paths = {
  full: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-full.jsonl.gz'), // 1_403_717 records
  some: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-some.jsonl'),    //    14_334 records
  most: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-most.jsonl'),    //       300 records
}

export interface WiktionaryRaw extends Omit<WKT.WiktionaryWordform, 'translations' | 'hyphenations' | 'abbreviations'> {
  lang:                 string
  lang_code:            string
  rawpos:               string
  etymology_number:     number
  etymology_text:       string
  etymology_templates:  Record<string, any>
  coordinate_terms:     RawNym[]
  translations:         RawTranslation[]
  hyphenations:         RawHyphenation[]
  abbreviations:        RawAbbreviation[]
}
export interface RawSense extends Omit<WKT.WktSense, 'links' | 'altof' | 'formof'> {
  links: TY.Optionalize<{ 0: string, 1: string }>[]
  info_templates: Record<string, any>[]
  coordinate_terms: WKT.WktNym[]
  alt_of: RawRelated[]; form_of: RawRelated[];
}
interface RawRelated     extends Omit<WKT.WktRelated,     'relterm'> { word?: string }
interface RawDescendant  extends Omit<WKT.WktDescendant,  'tree'>    { templates: Record<string, TY.AnyBag>[] }
interface RawHyphenation extends WKT.WktHyphenation {}
interface RawAbbreviation extends Omit<WKT.WktAbbreviation, 'abbrev'> { word: string }
interface RawSoundlink   extends Omit<WKT.WktSoundlink, 'audurl' | 'oggurl' | 'mp3url'> { audio: string, ogg_url: string, mp3_url: string }

/** Adapt wiktionary part of speech labels to our poskinds */
const WktPoskindFixes: Record<string, TY.Poskind> = {
  adv_phrase: 'advph', prep_phrase: 'prepph', contraction: 'cont', article: 'art', character: 'char',
}
/** corrects informal langcodes */
const LangcodeFixes = {
  'ML.': 'la-x-mid', 'NL.': 'la-x-neo', 'LL.': 'la-x-late', 'EL.': 'la-x-med', 'VL.': 'la-x-vul', 'CL.': 'la-x-eccl',
  'cmn-wadegiles': 'cmn-Latn-wadegiles', 'cmn-pinyin': 'cmn-Latn-pinyin', 'zh-postal': 'zh-Latn-pinyin',
  'cmn-tongyong': 'cmn-Latn-tongyong',
}
function lutFixer<VT>(lut: Record<string, VT>, val: VT): NonNullable<VT> {
  return (lut[val as keyof typeof lut] ?? val) as NonNullable<VT>
}

export async function *loadRawWiktionary(size: 'full' | 'some' | 'most') {
  const wiktpath = Paths[size]; if (! wiktpath.ok) { throw wiktpath.err }
  // const tcounts = [] as Record<string, number>[]
  for await (const raw of Filer.starjsonl<Omit<WiktionaryRaw, 'langcode'>>(wiktpath)) {
    const {
      word:rawWord, pos:posRaw, lang_code:langcode, lang:_lang,
      etymology_templates, etymology_number, etymology_text,
      senses,
      hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordinate_terms:coordterms, derived, related,
      translations, hyphenations, sounds, abbreviations,
      descendants, instances,
      head_templates:_h,
      // ...wiktionaryRaw
    } = raw
    const headword = scrubString(rawWord, raw)!
    const poskind = lutFixer(WktPoskindFixes, posRaw) as TY.Poskind
    const rawNyms = { hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordterms, derived, related }
    const nyms = UF.scrubVoid(_.mapValues(rawNyms, (raws) => _.compact(_.map(raws, (rawNym) => extractNym(rawNym as RawNym, headword)))))
    const etymologyArr = _.compact(_.map(etymology_templates, (rawTemplate) => extractTemplate(rawTemplate, headword)))
    const etymologies  = _.groupBy(etymologyArr, 'tname')
    const wordform: WKT.WktLemma = UF.scrubVoid({
      headword, poskind, langcode,
      abbreviations:      _.compact(_.map(abbreviations, (rawAbbreviation) => extractAbbreviation(rawAbbreviation as RawAbbreviation, headword))),
      senses:    UF.arrNZ(_.compact(_.map(senses,        (rawSense)        => extractSense(rawSense               as RawSense,        headword)))),
      hyphenations:       _.compact(_.map(hyphenations,  (rawHyphenation)  => extractHyphenation(rawHyphenation,                      headword))),
      translations:       _.compact(_.map(translations,  (rawTranslation)  => extractTranslation(rawTranslation,                      headword))),
      sounds:             _.compact(_.map(sounds,        (rawSound)        => extractSound(rawSound               as RawSoundlink,    headword))),
      descendants:        _.compact(_.map(descendants,   (rawDescendant)   => extractDescendant(rawDescendant     as RawDescendant,   headword))),
      instances:          _.compact(_.map(instances,     (rawInstance)     => extractRelated(rawInstance          as RawRelated,      headword))),
      ...nyms,
    })
    if (etymology_text || _.isFinite(etymology_number) || (! _.isEmpty(etymology_templates))) {
      wordform.etymology = UF.scrubNil({ text: scrubText(etymology_text, headword), number: etymology_number, templates: etymologies })
    }
    // bump(wordform, 'wordform', 'poskind')
    const report = WKT.wktLemma.report(wordform)
    if (! report.ok) { console.warn('Wordform is not valid', headword, report); yield wordform; continue }
    yield WKT.wktLemma.cast(wordform)
  }
  // console.log(tcounts)
}

function extractHyphenation(raw: RawHyphenation, headword: TY.Word): WKT.WktHyphenation | undefined {
  const tmi = { ...raw, headword }
  const { parts:_p, tags, ...rest } = raw
  bumpUnknownKeys(rest, 'hyphenation')
  if (_.isEmpty(raw.parts)) { console.warn('Hyphenation without parts', tmi); return undefined }
  return UF.scrubVoid({ parts: scrubStrings(raw.parts, tmi)!, tags: scrubStrings(tags, tmi) })
}
function extractAbbreviation(raw: RawAbbreviation, headword: TY.Word): WKT.WktAbbreviation | undefined {
  const { word:rawAbbrev, sense:rawSense, ...rest } = raw
  bumpUnknownKeys(rest, 'abbreviation')
  return UF.scrubVoid({ abbrev: scrubString(rawAbbrev, headword)!, sense: scrubString(rawSense, headword)! })
}
function extractRelated(raw: RawRelated, headword: TY.Word): WKT.WktRelated | undefined {
  const { word:rawWord, tags, source, extra, ...rest } = raw
  bumpUnknownKeys(rest, 'instances')
  return UF.scrubVoid({
    relterm: scrubString(rawWord, headword)!, tags: scrubStrings(tags, headword), source: scrubString(source, headword), extra: scrubString(extra, headword),
  })
}

const TemplateFieldnameFixes: Record<string, string> = {
  t:           'gloss',    g:       'gender',     pos:      'poskind',     id:          'senseid',     sc:          'scriptcode',
  tr:          'translit', ts:      'transcript', lit:      'lit',         lb:          'label',       qq:          'qualifier',   qu:   'qualifier',
  bor:         'bor',      lbor:    'learned',    slb:      'semilearned', otherforms:  'otherforms',  tree:        'tree',
  cal:         'calque',   clq:     'calque',     calq:     'calque',      pclq:        'partcalque',  publisher:   'publisher',
  sml:         'semloan',  der:     'morph',      unc:      'uncertain',   lang:        'langcode',   w: 'wplink',
  alt:         'alt',      author:  'author',     born:     'born',        brackets:    'brackets',
  date:        'date',     died:    'died',       flavor:   'flavor',      head:        'head',
  in:          'in',       isbn:    'isbn',       location: 'location',    nat:         'nat',
  nationality: 'nat',      nobycat: 'nobycat',    occ:      'occ',         occupation:  'occ',
  passage:     'passage',  short:   'short',      sort:     'sort',        title:       'title',
  type:        'type',     uc:      'uc',         wplink:   'wplink',      year:        'year',
  nolb:        'skip',     sclb:    'skip',       alts:     'skip',
  nocap:       'skip',     notext:  'skip',       nocat:    'skip',
}
const TemplateFieldnameTargets = _.invert(TemplateFieldnameFixes)
const PositionalFieldnameRE = /^(\d+)$/
const NumberedFieldnameRE = /^(\w+)(\d+)$/
/** make fieldnames consistent: maps eg tr1 → translit1 or w -> wikipedia */
function fixTemplateFieldnames(bag: TY.AnyBag, _tmi: any) {
  const result = {} as TY.AnyBag
  for (const [rawkey, value] of Object.entries(bag)) {
    const mm = NumberedFieldnameRE.exec(rawkey)
    if (mm) {
      const [_x, ante, seq] = mm
      const key = lutFixer(TemplateFieldnameFixes, ante); if (key === 'skip') { continue }
      result[key + seq] = value; continue
    }
    const key = lutFixer(TemplateFieldnameFixes, rawkey); if (key === 'skip') { continue }
    result[key] = value
  }
  return result
}
function remapTemplateFields(raw: TY.AnyBag, tmi: any, { mainkey = 'relterm', offset = 1 }: { mainkey?: string, offset?: number } = {}): TY.AnyBag {
  const parts = [] as TY.AnyBag[]
  const all   = {} as TY.AnyBag
  for (const [rawkey, value] of Object.entries(raw)) {
    if ((rawkey === '1') && (offset === 1)) { all.langcode = value; continue }
    if (PositionalFieldnameRE.test(rawkey)) {
      const seq = Number(rawkey) - offset - 1; parts[seq] ||= {}; parts[seq][mainkey] = value; continue
    }
    const mm = NumberedFieldnameRE.exec(rawkey)
    if (mm) {
      const key = lutFixer(TemplateFieldnameFixes, mm[1])
      if (key === 'skip') { continue }
      if (! TemplateFieldnameFixes[mm[1]!]) { console.warn(`Unknown template fieldname`, mm[1], key, tmi); continue }
      const seq = Number(mm[2]) - offset - 1; parts[seq] ||= {}
      parts[seq][key] = value
      continue
    }
    if (! (TemplateFieldnameFixes[rawkey] || TemplateFieldnameTargets[rawkey])) { console.warn(`Unknown template fieldname`, rawkey, tmi); continue }
    const key = lutFixer(TemplateFieldnameFixes, rawkey)
    if (key === 'skip') { continue }
    all[key] = value
  }
  _.each(parts, (part, seq) => { if (! part) { console.warn(`[[remapTemplateFields]] gap in part ${seq}`, parts, seq, tmi); parts[seq] = {} } })
  _.each(all, (value, key) => {
    for (const part of parts) { part[key] ||= value }
  })
  _.each(parts, (part, seq) => { if (part.langcode) { part.langcode = scrubLangcode(part.langcode, tmi) } })
  return _.filter(parts, (part) => (part[mainkey]))
}

function extractDesctree(raw: TY.AnyBag, headword: TY.Word): WKT.WktDesctree | undefined {
  // bump(raw, 'descendants-template', 'name')
  if (! /^(desc|desctree)$/.test(raw.name)) { return undefined }
  const { name, expansion, args, ...rest } = raw; bumpUnknownKeys(rest, 'descendant')
  const rawparts = remapTemplateFields(args, raw, { mainkey: 'relterm', offset: 1 }) as WKT.WktDescterm[]
  const partsReports = _.reject(_.map(rawparts, (part) => WKT.descterm.report(part)), 'ok')
  if (! _.isEmpty(partsReports)) {
    console.warn('[[extractDesctree]]', headword, name, expansion, args, rest, ...(rawparts || []), ...(partsReports || []));
    return { expansion, parts: rawparts }
  }
  const parts = _.map(rawparts, (part) => WKT.descterm.cast(part))
  return { expansion, parts }
}
function extractDescendant(raw: RawDescendant, headword: TY.Word): WKT.WktDescendant | undefined {
  const { text, depth, templates, ...rest } = raw
  bumpUnknownKeys(rest, 'descendants')
  const desctrees = _.compact(_.map(templates, (template) => extractDesctree(template, headword)))
  // if (raw.templates.length >= 1) { console.log('[[extractDescendant]]', headword, text, depth, rest, '\n', ...(raw.templates || []), '\n', ...(desctrees || [])) }
  const result: WKT.WktDescendant = UF.scrubVoid({ text: scrubString(text, headword)!, depth, desctrees })
  return result
}
// function extractDerived(raw: RawDerived, headword: TY.Word): WKT.WktDerived | undefined {
//   const { word:rawWord, taxonomic, english, ...rest } = raw
//   bumpUnknownKeys(rest, 'derived')
//   return UF.scrubVoid({
//     relterm: scrubString(rawWord, headword)!, taxonomic: scrubString(taxonomic, headword), english: scrubString(english, headword),
//   })
// }
function extractSound(raw: RawSoundlink, headword: TY.Word): WKT.WktSoundlink | undefined {
  const { ipa, rhymes, homophone, note, other, enpr, text, audio:audurl, ogg_url:oggurl, mp3_url:mp3url, tags, topics, ...rest } = raw
  bumpUnknownKeys(rest, 'soundlink')
  const stringFields = _.mapValues({ ipa, rhymes, homophone, enpr, note, other, text }, (str) => scrubString(str, headword))
  const urlFields    = _.mapValues({ audurl, oggurl, mp3url }, (url) => scrubSimpleURL(url, headword))
  return {
    ...stringFields, ...urlFields, tags: scrubStrings(tags, headword), topics: scrubStrings(topics, headword),
  }
}
function scrubSimpleURL(raw: TY.StringMaybe, tmi: any): string | undefined {
  return scrubString(raw, tmi)
}

interface RawTranslation extends Omit<WKT.WktTranslation, 'relterm' | 'rellang'> {
  word: string
  code: TY.Langcode
  lang: string
}
function extractTranslation(raw: RawTranslation, headword: TY.Word): WKT.WktTranslation | undefined {
  const tmi = { ...raw, word: headword }
  const {
    word:_w, code:_c, lang:_l, tags, raw_tags, topics,
    sense, roman, english, alt, note, taxonomic,
    ...rest
  } = raw
  const stringFields = _.mapValues({ sense, roman, english, note, alt, taxonomic }, (str) => scrubString(str, tmi))
  bumpUnknownKeys(rest, 'translation')
  const result: WKT.WktTranslation = UF.scrubVoid({
    relterm:     scrubString(raw.word,  tmi),
    rellang:     scrubString(raw.code,  tmi),
    tags:        scrubStrings(tags,     tmi),
    raw_tags:    scrubStrings(raw_tags, tmi),
    topics:      scrubStrings(topics,   tmi),
    ...stringFields,
  })
  if (! (result.relterm || result.note)) { console.warn('Translation without relterm or note', tmi, result) }
  return result
}

function extractSense(rawSense: RawSense, headword: TY.Word): WKT.WktSense {
  const {
    links:rawLinks, examples:rawExamples, glosses:rawGlosses,
    hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordinate_terms:coordterms, related,
    info_templates:_xinfo_t, alt_of:rawAltOf, form_of:rawFormOf,
    ...rest
  } = rawSense
  bumpUnknownKeys(rest, 'sense')
  const nyms = extractNyms({ hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordterms, related }, headword)
  const examples = _.compact(_.map(rawExamples, (rawExample) => extractExample(rawExample, headword)))
  _.each(examples, (example) => { if (! example.text) { console.warn('example without text', headword, example) } })
  const links   = _.map(rawLinks, ({ 1:target, 0:text = target }) => ({ target, text }))
  const glosses = _.compact(_.map(rawGlosses, (rawGloss) => scrubString(rawGloss, headword)))
  const altof   = _.compact(_.map(rawAltOf,   (raw) => extractRelated(raw as RawRelated, headword)))
  const formof  = _.compact(_.map(rawFormOf,  (raw) => extractRelated(raw as RawRelated, headword)))
  //
  const sense = { glosses, ...rest, links, ...nyms, altof, formof, examples }
  const report = WKT.wktSense.report(sense); if (! report.ok) { console.warn('Sense is not valid', headword, sense, report) }
  //
  return sense
}

type RawExample = WKT.WktExample & { bold_text_offsets: [number, number][], bold_english_offsets: [number, number][], bold_roman_offsets: [number, number][], literal_meaning: string }
function extractExample(raw: RawExample, headword: TY.Word): WKT.WktExample | undefined {
  const { text:rawText, type:rawType, ref:rawRef, bold_text_offsets, bold_english_offsets, bold_roman_offsets, literal_meaning,...rest } = raw
  const ref     = scrubString(rawRef,      headword)
  const english = scrubString(raw.english, headword)
  const roman   = scrubString(raw.roman,   headword)
  const text    = scrubText(rawText || english || ref, headword)
  if (! text) { return undefined }
  const highlights: WKT.WktExample['highlights'] = {}
  if (bold_text_offsets)    { highlights.text    = bold_text_offsets }
  if (bold_english_offsets) { highlights.english = bold_english_offsets }
  if (bold_roman_offsets)   { highlights.roman   = bold_roman_offsets }
  const type = ((rawType as any) === 'quote' ? 'quotation' : rawType)
  const result = UF.scrubVoid({ text, ref, ...rest, english, roman, highlights, type })
  // bump(result, 'example', 'type')
  if (literal_meaning) { bump(result, 'example', 'literal_meaning') }
  return result
}
function extractNyms<VT extends Record<string, WKT.WktNym[] | undefined>>(rawNyms: VT, headword: TY.Word): VT {
  return UF.scrubVoid(_.mapValues(rawNyms, (rawNyms) => _.compact(_.map(rawNyms, (rawNym) => extractNym(rawNym as RawNym, headword))))) as VT
}
interface RawNym extends Omit<WKT.WktNym, 'relterm'> { word?: string }
function extractNym(rawNym: RawNym, tmi: any): WKT.WktNym | undefined {
  const {
    word:rawWord, sense, english, roman, alt, source,
    tags, raw_tags, topics, urls:rawUrls, taxonomic, qualifier, extra,
    ...rest
  } = rawNym
  bumpUnknownKeys(rest, 'nym')
  const relterm = scrubString(rawWord, tmi)?.slice(0, 120)
  if (! relterm) { console.warn('Nym without relterm', rawNym, tmi, relterm, rawWord); return undefined }
  const stringFields = _.mapValues({ sense, english, roman, alt, source, extra, taxonomic, qualifier }, (str) => scrubString(str, tmi))
  const stringArrays = _.mapValues({ tags, raw_tags, topics },                                          (strs) => scrubStrings(strs, tmi))
  const urls         = _.compact(_.map(rawUrls, (url) => scrubSimpleURL(url, tmi)))
  return {
    relterm, ...stringFields, ...stringArrays, urls,
  }
}

function scrubLangcode(raw: string, tmi: any): string {
  const str      = lutFixer(LangcodeFixes, scrubString(raw, tmi))!
  const report   = WKT.langcode.report(str, tmi)
  if (str && (! report.ok)) { console.warn('Unknown language code', tmi, str, report) }
  return str
}
function extractTemplate(rawTemplate: Record<string, any>, tmiIn: any): Record<string, any> | undefined {
  const tmi = { ...tmiIn, ...rawTemplate }
  const result = _.omitBy(_extractTemplate(rawTemplate, tmi), _.isUndefined)
  if (! result?.tname)  { return undefined }
  const { gloss, relterm, rellang, langcode, ...rest } = result
  if (result.gloss)     { result.gloss     = scrubString(result.gloss,      tmi) }
  if (result.relterm)   { result.relterm   = scrubString(result.relterm,    tmi) }
  if (result.rellang)   { result.rellang   = scrubLangcode(result.rellang,  tmi) }
  if (result.langcode)  { result.langcode  = scrubLangcode(result.langcode, tmi) }
  return result
}

const DERIVED_RE = /^(derived|borrowed|inherited|calque)$/
function _extractTemplate(rawTemplate: Record<string, any>, word: TY.Word): Record<string, any> | undefined {
  const { name:_n, expansion:rawExpansion, args: { 1:langcode, 1:p1, 2:p2, 3:p3, 4:p4, 5:p5, 6:p6, 7:p7, 8:p8, 9:p9, 10:p10, 11:p11, 12:p12, 13:p13, 14:p14, 15:p15, 16:p16, 17:p17, 18:p18, 19:p19, 20:p20, t, ...rawargs } } = rawTemplate
  const args = fixTemplateFieldnames(rawargs, rawTemplate)
  const expansion = scrubString(rawExpansion, word)
  const { alt, gloss } = rawTemplate
  const origlang = 'en'
  const positionals = _.reject([p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20].map((str) => scrubString(str, word)), _.isUndefined)
  const tname = templateNameAliases[rawTemplate.name] ?? rawTemplate.name
  // if (/^(\+(?:suf|confix|af|pre|com\+?|con|univ))$/.test(lng)) { return undefined }
  //
  if (rawTemplate.name === 'uder') { args.flavor = 'undefined derivation' }
  if (rawTemplate.name === 'ubor') { args.flavor = 'unadapted borrowing' }
  if (rawTemplate.name === 'lbor') { args.flavor = 'learned borrowing' }
  const otherwise = { tname, expansion, ...rawTemplate.args, ...args } as Record<string, any>
  const p3on = positionals.slice(1)
  _.each(args, (_val, key) => { if (TemplateFieldnameTargets[key.replace(/(\d+)$/, '')]) { return }; bump(args, 'etemp-arg', key, 'arg') })
  // _.each(args, (_val, key) => { bump(args, 'etemp-' + tname + '-arg', key, 'arg') })
  //
  if (/\+/.test(langcode) && (tname === 'surf')) { return { tname, expansion,               relterm: p3,    parts: p3on,                             langcode: p2,       ...args } }
  if (DERIVED_RE.test(tname))                    { return { tname, expansion, rellang: p2,  relterm: p3,    alt: alt ?? p4, gloss: gloss ?? t ?? p5, langcode,           ...args } }
  if (tname === 'cognate')                       { return { tname, expansion, rellang: p1,  relterm: p2,    alt: alt ?? p3, gloss: gloss ?? t ?? p4, langcode: origlang, ...args } }
  if (tname === 'noncognate')                    { return { tname, expansion, rellang: p1,  relterm: p2,    alt: alt ?? p3, gloss: gloss ?? t ?? p4, langcode: origlang, ...args } }
  if (tname === 'root')                          { return { tname, expansion, rellang: p2,  relterms: p3on, alt: alt ?? p4, gloss: gloss ?? t ?? p5, langcode,           ...args } }
  if (/^(affix|surf)$/.test(tname))              { return { tname, expansion,                                      parts: positionals,               langcode,           ...args } }
  if (tname === 'suffix')                        { return { tname, expansion,             root:   p2, suffix: p3,  parts: positionals,               langcode,           ...args } }
  if (tname === 'prefix')                        { return { tname, expansion, prefix: p2, root:   p3,              parts: positionals,               langcode,           ...args } }
  if (tname === 'confix')                        { return { tname, expansion, prefix: p2, root:   p3, suffix: p4,  parts: positionals,               langcode,           ...args } }
  if (tname === 'compound')                      { return { tname, expansion,                                      parts: positionals,               langcode,           ...args } }
  if (tname === 'clipping')                      { return { tname, expansion,                                      relterm: p2,                      langcode,           ...args } }
  if (tname === 'doublet')                       { return { tname, expansion,                     relterms: positionals,                             langcode,           ...args } }
  if (tname === 'blend')                         { return { tname, expansion,                     relterms: positionals,                             langcode,           ...args } }
  if (tname === 'pieword')                       { return { tname, expansion, rellang: 'ine-pro', relterm: p2,                                       langcode,           ...args } }
  if (tname === 'coinage')                       { return { tname, expansion,                entity:   p2,                                           langcode,           ...args } }
  if (tname === 'namedfor')                      { return { tname, expansion,                entity:   p2,                                           langcode,           ...args } }
  if (tname === 'mention')                       { return { tname, expansion, target:    p2, text:     p3, gloss:  rawTemplate.gloss ?? t ?? p4,     langcode,           ...args } }
  if (tname === 'etymon')                        { return { tname, expansion,                                                                        langcode,           ...args } }
  if (tname === 'etymid')                        { return { tname, expansion,                etymid:   p2,                                           langcode,           ...args } }
  if (tname === 'onomatopoeic')                  { return { tname, expansion,                                                                        langcode,           ...args } }
  if (tname === 'qualifier')                     { return { tname, expansion,            p1, qualifier: p2, qualifiers: positionals,                                     ...args } }
  if (/^(taxlink|taxfmt)$/.test(tname))          { return { tname, expansion, taxon:     p1, level:    p2, alt:      p3,                                                 ...args } }
  if (tname === 'glossary')                      { return { tname, expansion, target:    p1, text:     p2,                                                               ...args } }
  if (tname === 'unknown')                       { return { tname, expansion,                                                                                            ...args } }
  if (tname === 'uncertain')                     { return { tname, expansion,                                                                                            ...args } }
  return { ...otherwise, tname: 'other' }
}

export const Bucket = { counts: {} } as TY.Bag<TY.Bag<number>>
function bump(obj: TY.AnyBag, bucket: string, key: string, overval: TY.StringMaybe = null) {
  const val = overval ?? obj[key]
  if (val !== undefined) {
    const tag = `${bucket}:${key}`
    Bucket.counts![tag] ||= 0
    Bucket.counts![tag]++
    Bucket[tag] ||= {}
    Bucket[tag][val] ||= 0
    Bucket[tag][val]++
  }
}

function bumpUnknownKeys(obj: TY.AnyBag, bucket: string) {
  _.each(obj, (_v, key) => {
    const ekey = bucket + '-extra';
    Bucket[ekey] ||= {}; Bucket[ekey][key] ||= 0; Bucket[ekey][key]++
  })
}

function scrubString(raw: TY.StringMaybe, tmi: any): string | undefined {
  return scrubText(raw, tmi)?.replaceAll(/[\t\n]+/g, ' ')
}
function scrubStrings(raw: TY.StringMaybe[] | undefined, tmi: any): string[] | undefined {
  if (! raw) { return raw }
  return _.compact(_.map(raw, (str) => scrubString(str, tmi)))
}
function scrubText(raw: TY.StringMaybe, tmi: any): string | undefined {
  if (! raw) { return raw ?? undefined }
  // const result = raw.replaceAll(/[\p{Cc}\x90-\x9F]+/gu, ' ')
  const result = raw.replaceAll(/[\p{Cc}]+/gu, ' ')
  const rpt = CK.textish.report(result)
  if (! rpt.ok) { console.warn('Text is not textish', tmi, rpt, JSON.stringify(raw)) }
  return result.trim()
}