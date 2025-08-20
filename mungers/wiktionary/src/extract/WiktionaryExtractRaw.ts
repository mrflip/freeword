import      _                                /**/ from 'lodash'
import      { Filer, UF, CK }                     from '@freeword/meta'
import type * as TY                               from './internal.ts'
import      * as WKT                              from '../WiktionaryWordform.ts'
import      { templateNameAliases, WktPoskindMap } from './ExtractRawTables.ts'
import type { ParseParams } from 'zod'

const RAWDIR = Filer.__relname(import.meta.url, '../../raw')
const Paths = {
  full: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-full.jsonl.gz'), // 1_403_717 records
  some: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-some.jsonl'),    //    14_334 records
  most: Filer.pathinfoFor(RAWDIR, 'wiktionary_en_en-most.jsonl'),    //       300 records
}

export interface WiktionaryRaw extends Omit<WKT.WiktionaryWordform, 'translations' | 'hyphenations' | 'abbreviations' | 'origtitle' | 'senses'> {
  senses:               RawSense[]
  lang:                 string
  lang_code:            string
  rawpos:               string
  coordinate_terms:     RawNym[]
  translations:         RawTranslation[]
  hyphenations:         RawHyphenation[]
  abbreviations:        RawAbbreviation[]
  etymology_number:     number
  etymology_text:       string
  etymology_templates:  Record<string, any>
  head_templates:       Record<string, any>[]
  original_title:       string
}
export interface RawSense extends Omit<WKT.WktSense, 'links' | 'altof' | 'formof' | 'attestations' | 'examples'> {
  examples:             RawExample[]
  links:                RawLink[]
  coordinate_terms:     RawNym[]
  alt_of:               RawInstance[] // alt_of: RawRelated[]
  form_of:              RawInstance[] // form_of: RawRelated[]
  info_templates:       Record<string, any>[]
  attestations:         RawAttestation[]
}
interface RawInstance     extends Omit<WKT.WktInstance,     'relterm'>         { word?: string }
interface RawDescendant   extends Omit<WKT.WktDescendant,   'tree'>            { templates: Record<string, TY.AnyBag>[] }
interface RawAbbreviation extends Omit<WKT.WktAbbreviation, 'abbrev'>          { word: string }
interface RawNym          extends Omit<WKT.WktNym,          'relterm'>         { word?: string }
interface RawAttestation  extends Omit<WKT.WktAttestation,  'refs' >           { references: WKT.WktAttestation["refs"] }
interface RawHyphenation  extends Omit<WKT.WktHyphenation,  'segs'>            { parts: string[] }
interface RawForm         extends WKT.WktForm                                  {}
interface RawLink         extends Omit<WKT.WktLink,         'target' | 'text'> { 0: string, 1: string }
interface RawSoundlink    extends Omit<WKT.WktSoundlink,    'audurl' | 'oggurl' | 'mp3url'> { audio: string, ogg_url: string, mp3_url: string }
type RawExample = WKT.WktExample & { bold_text_offsets: [number, number][], bold_english_offsets: [number, number][], bold_roman_offsets: [number, number][], literal_meaning: string, bold_literal_offsets: [number, number][] }

