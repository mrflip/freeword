import * as FreewordAllByword from '@freeword/all-flat'
import { Wordforms } from '@freeword/all-flat'
import { expect } from 'chai'

const SpotChecks = {
  joy: {
    word: 'joy', core: 'joy', pos: 'verb', stemkind: 'v_core', suffix: '', stemcore: 'joy', stemsplit: 'joy|', freq: 20660, wordbits: 0b01_0000_0000_0100_0010_0000_0000, gloss: 'to rejoice',
  }
}

describe('@freeword/all-byword package structure', () => {
  it('should be importable as a module', () => {
    expect(FreewordAllByword).to.exist.and.include.keys(
      'Wordforms',
    )
  })

  it('should have Wordforms export', () => {
    expect(FreewordAllByword).to.have.property('Wordforms')
    expect(FreewordAllByword.Wordforms).to.be.an('object')
    expect(FreewordAllByword.Wordforms).property('joy').to.eql(SpotChecks.joy)
  })

  it('should have default export', () => {
    expect(FreewordAllByword).property('default').to.be.an('object')
    expect(FreewordAllByword.default).property('joy').to.eql(SpotChecks.joy)
  })

  it('should have meta exports', () => {
    expect(FreewordAllByword).to.have.property('Poskinds').eql(["adj", "adv", "verb", "noun", "intj", "prep", "conj", "pron", "art"])
    expect(FreewordAllByword).to.have.property('PosStemkinds').property('adv').to.eql(["adv_core", "adv_ily", "adv_ly", "adv_irr", "adv_ier", "adv_iest", "adv_er", "adv_est"])
  })

  it('should support destructuring imports', () => {
    const { Wordforms, default: DefaultExport, Poskinds } = FreewordAllByword
    expect(Wordforms).to.be.an('object').with.property('joy').eql(SpotChecks.joy)
    expect(DefaultExport).to.be.an('object').with.property('joy').eql(SpotChecks.joy)
    expect(Poskinds).to.be.an('array')
  })
})