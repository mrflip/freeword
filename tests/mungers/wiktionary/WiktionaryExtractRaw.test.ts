import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import      { promises as fs }                    from 'fs'
import      path                                  from 'path'
import      os                                    from 'os'
import type * as TY                               from '@freeword/meta'
import      { Filer, UF }                             from '@freeword/meta'
import      * as WiktionaryMunger                    from '@freeword/mungers-wiktionary'

export type ObjShape1<VT> = Record<string, "string" | "number" | "boolean" | "array" | Record<string, "string" | "number" | "boolean" | "array" | VT>>
export type ObjShape  = ObjShape1<ObjShape1<ObjShape1<ObjShape1<any>>>> & { _counts: Record<string, number> }

function classifyObj(raw: Record<string, any>, shape: ObjShape = { _counts: {} }) {
  if (_.isString(raw))  { return "string"  }
  if (_.isNumber(raw))  { return "number"  }
  if (_.isBoolean(raw)) { return "boolean" }
  shape._counts ||= {}
  _.each(raw, (val, key) => {
    shape._counts[key] ||= 0; shape._counts[key]++
    if (_.isString(val))  { shape[key] ||= "string"; return }
    if (_.isNumber(val))  { shape[key] ||= "number"; return }
    if (_.isBoolean(val)) { shape[key] ||= "boolean"; return }
    shape[key] ||= { _counts: {} }
    const subshape = shape[key] as ObjShape
    if (_.isArray(val)) {
      _.each(val, (valItem) => {
        const valshape = classifyObj(valItem, subshape)
        if (_.isString(valshape)) { shape[key] = { _array: "array", of: valshape }; return }
        _.merge(subshape, valshape)
        subshape._array = "array"
      subshape._counts = UF.bagsort(subshape._counts, _.last, { sortdirs: ['desc'] })
      })
      return
    }
    if (_.isObject(val)) {
      const valshape = classifyObj(val, subshape)
      if (_.isString(valshape)) { shape[key] = valshape as "string"; return }
      _.merge(subshape, valshape)
      subshape._counts = UF.bagsort(subshape._counts, _.last, { sortdirs: ['desc'] })
      return
    }
    ; (shape[key] as any).oops = [] as any[]
    ; (shape[key] as any).oops.push(val)
  })
  shape._counts = UF.bagsort(shape._counts, _.last, { sortdirs: ['desc'] })
  return shape
}

describe('mungers/wiktionary/ExtractRaw', () => {
  const keys = {} as Record<string, "string" | "number" | "boolean" | string[] | Record<string, any>>
  it('should extract raw Wiktionary data from Kaikki.org', async () => {
    const mergedShape = { _counts: {} } as ObjShape
    let count = 0
    for await (const raw of WiktionaryMunger.loadRawWiktionary('some')) {
      count += 1
      // if (count <  80_000) { continue }
      if (count > 100_000) { break }
      const shape = classifyObj(raw, mergedShape)
      // console.log(...(raw.senses || []))
      console.log(_.omit(raw, 'senses'), ...(raw.senses || []))
      // _.merge(mergedShape, shape)
    }
    console.log(WiktionaryMunger.Bucket)
    const { senses, ...shape } = mergedShape
    console.log(shape, senses)
  }, 50_000)
})