/** corrects informal langcodes */
const LangcodeFixes = {
  'ML.': 'la-x-mid', 'NL.': 'la-x-neo', 'LL.': 'la-x-late', 'EL.': 'la-x-med', 'VL.': 'la-x-vul', 'CL.': 'la-x-eccl',
  'cmn-wadegiles': 'cmn-Latn-wadegiles', 'cmn-pinyin': 'cmn-Latn-pinyin', 'zh-postal': 'zh-Latn-pinyin',
  'zh-hans': 'zh-Latn-hans',
  'cmn-tongyong':  'cmn-Latn-tongyong', 'pmo.': 'pmo', 'mo.': 'mo',
}
const TemplateFieldnameFixes: Record<string, string> = {
  gloss:       'gloss',    t:       'gloss',      g:       'gender',     pos:      'poskind',
  id:          'senseid',  sc:      'scriptcode',
  tr:          'translit', ts:      'transcript', lit:      'lit',         lb:          'label',       qq:          'qualifier',   q:    'qualifier',
  bor:         'bor',      lbor:    'learned',    slb:      'semilearned', otherforms:  'otherforms',  tree:        'tree',
  cal:         'calque',   clq:     'calque',     calq:     'calque',      calque:      'calque',
  pclq:        'partcalque',  pcalq:       'partcalque',  pcal:        'partcalque',
  publisher:   'publisher',
  sml:         'semloan',  der:     'morph',      unc:      'uncertain',   lang:        'langcode',   w: 'wplink',
  alt:         'alt',      author:  'author',     born:     'born',        brackets:    'brackets',
  date:        'date',     died:    'died',       flavor:   'flavor',      head:        'head',
  in:          'in',       isbn:    'isbn',       location: 'location',    nat:         'nat',
  nationality: 'nat',      nobycat: 'nobycat',    occ:      'occ',         occupation:  'occ',
  passage:     'passage',  short:   'short',      sort:     'sort',        title:       'title',     taxfmt: 'taxfmt',
  type:        'type',     uc:      'uc',         wplink:   'wplink',      year:        'year',      sl:    'sl',   wp: 'wp',
  nolb:        'skip',     sclb:    'skip',       alts:     'skip',        noalts:      'skip',      nobox: 'skip', noderived: 'noderived',
  nocap:       'skip',     notext:  'skip',       nocat:    'skip',        sourceconj:  'skip',      text: 'text',
  inh:         'inh',      exnihilo: 'exnihilo',  group:    'group',       name:         'name',      ref:  'ref',
  obor:        'obor',     by:       'by',        nomul:     'skip',       nodot:        'skip',
}
const partsFieldnames = [
  'alt', 'gloss', 'poskind', 'senseid', 'gender', 'langcode', 'translit', 'qualifier', 'lit',
]
const TemplateFieldnameTargets = _.invert(TemplateFieldnameFixes)
function lutFixer<VT>(lut: Record<string, VT>, val: VT): NonNullable<VT> {
  return (lut[val as keyof typeof lut] ?? val) as NonNullable<VT>
}

export async function *loadRawWiktionary(size: 'full' | 'some' | 'most', startCount: number = 0, maxRecords: number = 1e10) {
  const wiktpath = Paths[size]; if (! wiktpath.ok) { throw wiktpath.err }
  let count = 0
  for await (const raw of Filer.starjsonl<Omit<WiktionaryRaw, 'langcode'>>(wiktpath)) {
    count += 1
    if (count <  startCount)                { continue }
    if (count >= (maxRecords + startCount)) { break }
    const {
      word:rawWord, original_title:origtitle, pos:posRaw, lang_code:langcode, lang:_lang, senses, categories, forms, wikipedia,
      etymology_templates, etymology_number, etymology_text,
      hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordinate_terms:coordterms, derived, related,
      translations, hyphenations, sounds, abbreviations, descendants, instances, head_templates:_maintemplates, ...rest
    } = raw
    bumpCount('lemma')
    bumpUnknownKeys(rest, 'main_wordform')
    const headword     = scrubString(rawWord, raw)!
    const poskind      = lutFixer(WktPoskindMap, posRaw) as TY.Poskind
    const nyms         = extractNyms({ hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordterms, derived, related }, headword)
    const etymologyArr = _.compact(_.map(etymology_templates, (rawTemplate) => extractTemplate(rawTemplate, { headword })))
    const etymologies  = _.groupBy(etymologyArr, 'tname')
    const lemma: WKT.WktLemma = UF.scrubVoid({
      headword, poskind, langcode,
      wikipedia:          scrubStrings(wikipedia, { headword }),
      abbreviations:      _.compact(_.map(abbreviations, (rawAbbreviation) => extractAbbreviation(rawAbbreviation as RawAbbreviation, headword))),
      senses:    UF.arrNZ(_.compact(_.map(senses,        (rawSense)        => extractSense(rawSense               as RawSense,        headword)))),
      hyphenations:       _.compact(_.map(hyphenations,  (rawHyphenation)  => extractHyphenation(rawHyphenation,                      headword))),
      translations:       _.compact(_.map(translations,  (rawTranslation)  => extractTranslation(rawTranslation,                      headword))),
      sounds:             _.compact(_.map(sounds,        (rawSound)        => extractSound(rawSound               as RawSoundlink,    headword))),
      descendants:        _.compact(_.map(descendants,   (rawDescendant)   => extractDescendant(rawDescendant     as RawDescendant,   headword))),
      instances:          _.compact(_.map(instances,     (rawInstance)     => extractInstance(rawInstance         as RawInstance,     headword))),
      forms:              _.compact(_.map(forms,         (rawForm)         => extractForm(rawForm                 as RawForm,         headword))),
      categories:         scrubStrings(categories, { headword }),
      ...nyms,
    })
    if (! _.isEmpty(_maintemplates)) { _.each(_maintemplates, (template) => bumpUnknownKeys(template, 'head_templates')) }
    if (etymology_text || _.isFinite(etymology_number) || (! _.isEmpty(etymology_templates))) {
      lemma.etymology = UF.scrubNil({ text: scrubText(etymology_text, { headword }), number: etymology_number, templates: etymologies })
    }
    // bump(wordform, 'wordform', 'poskind')
    const report = WKT.wktLemma.report(lemma)
    if (! report.ok) {
      console.log('Wordform is not valid', headword, report.messages, report.badprops)
      _.each(_.keys(report.badprops), (key) => _.unset(lemma, key))
      const report2 = WKT.wktLemma.report(lemma); if (! report2.ok) { console.warn('Lemma is still not valid', headword, report2); continue }
    }
    yield WKT.wktLemma.cast(lemma)
  }
  console.info('[[loadRawWiktionary]] loaded', count, 'records')
}

