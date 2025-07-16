import * as FreewordAllByword from '@freeword/all-byword'
import { expect } from 'chai'

describe('@freeword/all-byword package structure', () => {
  it('should be importable as a module', () => {
    expect(FreewordAllByword).to.exist
    expect(FreewordAllByword).to.not.be.null
    expect(FreewordAllByword).to.not.be.undefined
  })

  it('should have Wordforms export', () => {
    expect(FreewordAllByword).to.have.property('Wordforms')
    expect(FreewordAllByword.Wordforms).to.be.an('object')
  })

  it('should have default export', () => {
    expect(FreewordAllByword).to.have.property('default')
    expect(FreewordAllByword.default).to.be.an('object')
  })

  it('should have meta exports', () => {
    expect(FreewordAllByword).to.have.property('Poskinds')
    expect(FreewordAllByword).to.have.property('PosStemkinds')
  })

  it('should support destructuring imports', () => {
    const { Wordforms, default: DefaultExport, Poskinds } = FreewordAllByword

    expect(Wordforms).to.be.an('object')
    expect(DefaultExport).to.be.an('object')
    expect(Poskinds).to.be.an('array')
  })
})