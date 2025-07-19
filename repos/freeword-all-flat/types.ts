// == [Types]

/** any object with any properties */
export type AnyBag = Record<string, any>
/** a word, eg. `accede` */
export type Word = string
/** a part of a word, eg. `ness` or `ing` */
export type Wordpart = string
/** a word stem split into lead and tail, eg. `ac|cede` */
export type Wordstem = string
/** Has a bit set for each letter in the alphabet (bit 0 set if it has an 'a', bit 1 set if it has a 'b', etc.); max 26 bits (67,108,864 possible values)
 * - efficient substring prefilters: does it have none/all/any/exactly these letters?
 * - count uniq letters efficiently: can be done very quickly by countBits28
 */
export type WordbitsT  = number

/** A wordform summarizes the properties of a specific term */
export interface WordformT {
  /** core word, eg. `accede`           */ core:            Word
  /** core for this pos eg `woodenly`   */ stemcore:        Wordstem
  /** word, eg. `acceded`               */ word:            Word
  /** lead|tail, eg. `monkey|ish`       */ stemsplit:       Wordstem
  /** suffixes, eg. `'-ED'`             */ suffix:          Wordpart
  /** part of speech, eg. `verb`        */ pos:             Poskind
  /** stemkind, eg. `vpl`               */ stemkind:        Stemkind
  /** frequency of the word             */ freq?:           number
  /** plain meaning, eg. `to consent`   */ gloss:           string
  /** bit set at position of each ltr   */ wordbits?:       WordbitsT
  /** odd properties                    */ tmi?:            AnyBag
}
export type WordformFlat = [
  /** Wordform.word      */ Word,
  /** Wordform.core      */ Word,
  /** Wordform.pos       */ Poskind,
  /** Wordform.stemkind  */ Stemkind,
  /** Wordform.suffix    */ Wordpart,
  /** Wordform.stemcore  */ Wordstem,
  /** Wordform.stemsplit */ Wordstem,
  /** Wordform.freq      */ number,
  /** Wordform.wordbits  */ number,
  /** Wordform.gloss     */ string,
]

/** Part of speech */
export type Poskind     = 'adj' | 'adv' | 'verb' | 'noun' | 'intj' | 'prep' | 'conj' | 'pron' | 'art'
/** Stemming processes for adjectives */
export type AdjStemkind =
  | 'adj_core'  | 'adj_ier'    | 'adj_iest'    | 'adj_er'    | 'adj_est'   | 'adj_ic'    | 'adj_ish'
  | 'adj_ed'    | 'adj_ing'    | 'adj_ly'      | 'adj_irr'   | 'adj_able'  | 'adj_ible'  | 'adj_al'    | 'adj_ility'
  | 'adj_ary'   | 'adj_ery'    | 'adj_ous'     | 'adj_ive'   | 'adj_sy'    | 'adj_ny'
  | 'adj_ian'   | 'adj_ean'    | 'adj_ar'      | 'adj_ose'   | 'adj_chy'   | 'adj_nty'   | 'adj_like'
  | 'adj_isty'  | 'adj_istier' | 'adj_istiest' | 'adj_oid'
/** Stemming processes for adverbs */
export type AdvStemkind =
  | 'adv_core'  | 'adv_ily'    | 'adv_ly'      | 'adv_irr'   | 'adv_ier'   | 'adv_iest'  | 'adv_er'    | 'adv_est'
/** Stemming processes for nouns */
export type NounStemkind =
  | 'n_core'    |  'n_sing'    | 'n_pl_s'      |  'n_pl_es'  | 'n_pl_i'    | 'n_pl_ata'  | 'n_both'
  | 'n_pl_men'  |  'n_pl_ae'   | 'n_pl_ia'     | 'n_pl_a'    | 'n_irr'     | 'n_pl_ot'   | 'n_pl_chen'
  | 'n_pl_eaux' | 'n_pl_ieux'  | 'n_pl_oix'    | 'n_pl_sful' | 'n_pl_yim'  | 'n_pl_khot' | 'n_ist'
  | 'n_s_er'    |  'n_pl_ers'  | 'n_s_ic'      | 'n_s_ing'   | 'n_pl_ings' | 'n_s_y'     | 'n_s_ness'

/** Stemming processes for verbs */
export type VerbStemkind = 'v_core' | 'v_pl_es' | 'v_pl_s' | 'v_ing' | 'v_ed' | 'v_xt' | 'v_pt' | 'v_irr' | 'v_en'
/** Stemming processes for interjections */
export type IntjStemkind = 'intj_core' | 'intj_irr'
/** Stemming processes for prepositions */
export type PrepStemkind = 'prep_core' | 'prep_irr'
/** Stemming processes for conjunctions */
export type ConjStemkind = 'conj_core' | 'conj_irr'
/** Stemming processes for pronouns */
export type PronStemkind = 'pron_core' | 'pron_irr'
/** Stemming processes for articles */
export type ArtStemkind  = 'art_core' | 'art_irr'
/** process that describes a stemming: eg 'adv_ily' for `happ|ily` ever after */
export type Stemkind = AdjStemkind | AdvStemkind | NounStemkind | VerbStemkind | IntjStemkind | PrepStemkind | ConjStemkind | PronStemkind | ArtStemkind
/** Utility type for the valid stemkinds for each part of speech */
export type StemkindTForPosT = {
  adj:  AdjStemkind
  adv:  AdvStemkind
  noun: NounStemkind
  verb: VerbStemkind
  intj: IntjStemkind
  prep: PrepStemkind
  conj: ConjStemkind
  pron: PronStemkind
  art:  ArtStemkind
}