function extractForm(raw: RawForm, headword: TY.Word): WKT.WktForm | undefined {
  const { form, source, head_nr, tags, raw_tags, ...rest } = raw
  bumpUnknownKeys(rest, 'form')
  const stringFields = _.mapValues({ form, source }, (str, fn) => scrubString(str, { headword, fn }))
  const stringArrays = _.mapValues({ tags, raw_tags }, (strs, fn) => scrubStrings(strs, { headword, fn }))
  return UF.scrubVoid({ ...stringFields, ...stringArrays, head_nr })
}
function extractAttestation(raw: RawAttestation, headword: TY.Word): WKT.WktAttestation | undefined {
  const { date, references:rawRefs, ...rest } = raw
  bumpUnknownKeys(rest, 'attestation')
  const refs = _.compact(_.map(rawRefs, ({ refn, text, ...refRest }) => {
    bumpUnknownKeys(refRest, 'attestation_reference')
    const stringFields = _.mapValues({ refn, text }, (str, fn) => scrubString(str, { headword, fn }))
    return UF.scrubVoid({ ...stringFields })
  }))
  return UF.scrubVoid({ date, refs })
}

function extractHyphenation(raw: RawHyphenation, headword: TY.Word): WKT.WktHyphenation | undefined {
  const tmi = { ...raw, headword }
  const { parts:_p, tags, ...rest } = raw
  bumpUnknownKeys(rest, 'hyphenation')
  if (_.isEmpty(raw.parts)) { return undefined }
  return UF.scrubVoid({ segs: scrubStrings(raw.parts, tmi)!, tags: scrubStrings(tags, tmi) })
}
function extractAbbreviation(raw: RawAbbreviation, headword: TY.Word): WKT.WktAbbreviation | undefined {
  const { word:rawAbbrev, sense:rawSense, ...rest } = raw
  bumpUnknownKeys(rest, 'abbreviation')
  return UF.scrubVoid({ abbrev: scrubString(rawAbbrev, { headword })!, sense: scrubString(rawSense, { headword })! })
}
function extractInstance(raw: RawInstance, headword: TY.Word): WKT.WktInstance | undefined {
  const { word:rawWord, tags, source, extra, ...rest } = raw
  bumpUnknownKeys(rest, 'instances')
  return UF.scrubVoid({
    relterm: scrubString(rawWord, { headword })!, tags: scrubStrings(tags, { headword }), source: scrubString(source, { headword }), extra: scrubString(extra, { headword }),
  })
}

