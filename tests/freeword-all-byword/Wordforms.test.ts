import      _                                /**/ from 'lodash'
import       { expect }                           from 'chai'
import       { Poskinds, Wordforms }              from '@freeword/all-byword'
import       * as FW                              from '@freeword/meta'
import type  * as TY                              from '@freeword/meta'
import       { ExampleWordforms, HaveEtc, SyzygyEtc, ActEtc, CushionEtc, NotWords } from '../Fixtures.ts'

describe('Wordforms', () => {
  it('should be a lookup table of word forms by word', () => {
    expect(Wordforms).to.be.an('object')
    expect(Object.keys(Wordforms).length).to.be.greaterThan(0)
  })

  describe('data structure validation', () => {
    it('should have required properties for each wordform', () => {
      const sampleWords = ['the', 'aardvark', 'monkeyshines', 'act', 'cushy']

      sampleWords.forEach((word) => {
        const wordform = Wordforms[word]
        expect(wordform).to.exist
        expect(wordform).to.have.property('word')
        expect(wordform).to.have.property('core')
        expect(wordform).to.have.property('pos')
        expect(wordform).to.have.property('stemkind')
        expect(wordform).to.have.property('suffix')
        expect(wordform).to.have.property('stemcore')
        expect(wordform).to.have.property('stemsplit')
        expect(wordform).to.have.property('gloss')
      })
    })

    it('should have valid part of speech values', () => {
      const validPos = ['adj', 'adv', 'verb', 'noun', 'intj', 'prep', 'conj', 'pron', 'art']
      const sampleWords = Object.keys(Wordforms).slice(0, 100) // Check first 100 words

      sampleWords.forEach((word) => {
        const wordform = Wordforms[word]
        expect(validPos).to.include(wordform?.pos)
      })
    })

    it('should have valid stemkind values that match their pos', () => {
      const posToStemkindPrefix = {
        adj: 'adj_',
        adv: 'adv_',
        verb: 'v_',
        noun: 'n_',
        intj: 'intj_',
        prep: 'prep_',
        conj: 'conj_',
        pron: 'pron_',
        art: 'art_'
      }

      const sampleWords = Object.keys(Wordforms).slice(0, 100)

      sampleWords.forEach((word) => {
        const wordform = Wordforms[word] as TY.WordformT
        expect(wordform).to.be.an("object")
        const expectedPrefix = posToStemkindPrefix[wordform.pos]
        expect(wordform.stemkind).to.match(new RegExp(`^${expectedPrefix}`))
      })
    })
  })

  describe('specific word spot checks', () => {
    it('should have correct data for high-frequency words', () => {
      // Test the most frequent word
      const the = Wordforms.the as TY.WordformT
      expect(the).to.exist
      expect(the.word).to.equal('the')
      expect(the.pos).to.equal('art')
      expect(the.stemkind).to.equal('art_core')
      expect(the.freq).to.be.a('number')
      expect(the.freq).to.be.greaterThan(50000000) // Should be very high frequency
    })

    it('should have correct data for example words from fixtures', () => {
      Object.entries(ExampleWordforms).forEach(([word, expected]) => {
        const actual = Wordforms[word] as TY.WordformT
        const expectedWordform = expected as TY.WordformT
        expect(actual).to.exist
        expect(actual.word).to.equal(expectedWordform.word)
        expect(actual.core).to.equal(expectedWordform.core)
        expect(actual.pos).to.equal(expectedWordform.pos)
        expect(actual.stemkind).to.equal(expectedWordform.stemkind)
        expect(actual.suffix).to.equal(expectedWordform.suffix)
        expect(actual.stemcore).to.equal(expectedWordform.stemcore)
        expect(actual.stemsplit).to.equal(expectedWordform.stemsplit)
        expect(actual.freq).to.equal(expectedWordform.freq)
        expect(actual.wordbits).to.equal(expectedWordform.wordbits)
        expect(actual.gloss).to.equal(expectedWordform.gloss)
      })
    })

    const wordFamilies = [
      { name: 'have/be verb forms',   data: ExampleWordforms },
      { name: 'have/be verb forms',   data: HaveEtc },
      { name: 'syzygy word family',   data: SyzygyEtc },
      { name: 'act word family',      data: ActEtc },
      { name: 'cushion word family',  data: CushionEtc }
    ]

    wordFamilies.forEach(({ name, data }) => {
      it(`should have correct data for ${name}`, () => {
        Object.entries(data).forEach(([word, expected]) => {
          expect(Wordforms[word]).to.eql(expected)
        })
      })
    })
  })

  describe('data integrity checks', () => {
    it('should have consistent word-to-key mapping', () => {
      const sampleWords = Object.keys(Wordforms).slice(0, 100)

      sampleWords.forEach((key) => {
        const wordform = Wordforms[key] as TY.WordformT
        expect(wordform.word).to.equal(key)
      })
    })

    it('should have valid frequency values', () => {
      const sampleWords = Object.keys(Wordforms).slice(0, 100)

      sampleWords.forEach((word) => {
        const wordform = Wordforms[word] as TY.WordformT
        if (wordform.freq !== undefined) {
          expect(wordform.freq).to.be.a('number')
          expect(wordform.freq).to.be.greaterThanOrEqual(0)
        }
      })
    })

    it('should have valid wordbits values', () => {
      const sampleWords = Object.keys(Wordforms).slice(0, 100)

      sampleWords.forEach((word) => {
        const wordform = Wordforms[word] as TY.WordformT
        if (wordform.wordbits !== undefined) {
          expect(wordform.wordbits).to.be.a('number')
          expect(wordform.wordbits).to.be.greaterThanOrEqual(0)
        }
      })
    })

    it('should have non-empty gloss strings', () => {
      const sampleWords = Object.keys(Wordforms).slice(0, 100)

      sampleWords.forEach((word) => {
        const wordform = Wordforms[word] as TY.WordformT
        expect(wordform.gloss).to.be.a('string')
        expect(wordform.gloss.length).to.be.greaterThan(0)
      })
    })

    it('should have valid stemsplit format', () => {
      const sampleWords = Object.keys(Wordforms).slice(0, 100)

      sampleWords.forEach((word) => {
        const wordform = Wordforms[word] as TY.WordformT
        expect(wordform.stemsplit).to.be.a('string')
        expect(wordform.stemsplit).to.match(/^[a-z]*\|[a-z]*$/)
      })
    })
  })

  describe('edge cases and special words', () => {
    it('should handle words with irregular plurals', () => {
      const sheep = Wordforms.sheep as TY.WordformT
      expect(sheep).to.exist
      expect(sheep.pos).to.equal('noun')
      expect(sheep.stemkind).to.equal('n_both') // Both singular and plural
    })

    it('should handle words with no inflections', () => {
      const quoth = Wordforms.quoth as TY.WordformT
      expect(quoth).to.exist
      expect(quoth.pos).to.equal('verb')
      expect(quoth.stemkind).to.equal('v_core')
      expect(quoth.gloss).to.include('cannot be conjugated')
    })

    it('should have the first and last words in the corpus', () => {
      const keys = Object.keys(Wordforms) as (keyof typeof Wordforms)[]
      expect(keys[0]).to.equal('aah')
      expect(keys[keys.length - 1]).to.equal('zzz')
      expect(Wordforms.aah).to.eql(ExampleWordforms.aah)
    })

    it('should handle words with very low frequency', () => {
      const mellific = Wordforms.mellific as TY.WordformT
      expect(mellific).to.exist
      expect(mellific.freq).to.equal(1)
    })

    it('should handle words with complex morphological structures', () => {
      const idiomaticnesses = Wordforms.idiomaticnesses as TY.WordformT
      expect(idiomaticnesses).to.exist
      expect(idiomaticnesses.pos).to.equal('intj')
      expect(idiomaticnesses.stemkind).to.equal('intj_irr')
    })
  })

  describe('data completeness', () => {
    it('should not contain empty strings as keys', () => {
      expect(Wordforms).to.not.have.property('')
    })

    it('should not contain offensive words (they are published separately)', () => {
      NotWords.forEach((word) => {
        expect(Wordforms).to.not.have.property(word)
      })
    })

    it('should have reasonable distribution of parts of speech', () => {
      const posCounts:    Record<TY.Poskind, number> = _.mapKeys(Poskinds, _.constant(0)) as Record<TY.Poskind, number>
      _.each(Wordforms, ((word: TY.Word) => {
        const     pos   = Wordforms[word]?.pos as TY.Poskind
        posCounts[pos]  = (posCounts[pos] || 0) + 1
      }))
      const wanted = { noun: 58876, verb: 38592, adj: 12759, adv: 1799, prep: 62, conj: 17, pron: 51, intj: 84979 } as const
      if (! _.isEqual(posCounts, wanted)) { console.log(FW.pretty(posCounts)) }
      expect(posCounts).to.eql(wanted)
    })
  })
})