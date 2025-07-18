import * as FreewordMeta from '@freeword/meta'
import { expect } from 'chai'

// Type tests - these will fail at compile time if types are wrong
describe('@freeword/meta TypeScript types', () => {
  it('should have correct Poskind type', () => {
    const poskind: FreewordMeta.Poskind = 'adj'
    expect(poskind).to.equal('adj')

    // This should be a valid poskind
    const validPoskinds: FreewordMeta.Poskind[] = ['adj', 'noun', 'verb', 'adv', 'intj', 'prep', 'conj', 'pron', 'art']
    expect(validPoskinds).to.be.an('array')
  })

  it('should have correct Stemkind types', () => {
    const adjStemkind: FreewordMeta.AdjStemkind = 'adj_core'
    const nounStemkind: FreewordMeta.NounStemkind = 'n_core'
    const verbStemkind: FreewordMeta.VerbStemkind = 'v_core'
    const advStemkind: FreewordMeta.AdvStemkind = 'adv_core'

    expect(adjStemkind).to.equal('adj_core')
    expect(nounStemkind).to.equal('n_core')
    expect(verbStemkind).to.equal('v_core')
    expect(advStemkind).to.equal('adv_core')
  })

  it('should have correct WordformT interface', () => {
    const wordform: FreewordMeta.WordformT = {
      core: 'test',
      stemcore: 'test',
      word: 'test',
      stemsplit: 'test',
      suffix: 'test',
      pos: 'adj',
      stemkind: 'adj_core',
      gloss: 'test word',
      freq: 1,
      wordbits: 1,
      tmi: {}
    }

    expect(wordform.core).to.equal('test')
    expect(wordform.pos).to.equal('adj')
    expect(wordform.stemkind).to.equal('adj_core')
  })

  it('should have correct WordformFlat type', () => {
    const wordformFlat: FreewordMeta.WordformFlat = [
      'test', 'test', 'adj', 'adj_core', 'test', 'test', 'test', 'test word', 1, 1, {}
    ]

    expect(wordformFlat).to.be.an('array')
    expect(wordformFlat).to.have.length(11)
  })

  it('should have correct StemkindsForPosT type', () => {
    const stemkindsForPos: FreewordMeta.StemkindsForPosT = {
      adj: 'adj_core',
      adv: 'adv_core',
      noun: 'n_core',
      verb: 'v_core',
      intj: 'intj_core',
      prep: 'prep_core',
      conj: 'conj_core',
      pron: 'pron_core',
      art: 'art_core'
    }

    expect(stemkindsForPos.adj).to.equal('adj_core')
    expect(stemkindsForPos.noun).to.equal('n_core')
  })

  it('should have correct basic types', () => {
    const word: FreewordMeta.Word = 'test'
    const wordpart: FreewordMeta.Wordpart = 'test'
    const wordstem: FreewordMeta.Wordstem = 'test'
    const wordbits: FreewordMeta.Wordbits = 1

    expect(word).to.equal('test')
    expect(wordpart).to.equal('test')
    expect(wordstem).to.equal('test')
    expect(wordbits).to.equal(1)
  })
})