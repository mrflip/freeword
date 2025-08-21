import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import type * as TY                               from '@freeword/meta'
import      { UF }                                from '@freeword/meta'
import      * as WiktionaryMunger                 from '@freeword/mungers-wiktionary'
import      * as TH                               from '../../TestHelpers.ts'

export type ObjShape1<VT>  = Record<string, "string" | "number" | "boolean" | "array" | Record<string, "string" | "number" | "boolean" | "array" | VT>>
export type ObjShape       = ObjShape1<ObjShape1<ObjShape1<ObjShape1<any>>>>
export type ObjCounts1<VT> = Record<string, number | Record<string, number | VT>>
export type ObjCounts      = ObjCounts1<ObjCounts1<ObjCounts1<ObjCounts1<any>>>>

function classifyObj(raw: Record<string, any>, shape: ObjShape = {}, counts: ObjCounts = {}) {
  if (_.isString(raw))  { return "string"  }
  if (_.isNumber(raw))  { return "number"  }
  if (_.isBoolean(raw)) { return "boolean" }
  // shape._counts ||= {}
  _.each(raw, (val, key) => {
    if (_.isString(val))  { shape[key] ||= "string";  counts[key] ||= 0; (counts as TY.Bag<number>)[key]! += 1; return }
    if (_.isNumber(val))  { shape[key] ||= "number";  counts[key] ||= 0; (counts as TY.Bag<number>)[key]! += 1; return }
    if (_.isBoolean(val)) { shape[key] ||= "boolean"; counts[key] ||= 0; (counts as TY.Bag<number>)[key]! += 1; return }
    shape[key]  ||= {}; const subshape  = shape[key]  as ObjShape
    counts[key] ||= {}; const subcounts = counts[key] as Record<string, number>
    subcounts._self ||= 0; subcounts._self += 1
    if (_.isArray(val)) {
      _.each(val, (valItem) => {
        const valshape = classifyObj(valItem, subshape, subcounts)
        if (_.isString(valshape)) { shape[key] = { _array: "array", of: valshape }; return }
        _.merge(subshape, valshape)
        subshape._array = "array"
      })
      counts[key] = subcounts // counts[key] = UF.bagsort(subcounts, _.last, { sortdirs: ['desc'] }) as any
      return
    }
    if (_.isObject(val)) {
      const valshape = classifyObj(val, subshape, subcounts)
      if (_.isString(valshape)) { shape[key] = valshape as "string"; return }
      _.merge(subshape, valshape)
      counts[key] = subcounts // counts[key] = UF.bagsort(subcounts, _.last, { sortdirs: ['desc'] })
      return
    }
    if (_.isUndefined(shape[key])) { return }
    // @ts-expect-error
    if (_.isString(shape[key])) { shape[key] = { oops: [] as any[], was: shape[key] }; return }
    ; (shape[key] as any).oops = [] as any[]
    ; (shape[key] as any).oops.push(val)
    counts[key] = subcounts // counts[key] = UF.bagsort(subcounts, _.last, { sortdirs: ['desc'] })
  })
  return shape
}

function logFlatly(title: string, obj: any) { console.log(title, ..._.flatten(_.entries(obj))) }

describe('mungers/wiktionary/ExtractRaw extractin raw Wiktionary data from Kaikki.org', () => {
  const keys = {} as Record<string, "string" | "number" | "boolean" | string[] | Record<string, any>>
  it('should process all records successfully', async () => {
    const mergedShape = {} as ObjShape; const mergedCounts = {} as ObjCounts
    //
    const startCount = 0; const maxRecords = 50_000
    for await (const raw of WiktionaryMunger.loadRawWiktionary('full', startCount, maxRecords)) {
      classifyObj(raw, mergedShape, mergedCounts)
    }
    console.log('extraction stats', UF.prettify(UF.bagsort(WiktionaryMunger.Bucket)))
    const { senses:sensesCounts, descendants:descendantsCounts, etymology:etymologyCounts, ...restCounts } = mergedCounts as any
    console.log(
      UF.prettify(restCounts),   "\n\n",
      UF.prettify(sensesCounts), "\n\n",
      UF.prettify(descendantsCounts.desctrees?.parts), "\n\n",
      UF.prettify(etymologyCounts.records))
  }, 800_000)

  it('should be stable', async () => {
    const mergedShape = {} as ObjShape; const mergedCounts = {} as ObjCounts ; // let count = 0
    const results = [] as WiktionaryMunger.WktLemma[]
    for await (const raw of WiktionaryMunger.loadRawWiktionary('some')) { // count += 1 ; if (count > 10) { break }
      classifyObj(raw, mergedShape, mergedCounts)
    }
    expect(TH.checkSnapshot(results)).to.be.true
    expect(TH.checkSnapshot(mergedShape)).to.be.true
    expect(TH.checkSnapshot(mergedCounts)).to.be.true
  }, 200_000)
})