/** a word of lower-cased letters (matching /^[a-z]+$/) */
export type Word     = string
export type Wordpart = string
export type Wordstem = string
/** bitfield of up to 26 bits, with bit set for each letter in the game (bit 0 set if it has an 'a', bit 1 set if it has a 'b', etc.) */
export type Wordbits = number

// Part of speech types
export type Poskind = 'adj' | 'adv' | 'verb' | 'noun' | 'intj' | 'prep' | 'conj' | 'pron' | 'art'

/** Stemkind for adjectives */
export type AdjStemkind =
 | 'adj_core' | 'adj_ier'    | 'adj_iest'    | 'adj_er'  | 'adj_est'  | 'adj_ic'   | 'adj_ish'
 | 'adj_ed'   | 'adj_ing'    | 'adj_ly'      | 'adj_irr' | 'adj_able' | 'adj_ible' | 'adj_al'  | 'adj_ility'
 | 'adj_ary'  | 'adj_ery'    | 'adj_ous'     | 'adj_ive' | 'adj_sy'   | 'adj_ny'
 | 'adj_ian'  | 'adj_ean'    | 'adj_ar'      | 'adj_ose' | 'adj_chy'  | 'adj_nty'  | 'adj_like'
 | 'adj_isty' | 'adj_istier' | 'adj_istiest' | 'adj_oid'

/** Stemkind for adverbs */
export type AdvStemkind =
 | 'adv_core' | 'adv_ily' | 'adv_ly' | 'adv_irr' | 'adv_ier' | 'adv_iest' | 'adv_er' | 'adv_est'

/** Stemkind for nouns */
export type NounStemkind =
 | 'n_core'    | 'n_sing' | 'n_pl_s'   | 'n_pl_es' | 'n_pl_i' | 'n_pl_ata' | 'n_both'
 | 'n_pl_men'  | 'n_pl_ae' | 'n_pl_ia' | 'n_pl_a' | 'n_irr' | 'n_pl_ot' | 'n_pl_chen'
 | 'n_pl_eaux' | 'n_pl_ieux' | 'n_pl_oix' | 'n_pl_sful' | 'n_pl_yim' | 'n_pl_khot' | 'n_ist'
 | 'n_s_er'    | 'n_pl_ers' | 'n_s_ic' | 'n_s_ing' | 'n_pl_ings' | 'n_s_y' | 'n_s_ness'

/** Stemkind for verbs */
export type VerbStemkind =
 | 'v_core'   | 'v_pl_es' | 'v_pl_s'  | 'v_ing' | 'v_ed' | 'v_xt' | 'v_pt'
 | 'v_irr' | 'v_en'
/** Stemkind for interjections */
export type IntjStemkind =
 | 'intj_core' | 'intj_irr'
/** Stemkind for prepositions */
export type PrepStemkind =
 | 'prep_core' | 'prep_irr'
/** Stemkind for conjunctions */
export type ConjStemkind =
 | 'conj_core' | 'conj_irr'
/** Stemkind for pronouns */
export type PronStemkind =
 | 'pron_core' | 'pron_irr'
/** Stemkind for articles */
export type ArtStemkind =
 | 'art_core' | 'art_irr'

/** Family of suffixes characterising how the stem and the word are related */
export type Stemkind = AdjStemkind | AdvStemkind | NounStemkind | VerbStemkind | IntjStemkind | PrepStemkind | ConjStemkind | PronStemkind | ArtStemkind
export type StemkindsForPosT = {
  adj:  AdjStemkind,
  adv:  AdvStemkind,
  noun: NounStemkind,
  verb: VerbStemkind,
  intj: IntjStemkind,
  prep: PrepStemkind,
  conj: ConjStemkind,
  pron: PronStemkind,
  art:  ArtStemkind,
}

type AnyBag = Record<string, any>

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
  /** bit set at position of each ltr   */ wordbits?:       Wordbits
  /** odd properties                    */ tmi?:            AnyBag
}

export type WordformFlat = [
  Word, Word, Poskind, Stemkind, Wordpart, Wordstem, Wordstem, string, number, number, AnyBag?,
]