const PositionalFieldnameRE = /^(\d+)$/
const NumberedFieldnameRE   = /^(\w+)(\d+)$/
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
type RemapTemplateFieldsOpts = { mainkey?: string, offset?: number, onlyPositionals?: boolean, stripPositionals?: boolean, validate?: boolean }
function remapTemplateFields<VT extends object>(raw: TY.AnyBag, tmi: any, { mainkey = 'relterm', offset = 1, onlyPositionals = false, stripPositionals = true, validate = true }: RemapTemplateFieldsOpts = {}): { parts: VT[], all: VT } {
  const parts = [] as TY.AnyBag[]
  const { occ, occ1, occ2, occ3, occ4, occ5, cat, cat1, cat2, cat3, cat4, cat5, occupation2, occupation3, occupation4, occupation5, ...rest } = raw
  const occs = _.compact(_.flatMap([occ, occ1, occ2, occ3, occ4, occ5, occupation2, occupation3, occupation4, occupation5], (str) => (str?.split(/,\s*/g) || [])))
  const cats = _.compact(_.flatMap([cat, cat1, cat2, cat3, cat4, cat5], (str) => (str?.split(/,\s*/g) || [])))
  const all  = UF.scrubVoid({ occ:  occs.join(', '), cat: cats.join(', '), occs, cats }) as TY.AnyBag
  for (const [rawkey, value] of Object.entries(rest)) {
    if ((rawkey === '1') && (offset === 1)) { all.langcode = value; continue }
    if (PositionalFieldnameRE.test(rawkey)) {
      const seq = Number(rawkey) - offset - 1; parts[seq] ||= {}; parts[seq][mainkey] = scrubString(value, tmi); continue
    }
    const mm = NumberedFieldnameRE.exec(rawkey)
    if (mm) {
      const key = lutFixer(TemplateFieldnameFixes, mm[1])
      if   (key === 'skip')                   { continue }
      // if   (! TemplateFieldnameFixes[mm[1]!]) { console.warn(`Unknown template fieldname`, mm[1], key, tmi); continue }
      if   (! TemplateFieldnameFixes[mm[1]!]) { bumpBucketCount('template-fieldname-unknown', mm[1]!); continue }
      const seq = Number(mm[2]) - offset - 1; parts[seq] ||= {}
      if ((onlyPositionals) && (! partsFieldnames.includes(key))) { console.warn(`Unknown numbered fieldname`, rawkey, key, tmi); continue }
      parts[seq][key] = value
      if (key === 'poskind') { parts[seq][key] = lutFixer(WktPoskindMap, value) }
      continue
    }
    if (! (TemplateFieldnameFixes[rawkey] || TemplateFieldnameTargets[rawkey])) { console.warn(`Unknown template fieldname`, rawkey, tmi); continue }
    const key = lutFixer(TemplateFieldnameFixes, rawkey)
    if (key === 'skip') { continue }
    all[key] = value
    if (key === 'poskind') { all[key] = lutFixer(WktPoskindMap, value) }
  }
  _.each(parts, (part, seq) => { if (validate && (! part)) { console.warn(`[[remapTemplateFields]] gap in part ${seq}`, parts, seq, tmi) }; parts[seq] ||= {} })
  _.each(all, (value, key) => { // stamp fields that apply to all parts onto each part, then delete from all
    if (onlyPositionals && (! partsFieldnames.includes(key))) { return }
    for (const part of parts) { part[key] ||= value }
    if (stripPositionals)     { delete all[key] }
  })
  _.each(parts, (part) => { if (part.langcode) { part.langcode = scrubLangcode(part.langcode, tmi, validate) } })
  const resultParts = _.filter(_.map(parts, (part) => UF.scrubVoid(part)), (part) => (part[mainkey]))
  return { parts: resultParts as VT[], all: all as VT }
}

