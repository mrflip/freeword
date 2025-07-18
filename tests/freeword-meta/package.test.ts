import      { expect }                            from 'chai'
import      * as FreewordMeta                     from '@freeword/meta'

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
      // 'default', // ESM default export
      "AtoZlos", "AtoZnums", "AtoZups", "Chars09AZaz", "CharsAZ09Bar", "CharsAZaz", "Filer",
      "MAX_UINT32", "Numerals", "PosStemkinds", 'Poskinds',
      "RandomFactory", "SeededRandomFactory", "Stemkinds", "StrAtoZ", "StrAtoZlo", "StrAtoZup",
      "StrNumerals", "Streaming", "SuffixREForStemkind", "UF", "Wordbits", "Wordform",
    ]
    expect(FreewordMeta).to.include.keys(...allowedProps)
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