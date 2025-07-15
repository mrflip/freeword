import * as FreewordMeta from '@freeword/meta'
import { expect } from 'chai'

describe('@freeword/meta package', () => {
  describe('Constants', () => {
    it('should export Poskinds array', () => {
      expect(FreewordMeta.Poskinds).to.be.an('array')
      expect(FreewordMeta.Poskinds).to.include('adj')
      expect(FreewordMeta.Poskinds).to.include('noun')
      expect(FreewordMeta.Poskinds).to.include('verb')
      expect(FreewordMeta.Poskinds).to.include('adv')
      expect(FreewordMeta.Poskinds).to.include('intj')
      expect(FreewordMeta.Poskinds).to.include('prep')
      expect(FreewordMeta.Poskinds).to.include('conj')
      expect(FreewordMeta.Poskinds).to.include('pron')
      expect(FreewordMeta.Poskinds).to.include('art')
    })

    it('should export StemkindsForPos object', () => {
      expect(FreewordMeta.StemkindsForPos).to.be.an('object')
      expect(FreewordMeta.StemkindsForPos).to.have.property('adj')
      expect(FreewordMeta.StemkindsForPos).to.have.property('noun')
      expect(FreewordMeta.StemkindsForPos).to.have.property('verb')
      expect(FreewordMeta.StemkindsForPos).to.have.property('adv')
    })

    it('should have valid stemkinds for adjectives', () => {
      const adjStemkinds = FreewordMeta.StemkindsForPos.adj
      expect(adjStemkinds).to.be.an('array')
      expect(adjStemkinds).to.include('adj_core')
      expect(adjStemkinds).to.include('adj_ier')
      expect(adjStemkinds).to.include('adj_iest')
      expect(adjStemkinds).to.include('adj_er')
      expect(adjStemkinds).to.include('adj_est')
    })

    it('should have valid stemkinds for nouns', () => {
      const nounStemkinds = FreewordMeta.StemkindsForPos.noun
      expect(nounStemkinds).to.be.an('array')
      expect(nounStemkinds).to.include('n_core')
      expect(nounStemkinds).to.include('n_sing')
      expect(nounStemkinds).to.include('n_pl_s')
      expect(nounStemkinds).to.include('n_pl_es')
    })

    it('should have valid stemkinds for verbs', () => {
      const verbStemkinds = FreewordMeta.StemkindsForPos.verb
      expect(verbStemkinds).to.be.an('array')
      expect(verbStemkinds).to.include('v_core')
      expect(verbStemkinds).to.include('v_ing')
      expect(verbStemkinds).to.include('v_ed')
      expect(verbStemkinds).to.include('v_irr')
    })

    it('should have valid stemkinds for adverbs', () => {
      const advStemkinds = FreewordMeta.StemkindsForPos.adv
      expect(advStemkinds).to.be.an('array')
      expect(advStemkinds).to.include('adv_core')
      expect(advStemkinds).to.include('adv_ly')
      expect(advStemkinds).to.include('adv_irr')
    })
  })

  describe('Structure validation', () => {
    it('should have all poskinds in StemkindsForPos', () => {
      const poskinds = FreewordMeta.Poskinds
      const stemkindsForPos = FreewordMeta.StemkindsForPos

      poskinds.forEach(poskind => {
        expect(stemkindsForPos).to.have.property(poskind)
        expect(stemkindsForPos[poskind]).to.be.an('array')
      })
    })

    it('should have consistent stemkind prefixes', () => {
      const stemkindsForPos = FreewordMeta.StemkindsForPos

      // Check that adj stemkinds start with 'adj_'
      stemkindsForPos.adj.forEach(stemkind => {
        expect(stemkind).to.match(/^adj_/)
      })

      // Check that noun stemkinds start with 'n_'
      stemkindsForPos.noun.forEach(stemkind => {
        expect(stemkind).to.match(/^n_/)
      })

      // Check that verb stemkinds start with 'v_'
      stemkindsForPos.verb.forEach(stemkind => {
        expect(stemkind).to.match(/^v_/)
      })

      // Check that adv stemkinds start with 'adv_'
      stemkindsForPos.adv.forEach(stemkind => {
        expect(stemkind).to.match(/^adv_/)
      })
    })
  })
})