function extractDesctree(raw: TY.AnyBag, headword: TY.Word): WKT.WktDesctree | undefined {
  // bump(raw, 'descendants-template', 'name')
  if (! /^(desc|desctree)$/.test(raw.name)) { return undefined }
  const { name, expansion, args, ...rest } = raw; bumpUnknownKeys(rest, 'descendant')
  const { parts:rawparts } = remapTemplateFields<WKT.WktDescterm>(args, raw, { mainkey: 'relterm', offset: 1 })
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
  const result: WKT.WktDescendant = { text: scrubString(text, { headword })!, depth, desctrees }
  return UF.scrubVoid(result)
}
function extractLink(raw: RawLink, _headword: TY.Word): WKT.WktLink | undefined {
  const { 0:target, 1:text = target, ...rest } = raw
  bumpUnknownKeys(rest, 'link')
  return UF.scrubVoid({ target, text, ...rest })
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
  const stringFields = _.mapValues({ ipa, rhymes, homophone, enpr, note, other, text }, (str) => scrubString(str, { headword }))
  const urlFields    = _.mapValues({ audurl, oggurl, mp3url }, (url) => scrubSimpleURL(url, headword))
  return UF.scrubVoid({
    ...stringFields, ...urlFields, tags: scrubStrings(tags, { headword }), topics: scrubStrings(topics, { headword }),
  })
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
    links:rawLinks, examples:rawExamples, glosses,
    hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordinate_terms:coordterms, related,
    alt_of:rawAltOf, form_of:rawFormOf, attestations:rawAttestations,
    wikidata, senseid, wikipedia, qualifier,
    categories, raw_glosses, tags, topics, raw_tags,
    info_templates:_xinfo_t,
    ...rest
  } = rawSense
  bumpUnknownKeys(rest, 'sense')
  const nyms         = extractNyms({ hypernyms, hyponyms, synonyms, antonyms, meronyms, holonyms, troponyms, coordterms, related }, headword)
  const links        = _.compact(_.map(rawLinks,    (rawLink)    => extractLink(rawLink as RawLink, headword)))
  const altof        = _.compact(_.map(rawAltOf,    (raw)        => extractInstance(raw as RawInstance, headword)))
  const formof       = _.compact(_.map(rawFormOf,   (raw)        => extractInstance(raw as RawInstance, headword)))
  const examples     = _.compact(_.map(rawExamples, (rawExample) => extractExample(rawExample, headword)))
  const attestations = _.compact(_.map(rawAttestations, (rawAttestation) => extractAttestation(rawAttestation, headword)))
  // const glosses   = _.compact(_.map(rawGlosses,  (rawGloss)   => scrubString(rawGloss, headword)))
  const stringFields     = _.mapValues({ qualifier },                                                     (str, fn) => scrubString(str,  { headword, fn }))
  const stringArrFields1 = _.mapValues({ glosses, wikidata, senseid, wikipedia },                         (str, fn) => scrubStrings(str, { headword, fn }))
  const stringArrFields2 = _.mapValues({ categories, raw_glosses, tags, topics, raw_tags }, (str, fn) => scrubStrings(str, { headword, fn }))
  _.each(examples, (example) => { if (! example.text) { console.warn('example without text', headword, example) } })
  //
  const sense = UF.scrubVoid({ ...stringArrFields1, ...stringFields, links, ...nyms, altof, formof, attestations, examples, ...stringArrFields2 })
  const report = WKT.wktSense.report(sense); if (! report.ok) { console.warn('Sense is not valid', headword, sense, report) }
  //
  return sense
}

function extractExample(raw: RawExample, headword: TY.Word): WKT.WktExample | undefined {
  const { text:rawText, type:rawType, ref:rawRef, bold_text_offsets, bold_english_offsets, bold_roman_offsets, bold_literal_offsets, literal_meaning,...rest } = raw
  const ref     = scrubString(rawRef,      { headword })
  const english = scrubString(raw.english, { headword })
  const roman   = scrubString(raw.roman,   { headword })
  const text    = scrubText(rawText || english || ref, { headword })
  if (! text) { return undefined }
  const highlights: WKT.WktExample['highlights'] = {}
  if (bold_text_offsets)    { highlights.text    = bold_text_offsets }
  if (bold_english_offsets) { highlights.english = bold_english_offsets }
  if (bold_roman_offsets)   { highlights.roman   = bold_roman_offsets }
  if (bold_literal_offsets) { highlights.literal = bold_literal_offsets }
  const type = ((rawType as any) === 'quote' ? 'quotation' : rawType)
  const result = UF.scrubVoid({ text, ref, ...rest, english, roman, highlights, type })
  // bump(result, 'example', 'type')
  if (literal_meaning) { bump(result, 'example', 'literal_meaning') }
  return result
}
function extractNyms<VT extends Record<string, WKT.WktNym[] | undefined>>(rawNyms: Record<string, RawNym[] | undefined>, headword: TY.Word): VT {
  return UF.scrubVoid(_.mapValues(rawNyms, (rawNyms, fieldname) => _.compact(_.map(rawNyms, (rawNym) => extractNym(rawNym as RawNym, { headword, fieldname }))))) as VT
}
function extractNym(rawNym: RawNym, tmi: TY.AnyBag): WKT.WktNym | undefined {
  const {
    word:rawWord, sense, english, roman, alt, source, extra,
    tags, raw_tags, topics, urls:rawUrls, taxonomic, qualifier, ...rest
  } = rawNym
  bumpUnknownKeys(rest, 'nym')
  const relterm = scrubString(rawWord, tmi)?.slice(0, 120)
  // if (! relterm) { console.warn('Nym without relterm', rawNym, tmi, relterm, rawWord); return undefined }
  if (! relterm) { bumpBucketCount('nym-blank', tmi.fieldname ?? 'nym'); return undefined }
  const stringFields = _.mapValues({ sense, english, roman, alt, source, extra, taxonomic, qualifier }, (str, fn)  => scrubString(str,   { ...tmi, fn }))
  const stringArrays = _.mapValues({ tags, raw_tags, topics },                                          (strs, fn) => scrubStrings(strs, { ...tmi, fn }))
  const urls         = _.compact(_.map(rawUrls, (url) => scrubSimpleURL(url, tmi)))
  return UF.scrubVoid({ relterm, ...stringFields, ...stringArrays, urls })
}

