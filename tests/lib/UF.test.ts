import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import      * as UF                              from '../../src/lib/UF.ts'

describe('UF', () => {
  describe('AlphabetList', () => {
    it('should contain all 26 letters of the alphabet', () => {
      expect(UF.AlphabetList).to.have.length(26)
      expect(UF.AlphabetList[0]).to.equal('a')
      expect(UF.AlphabetList[25]).to.equal('z')
      expect(UF.AlphabetList).to.be.an('array')
    })
  })

  describe('alphabetLookupBag', () => {
    it('should create a bag with function seed', () => {
      const bag = UF.alphabetLookupBag((ltr) => ltr.toUpperCase())
      expect(bag).to.be.an('object')
      expect(bag.a).to.equal('A')
      expect(bag.z).to.equal('Z')
      expect(Object.keys(bag)).to.have.length(26)
    })

    it('should create a bag with value seed', () => {
      const bag = UF.alphabetLookupBag(42)
      expect(bag).to.be.an('object')
      expect(bag.a).to.equal(42)
      expect(bag.z).to.equal(42)
      expect(Object.keys(bag)).to.have.length(26)
    })
  })

  describe('adorn', () => {
    it('should add a non-enumerable property to an object', () => {
      const obj: any = {}
      const result = UF.adorn(obj, 'testKey', 'testValue')
      expect(result).to.equal('testValue')
      expect(obj.testKey).to.equal('testValue')
      expect(Object.getOwnPropertyDescriptor(obj, 'testKey')).to.deep.include({
        enumerable: false,
        writable: false,
        configurable: true
      })
    })
  })

  describe('setNormalProp', () => {
    it('should add an enumerable property to an object', () => {
      const obj: any = {}
      const result = UF.setNormalProp(obj, 'testKey', 'testValue')

      expect(result).to.equal('testValue')
      expect(obj.testKey).to.equal('testValue')
      expect(Object.getOwnPropertyDescriptor(obj, 'testKey')).to.deep.include({
        enumerable: true,
        writable: true,
        configurable: true
      })
    })
  })

  describe('setNormalProps', () => {
    it('should add multiple enumerable properties to an object', () => {
      const obj: any = {}
      const props = { key1: 'value1', key2: 'value2' }
      const result = UF.setNormalProps(obj, props)

      expect(result).to.equal(obj)
      expect(obj.key1).to.equal('value1')
      expect(obj.key2).to.equal('value2')
      expect(Object.getOwnPropertyDescriptor(obj, 'key1')).to.deep.include({
        enumerable: true,
        writable: true,
        configurable: true
      })
    })
  })

  describe('setHiddenProps', () => {
    it('should add multiple non-enumerable properties to an object', () => {
      const obj: any = {}
      const props = { key1: 'value1', key2: 'value2' }
      const result = UF.setHiddenProps(obj, props)

      expect(result).to.equal(obj)
      expect(obj.key1).to.equal('value1')
      expect(obj.key2).to.equal('value2')
      expect(Object.getOwnPropertyDescriptor(obj, 'key1')).to.deep.include({
        enumerable: false,
        writable: true,
        configurable: true
      })
    })
  })

  describe('decorate', () => {
    it('should add multiple non-enumerable, non-writable properties to an object', () => {
      const obj: any = {}
      const props = { key1: 'value1', key2: 'value2' }
      const result = UF.decorate(obj, props)

      expect(result).to.equal(obj)
      expect(obj.key1).to.equal('value1')
      expect(obj.key2).to.equal('value2')
      expect(Object.getOwnPropertyDescriptor(obj, 'key1')).to.deep.include({
        enumerable: false,
        writable: false,
        configurable: true
      })
    })
  })

  describe('ownProps', () => {
    it('should return own property descriptors', () => {
      const obj = { a: 1, b: 2 }
      const result = UF.ownProps(obj)

      expect(result).to.be.an('object')
      expect(result.a).to.be.an('object')
      expect(result.a.value).to.equal(1)
      expect(result.b.value).to.equal(2)
    })

        it('should return empty object for null/undefined', () => {
      expect(UF.ownProps(null as any)).to.deep.equal({})
      expect(UF.ownProps(undefined as any)).to.deep.equal({})
    })
  })

  describe('ownPropnames', () => {
    it('should return own property names', () => {
      const obj = { a: 1, b: 2 }
      const result = UF.ownPropnames(obj)

      expect(result).to.include.members(['a', 'b'])
      expect(result).to.have.length(2)
    })

    it('should return empty array for null/undefined', () => {
      expect(UF.ownPropnames(null as any)).to.deep.equal([])
      expect(UF.ownPropnames(undefined as any)).to.deep.equal([])
    })
  })

  describe('protoPropnames', () => {
    it('should return prototype property names', () => {
      const proto = { protoA: 1, protoB: 2 }
      const obj = Object.create(proto)
      ;(obj as any).ownA = 3

      const result = UF.protoPropnames(obj)

      expect(result).to.include.members(['protoA', 'protoB'])
    })

    it('should return empty array for null/undefined', () => {
      expect(UF.protoPropnames(null as any)).to.deep.equal([])
      expect(UF.protoPropnames(undefined as any)).to.deep.equal([])
    })
  })

  describe('protoProp', () => {
    it('should return property descriptor from prototype', () => {
      const proto = { protoA: 1 }
      const obj = Object.create(proto)

      const result = UF.protoProp(obj, 'protoA')

      expect(result).to.be.an('object')
      expect(result!.value).to.equal(1)
    })

    it('should return undefined for non-existent property', () => {
      const obj = {}
      const result = UF.protoProp(obj, 'nonexistent')

      expect(result).to.be.undefined
    })
  })

  describe('ownProp', () => {
    it('should return own property descriptor', () => {
      const obj = { ownA: 1 }
      const result = UF.ownProp(obj, 'ownA')

      expect(result).to.be.an('object')
      expect(result!.value).to.equal(1)
    })

    it('should return undefined for non-existent property', () => {
      const obj = {}
      const result = UF.ownProp(obj, 'nonexistent')

      expect(result).to.be.undefined
    })
  })

  describe('getProp', () => {
    it('should return property descriptor from own properties', () => {
      const obj = { ownA: 1 }
      const result = UF.getProp(obj, 'ownA')

      expect(result).to.be.an('object')
      expect(result!.value).to.equal(1)
    })

    it('should return property descriptor from prototype', () => {
      const proto = { protoA: 1 }
      const obj = Object.create(proto)

      const result = UF.getProp(obj, 'protoA', 1)

      expect(result).to.be.an('object')
      expect(result!.value).to.equal(1)
    })

    it('should return undefined for non-existent property', () => {
      const obj = {}
      const result = UF.getProp(obj, 'nonexistent')

      expect(result).to.be.undefined
    })

    it('should respect depth parameter', () => {
      const proto2 = { proto2A: 1 }
      const proto1 = Object.create(proto2)
      const obj = Object.create(proto1)

      const result = UF.getProp(obj, 'proto2A', 1)

      expect(result).to.be.undefined
    })
  })

  describe('isNode', () => {
    it('should return boolean indicating if running in Node.js', () => {
      const result = UF.isNode()
      expect(result).to.be.a('boolean')
    })
  })

  describe('isBrowser', () => {
    it('should return boolean indicating if running in browser', () => {
      const result = UF.isBrowser()
      expect(result).to.be.a('boolean')
    })
  })

  describe('prettifyInChunks', () => {
    it('should format array in chunks', () => {
      const arr = ['a', 'b', 'c', 'd', 'e']
      const result = UF.prettifyInChunks(arr, { chunkSize: 2, colwd: 8 })
      expect(result).to.equal('[\n    \'a\',     \'b\',    \n  \'c\',     \'d\',    \n  \'e\',    \n]')
    })

    it('should handle key parameter', () => {
      const arr = ['a', 'b']
      const result = UF.prettifyInChunks(arr, { key: 'testKey', chunkSize: 2 })
      expect(result).to.equal('testKey:[\n    \'a\',         \'b\',        \n]')
    })
  })

  describe('prettifyArray', () => {
    it('should return simple format for short arrays', () => {
      const arr = ['a', 'b', 'c']
      const result = UF.prettifyArray(arr)
      expect(result).to.equal("[ 'a', 'b', 'c' ]")
    })

    it('should use chunked format for long arrays', () => {
      const arr = Array.from({ length: 200 }, (_, i) => `item${i}`)
      const result = UF.prettifyArray(arr)
      expect(result).to.include('item0')
      expect(result).to.include('item199')
      expect(result).to.match(/^\[[\s\S]*\]$/)
    })

    it('should respect chunkArrays option', () => {
      const arr = ['a', 'b', 'c']
      const result = UF.prettifyArray(arr, { chunkArrays: true })
      expect(result).to.equal('[\n    \'a\',         \'b\',         \'c\',        \n]')
    })
  })

  describe('prettifySet', () => {
    it('should format Set as new Set()', () => {
      const set = new Set(['a', 'b', 'c'])
      const result = UF.prettifySet(set)
      expect(result).to.equal("new Set([ 'a', 'b', 'c' ])")
    })

    it('should handle key parameter', () => {
      const set = new Set(['a', 'b'])
      const result = UF.prettifySet(set, { key: 'testKey' })
      expect(result).to.equal('testKey:new Set([ \'a\', \'b\' ])')
    })
  })

  describe('inspectify', () => {
    it('should format simple values', () => {
      expect(UF.inspectify('test')).to.equal("'test'")
      expect(UF.inspectify(42)).to.equal('42')
      expect(UF.inspectify(true)).to.equal('true')
    })

    it('should format objects', () => {
      const obj = { a: 1, b: 2 }
      const result = UF.inspectify(obj)
      expect(result).to.equal('{ a: 1, b: 2 }')
    })

    it('should format arrays', () => {
      const arr = [1, 2, 3]
      const result = UF.inspectify(arr)
      expect(result).to.equal('[ 1, 2, 3 ]')
    })
  })

  describe('kfy', () => {
    it('should format valid fieldnames as-is', () => {
      expect(UF.kfy('validField')).to.equal('validField:')
      expect(UF.kfy('valid_field')).to.equal('valid_field:')
    })

    it('should inspect invalid fieldnames', () => {
      expect(UF.kfy('invalid-field')).to.include("'invalid-field'")
      expect(UF.kfy('123field')).to.include("'123field'")
    })

    it('should respect keywd option', () => {
      expect(UF.kfy('test', { keywd: 10 })).to.equal('test:     ')
    })
  })

  describe('prettifyField', () => {
    it('should handle arrays', () => {
      const arr = ['a', 'b', 'c']
      const result = UF.prettifyField(arr)
      expect(result).to.equal("[ 'a', 'b', 'c' ]")
    })

    it('should handle Sets', () => {
      const set = new Set(['a', 'b'])
      const result = UF.prettifyField(set)
      expect(result).to.equal("new Set([ 'a', 'b' ])")
    })

    it('should handle other values', () => {
      expect(UF.prettifyField('test')).to.equal("'test'")
      expect(UF.prettifyField(42)).to.equal('42')
    })
  })

  describe('prettify', () => {
    it('should format object with default options', () => {
      const obj = { a: 1, b: 2 }
      const result = UF.prettify(obj)
      expect(result).to.equal('{\na:           1,\nb:           2,\n}')
    })

    it('should handle key parameter', () => {
      const obj = { a: 1 }
      const result = UF.prettify(obj, { key: 'testKey' })
      expect(result).to.equal('testKey: {\na:           1,\n}')
    })

    it('should handle naked option', () => {
      const obj = { a: 1 }
      const result = UF.prettify(obj, { naked: true })
      expect(result).to.equal('\na:           1,\n')
    })

    it('should handle indent option', () => {
      const obj = { a: 1 }
      const result = UF.prettify(obj, { indent: 4 })
      expect(result).to.equal('{\n    a:           1,\n}')
    })
  })

  describe('rebag', () => {
    it('should transform array using function', () => {
      const arr = ['a', 'b', 'c']
      const result = UF.rebag(arr, (val, key, index) => [`key${index}${key}`, val.toUpperCase()])
      expect(result).to.deep.equal({ key00: 'A', key11: 'B', key22: 'C' })
    })

    it('should transform object using function', () => {
      const obj = { a: 1, b: 2 }
      const result = UF.rebag(obj, (val, key, index) => [`new${key}${index}`, val * 2])
      expect(result).to.deep.equal({ newa0: 2, newb1: 4 })
    })
  })

  describe('objectify', () => {
    it('should transform array using function', () => {
      const arr = ['a', 'b', 'c']
      const result = UF.objectify(arr, (val, key, index) => `${val}${key}${index}`)
      expect(result).to.deep.equal({ a: 'a00', b: 'b11', c: 'c22' })
    })

    it('should transform object using function', () => {
      const obj = { a: 1, b: 2 }
      const result = UF.objectify(obj, (val, key, index) => (`${val} ~ ${key} ~ ${index}`))
      expect(result).to.deep.equal({ '1': '1 ~ a ~ 0', '2': '2 ~ b ~ 1' })
    })
  })

  describe('bagslice', () => {
    it('should slice object keys', () => {
      const bag = { a: 1, b: 2, c: 3, d: 4 }
      const result = UF.bagslice(bag, 1, 3)

      expect(result).to.deep.equal({
        b: 2,
        c: 3
      })
    })

    it('should handle undefined start/end', () => {
      const bag = { a: 1, b: 2, c: 3 }
      const result = UF.bagslice(bag, undefined, 2)

      expect(result).to.deep.equal({
        a: 1,
        b: 2
      })
    })
  })

  describe('sleepNextTick', () => {
    it('should return true', async () => {
      const result = await UF.sleepNextTick()
      expect(result).to.be.true
    })
  })

  describe('sleep', () => {
    it('should sleep for specified milliseconds', async () => {
      const start = Date.now()
      await UF.sleep(100)
      const end = Date.now()
      expect(end - start).to.be.at.least(95).and.at.most(111)
    })

    it('should sleep for one tick when nextTick is true', async () => {
      const start = Date.now()
      await UF.sleep(100, true)
      const end = Date.now()

      expect(end - start).to.be.at.least(95).and.at.most(111)
    })

    it('should return true', async () => {
      const result = await UF.sleep(1)
      expect(result).to.be.true
    })
  })

  describe('slurp', () => {
    it('should collect all values from iterable', async () => {
      const arr = ['a', 'b', 'c']
      const result = await UF.slurp(arr)

      expect(result).to.deep.equal(['a', 'b', 'c'])
    })

    it('should collect all values from async iterable', async () => {
      const asyncIter = (async function* () {
        yield 'a'
        yield 'b'
        yield 'c'
      })()

      const result = await UF.slurp(asyncIter)

      expect(result).to.deep.equal(['a', 'b', 'c'])
    })
  })

  describe('slurpWithResult', () => {
    it('should collect values and return value from iterator', async () => {
      const iter = (function* () {
        yield 'a'
        yield 'b'
        return 'final'
      })()

      const result = await UF.slurpWithResult(iter)

      expect(result.vals).to.deep.equal(['a', 'b'])
      expect(result.ret).to.equal('final')
    })

    it('should collect values and return value from async iterator', async () => {
      const asyncIter = (async function* () {
        yield 'a'
        yield 'b'
        return 'final'
      })()
      const result = await UF.slurpWithResult(asyncIter)

      expect(result.vals).to.deep.equal(['a', 'b'])
      expect(result.ret).to.equal('final')
    })

    it('should handle empty iterator', async () => {
      const iter = (function* () {
        return 'empty'
      })()
      const result = await UF.slurpWithResult(iter)
      expect(result.vals).to.deep.equal([])
      expect(result.ret).to.equal('empty')
    })
  })
})