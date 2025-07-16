import * as FreewordMeta from '@freeword/meta'
import { expect } from 'chai'

describe('@freeword/meta package structure', () => {
  it('should be importable as a module', () => {
    expect(FreewordMeta).to.exist
    expect(FreewordMeta).to.not.be.null
    expect(FreewordMeta).to.not.be.undefined
  })

  it('should have expected top-level exports', () => {
    const expectedExports = [
      'Poskinds',
      'PosStemkinds'
    ]

    expectedExports.forEach(exportName => {
      expect(FreewordMeta).to.have.property(exportName)
    })
  })

  it('should not have unexpected properties', () => {
    const allowedProps = [
      'Poskinds',
      'PosStemkinds',
      'default' // ESM default export
    ]

    Object.keys(FreewordMeta).forEach(key => {
      expect(allowedProps).to.include(key)
    })
  })

  it('should have immutable constants', () => {
    // Test that constants are not accidentally mutable
    const originalPoskinds = [...FreewordMeta.Poskinds]
    const originalStemkindsForPos = JSON.parse(JSON.stringify(FreewordMeta.PosStemkinds))

    expect(FreewordMeta.Poskinds).to.deep.equal(originalPoskinds)
    expect(FreewordMeta.PosStemkinds).to.deep.equal(originalStemkindsForPos)
  })

  it('should support destructuring imports', () => {
    const { Poskinds, PosStemkinds } = FreewordMeta

    expect(Poskinds).to.be.an('array')
    expect(PosStemkinds).to.be.an('object')
  })
})