function scrubLangcode(raw: string, tmi: any, validate = true): string {
  const str      = lutFixer(LangcodeFixes, scrubString(raw, tmi))!
  if (! validate) { return str }
  const report   = WKT.langcode.report(str, tmi)
  if (str && (! report.ok)) { console.warn('Unknown language code', tmi, str, report) }
  return str
}
function extractTemplate(rawTemplate: Record<string, any>, tmiIn: TY.AnyBag): Record<string, any> | undefined {
  const tmi = { ...tmiIn, ...rawTemplate }
  const { minargs, ...result } = _.omitBy(_extractTemplate(rawTemplate, tmi), _.isUndefined)
  bumpUnknownKeys(minargs, 'etemp-minargs')
  if    (! result?.tname)  { return undefined }
  const { gloss, relterm, rellang, langcode, ...rest } = result; _.noop(rest)
  if (result.gloss)     { result.gloss     = scrubString(result.gloss,      tmi) }
  if (result.relterm)   { result.relterm   = scrubString(result.relterm,    tmi) }
  if (result.rellang)   { result.rellang   = scrubLangcode(result.rellang,  tmi) }
  if (result.langcode)  { result.langcode  = scrubLangcode(result.langcode, tmi) }
  return UF.scrubVoid(result)
}
const stringFields = ['alt', 'gloss', 'poskind', 'senseid', 'gender', 'langcode', 'translit', 'qualifier', 'lit']
const DERIVED_RE = /^(derived|borrowed|inherited|calque|partcalque)$/
function _extractTemplate(rawTemplate: Record<string, any>, tmi: TY.AnyBag): Record<string, any> | undefined {

  const { name:_n, expansion:rawExpansion, args: { 1:langcode, 1:p1, 2:p2, 3:p3, 4:p4, 5:p5, 6:p6, 7:p7, 8:p8, 9:p9, 10:p10, 11:p11, 12:p12, 13:p13, 14:p14, 15:p15, 16:p16, 17:p17, 18:p18, 19:p19, 20:p20, t, ...rawargs } } = rawTemplate
  const args = fixTemplateFieldnames(rawargs, rawTemplate)
  _.each(stringFields, (key) => { if (args[key]) { args[key] = scrubString(args[key], tmi) } })
  const expansion = scrubString(rawExpansion, tmi)
  // const { alt, gloss } = rawTemplate
  function alt(pn: string)   { return pn ??      rawTemplate.alt }
  function gl(pn?: string)   { return pn ?? t ?? rawTemplate.gloss ?? rawTemplate.gloss1 }
  const origlang = 'en'
  const positionals = _.reject([p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20].map((str) => scrubString(str, tmi)), _.isUndefined)
  const tname = (templateNameAliases[rawTemplate.name] ?? rawTemplate.name) as (WKT.WktTemplateName | 'skip')
  if (! _.invert(templateNameAliases)[tname]) { bumpBucketCount('etemp-unknown', rawTemplate.name); return undefined }
  if (tname === 'skip') { bumpBucketCount('etemp-skip', rawTemplate.name); return undefined }
  //
  if (rawTemplate.name === 'uder') { args.flavor = 'undefined derivation' }
  if (rawTemplate.name === 'ubor') { args.flavor = 'unadapted borrowing' }
  if (rawTemplate.name === 'lbor') { args.flavor = 'learned borrowing' }
  const p2on = positionals.slice(0)
  const p3on = positionals.slice(1)
  const pie = 'ine-pro'
  function getParts(offset: number,  opts: RemapTemplateFieldsOpts = {}) { const { parts } = remapTemplateFields(rawTemplate.args, { tname, p1, p2, ...tmi }, { mainkey: 'relterm', offset, onlyPositionals: true, stripPositionals: false,                      ...opts }); return parts }
  function getOthers(offset: number, opts: RemapTemplateFieldsOpts = {}) { const { all   } = remapTemplateFields(rawTemplate.args, { tname, p1, p2, ...tmi }, { mainkey: 'relterm', offset, onlyPositionals: true, stripPositionals: false, validate: false, ...opts }); return all }
  const { senseid, translit, transcript, scriptcode, cat, tree, lit, poskind:rawPoskind, ...minargs } = args; _.noop(minargs)
  const poskind = lutFixer(WktPoskindMap, scrubString(rawPoskind, tmi))
  _.each(args, (_val, key) => { if (TemplateFieldnameTargets[key.replace(/(\d+)$/, '')]) { return }; bump(args, 'etemp-arg', key, 'arg') })
  _.each(getOthers(1), (_val, key) => {
    if (WKT.etymologyBagShape[tname]?.ofShape?.[key]) { return }
    if (key === 'langcode') { return }
    bump(args, 'etemp-' + tname + '-arg', key, 'arg')
  })
  if (/\+/.test(langcode) && (tname === 'surf')) { return { tname, expansion, ...args,                relterm:  p3, relterms: p3on, parts: getParts(2, { validate: false }),                    langcode: p2,        } }
  if (/^(affix|surf)$/.test(tname))              { return { tname, expansion, ...args,                                              parts: getParts(1),  senseid,                gloss:  gl(),   langcode,            } }
  if (tname === 'suffix')                        { return { tname, expansion, ...args,             root:   p2, suffix: p3,          parts: getParts(1),                                          langcode,            } }
  if (tname === 'prefix')                        { return { tname, expansion, ...args, prefix: p2, root:   p3,                      parts: getParts(1),                                          langcode,            } }
  if (tname === 'confix')                        { return { tname, expansion, ...args, prefix: p2, root:   p3, suffix: p4,          parts: getParts(1),                                          langcode,            } }
  if (tname === 'compound')                      { return { tname, expansion, ...args,                                              parts: getParts(1),                                          langcode,            } }
  if (tname === 'doublet')                       { return { tname, expansion, ...args,                              relterms: p2on,                                                              langcode,            } }
  if (tname === 'blend')                         { return { tname, expansion, ...args,                              relterms: p2on,                                                              langcode,            } }
  if (tname === 'root')                          { return { tname, expansion, ...args, rellang: p2,                 relterms: p3on,                                 alt: alt(p4), gloss: gl(p5), langcode,            } }
  if (DERIVED_RE.test(tname))                    { return { tname, expansion, ...args, rellang: p2,   relterm:  p3, lit, poskind, scriptcode,                       alt: alt(p4), gloss: gl(p5), langcode,            } }
  if (tname === 'cognate')                       { return { tname, expansion, ...args, rellang: p1,   relterm:  p2,                                                 alt: alt(p3), gloss: gl(p4), langcode: origlang,  } }
  if (tname === 'noncognate')                    { return { tname, expansion, ...args, rellang: p1,   relterm:  p2,                                                 alt: alt(p3), gloss: gl(p4), langcode: origlang,  } }
  if (tname === 'abbrev')                        { return { tname, expansion, ...args, rellang: p1,   relterm:  p2, senseid, translit, transcript, scriptcode, cat, alt: alt(p3), gloss: gl(p4), langcode: origlang,  } }
  if (tname === 'abbrevof')                      { return { tname, expansion, ...args, rellang: p1,   relterm:  p2, senseid, translit, transcript, scriptcode, cat, alt: alt(p3), gloss: gl(p4), langcode: origlang,  } }
  if (tname === 'clipping')                      { return { tname, expansion, ...args,                relterm:  p2,                                                                              langcode,            } }
  if (tname === 'pieword')                       { return { tname, expansion, ...args, rellang: pie,  relterm:  p2,                                                                              langcode,            } }
  if (tname === 'coinage')                       { return { tname, expansion, ...args,                entity:   p2,                                                                              langcode,            } }
  if (tname === 'namedfor')                      { return { tname, expansion, ...args,                entity:   p2,                                                                              langcode,            } }
  if (tname === 'mention')                       { return { tname, expansion, ...args, target:    p2, text:   p3 || p2,                                                           gloss: gl(p4), langcode,            } }
  if (tname === 'glossary')                      { return { tname, expansion, ...args, target:    p1, text:   p2 || p1,                                                                                               } }
  if (tname === 'qualifier')                     { return { tname, expansion, ...args,                qualifier: p1, qualifiers: [p1, ...positionals],                                                                } }
  if (/^(taxlink|taxfmt)$/.test(tname))          { return { tname, expansion, ...args, taxon:     p1, level:     p2, alt:      p3,                                                                                    } }
  if (tname === 'etymid')                        { return { tname, expansion, ...args,                etymid:    p2, senseid, tree, translit, lit,                                                langcode,           } }
  if (tname === 'onomatopoeic')                  { return { tname, expansion, ...args,                                                                                                            langcode,           } }
  if (tname === 'etymon')                        { return { tname, expansion, ...args,                                                                                                            langcode,           } }
  if (tname === 'unknown')                       { return { tname, expansion, ...args,                                                                                                                                } }
  if (tname === 'uncertain')                     { return { tname, expansion, ...args,                                                                                                                                } }
  if (tname === 'other')                         { return { tname, expansion, origname: rawTemplate.name, ...fixTemplateFieldnames(rawTemplate.args, rawTemplate) } }
  // console.warn('Unknown template', rawTemplate.name, tname, rawTemplate)
  bumpBucketCount('etemp-unknown', rawTemplate.name)
  return undefined
  // return { ...otherwise, tname: 'other', [tname]: true }
}

