import type * as TY from './types.ts'

export * from './types.ts'
export declare const Wordforms: Record<Word, WordformT>
export default Wordforms

/** Parts of speech */
export declare const Poskinds: readonly TY.Poskind[]

/** Stemming processes for each part of speech */
export declare const PosStemkinds: {
  readonly adj:  readonly TY.AdjStemkind[]
  readonly adv:  readonly TY.AdvStemkind[]
  readonly noun: readonly TY.NounStemkind[]
  readonly verb: readonly TY.VerbStemkind[]
  readonly intj: readonly TY.IntjStemkind[]
  readonly prep: readonly TY.PrepStemkind[]
  readonly conj: readonly TY.ConjStemkind[]
  readonly pron: readonly TY.PronStemkind[]
  readonly art:  readonly TY.ArtStemkind[]
}