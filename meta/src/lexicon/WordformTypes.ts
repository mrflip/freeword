import      _                                /**/ from 'lodash'
import type * as FW                               from './LexiconConsts.ts'
import type { AnyBag, Bag, Word }                 from '../types/index.ts'
import type { LemmaDef }                          from './LemmaDef.ts'
// == [Utility Alias Types] -- used for expressiveness, they're mostly primitive types

/* Enum to strictly type lowercase a-z */
export type AtoZlo    = (typeof FW.AtoZlos)[number]
/** Enum to strictly type uppercase A-Z */
export type AtoZup    = (typeof FW.AtoZups)[number]
/** Enum to strictly type letter index 0-25 */
export type AtoZnum   = (typeof FW.AtoZnums)[number]

/** ISO 639-1 (two-letter) language code */
export type Langcode     = string

/** any object with a word property */
export type Worded       = { word: string }
/** a part of a word, eg. `ness` or `ing` */
export type Wordpart = string
/** a word stem split into lead and tail, eg. `ac|cede` */
export type Wordstem = string
/** Has a bit set for each letter in the alphabet (bit 0 set if it has an 'a', bit 1 set if it has a 'b', etc.); max 26 bits (67,108,864 possible values)
 * - efficient substring prefilters: does it have none/all/any/exactly these letters?
 * - count uniq letters efficiently: can be done very quickly by countBits28
 */
export type WordbitsT  = number
/** WordbitsT with all bits set for the missing letters */
export type MissingBits = WordbitsT
/** String representing a collection of (possibly non-unique) letters */
export type Shingle    = string
// --

// == [Part of speech and stem enums]

export type Poskind = (typeof FW.Poskinds)[number]

/** Stemkind for adjectives */
export type AdjStemkind = typeof FW.PosStemkinds['adj'][number]
/** Stemkind for adverbs */
export type AdvStemkind = typeof FW.PosStemkinds['adv'][number]
/** Stemkind for nouns */
export type NounStemkind = typeof FW.PosStemkinds['noun'][number]
/** Stemkind for verbs */
export type VerbStemkind = typeof FW.PosStemkinds['verb'][number]
/** Stemkind for interjections */
export type IntjStemkind = typeof FW.PosStemkinds['intj'][number]
/** Stemkind for prepositions */
export type PrepStemkind = typeof FW.PosStemkinds['prep'][number]
/** Stemkind for conjunctions */
export type ConjStemkind = typeof FW.PosStemkinds['conj'][number]
/** Stemkind for pronouns */
export type PronStemkind = typeof FW.PosStemkinds['pron'][number]
/** Stemkind for articles */
export type ArtStemkind = typeof FW.PosStemkinds['art'][number]
/** Stemkind for other parts of speech */
export type OtherStemkind = typeof FW.PosStemkinds['char' | 'advph' | 'prepph' | 'cont' | 'phrase' | 'det' | 'suffix' | 'proverb' | 'interfix' | 'symbol' | 'num' | 'name' | 'prefix' | 'particle' | 'postp' | 'infix' | 'punct'][number]
//
export type Stemkind = AdjStemkind | AdvStemkind | NounStemkind | VerbStemkind | IntjStemkind | PrepStemkind | ConjStemkind | PronStemkind | ArtStemkind | OtherStemkind
// --

// == [Wordform related props types] -- See the Wordform class for active object

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

/** Flattened version of WordformT for storage */
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
  // /** Wordform.tmi       */ AnyBag?,
]
// --

// == [Lemma related props types] -- See the Lemma class for active object

/** A lemma definition is a core word and its children: eg 'dance' with 'dance', 'danced', 'dancing' and 'dances' */
export interface LemmaDefT {
  /** core word,    eg. `accede` */ core:          Word
  /** all children, incl core    */ defs: readonly WordformT[]
  /** stem, eg. `ac|cede`        */ stem:          Wordstem
}
export interface MutableLemmaDef extends Omit<LemmaDef, 'defs'> { defs: WordformT[] }

export type LemmaDict = Bag<LemmaDef>
export type WordDict  = Bag<WordformT>
// --

// == [Process related types] -- tagged type to allow non-erroring return values

// --