export const Bucket = { counts: {} } as TY.Bag<TY.Bag<number>>
/** assemble counts of keys and of values */
function bump(obj: TY.AnyBag, bucket: string, key: string, overval: TY.StringMaybe = null) {
  const val = overval ?? obj[key]
  if (val === undefined) { return }
  const tag = `${bucket}:${key}`
  Bucket[tag] ||= {}
  Bucket[tag][val]    ||= 0 ; Bucket[tag][val]++
  Bucket.counts![tag] ||= 0 ; Bucket.counts![tag]++
}
/** count unknown keys in a bucket */
function bumpUnknownKeys(obj: TY.AnyBag, bucket: string) {
  _.each(obj, (_v, key) => { const ekey = bucket + '-extra'; Bucket[ekey] ||= {}; Bucket[ekey][key] ||= 0; Bucket[ekey][key]++  })
}
function bumpCount(bucket: string) {
  Bucket.counts ||= {}; Bucket.counts[bucket] ||= 0; Bucket.counts[bucket]++
}
function bumpBucketCount(bucket: string, key: string) {
  Bucket[bucket] ||= {}; Bucket[bucket][key] ||= 0; Bucket[bucket][key]++
}

function scrubString(raw: TY.StringMaybe, tmi: TY.AnyBag): string | undefined {
  return scrubText(raw, tmi)?.replaceAll(/[\t\n]+/g, ' ')
}
function scrubStrings(raw: TY.StringMaybe[] | undefined, tmi: TY.AnyBag): string[] | undefined {
  if (! raw) { return raw }
  if (! _.isArray(raw)) { console.warn('scrubStrings: not an array', raw, tmi); return undefined }
  return _.compact(_.map(raw, (str) => scrubString(str, tmi)))
}
function scrubText(raw: TY.StringMaybe, tmi: TY.AnyBag): string | undefined {
  if (! raw) { return raw ?? undefined }
  if (! _.isString(raw)) { console.warn('scrubText: not a string', raw, tmi); return undefined }
  // const result = raw.replaceAll(/[\p{Cc}\x90-\x9F]+/gu, ' ')
  const result = raw.replaceAll(/[\p{Cc}]+/gu, ' ')
  const rpt = CK.textish.report(result)
  if (! rpt.ok) { console.warn('Text is not textish', tmi, rpt, JSON.stringify(raw)) }
  return result.trim()
}