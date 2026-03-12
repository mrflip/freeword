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

  it('is disabled', () => { expect(true).to.be.true })

  // it('should process all records successfully', async () => {
  //   const mergedshape = {} as objshape; const mergedcounts = {
  //     _self: 0, headword: 0, poskind: 0, langcode: 0, wikipedia: 0, categories: 0,
  //     senses:    { _self: 0, wikidata: 0, senseid: 0, headnum: 0, glosses: 0, wikipedia: 0, qualifier: 0, topics: 0, taxonomic: 0, categories: 0, tags: 0 },
  //     etymology: { _self: 0, text: 0, number: 0, records: {} },
  //   } as objcounts
  //   const ebag: ty.anybag = {
  //     _self: 0, tname: 0, expansion: 0, langcode: 0, rellang: 0, relterm: 0, relterms: {}, poskind: 0, gloss: 0, nats: {}, occs: {}, cats: {}, parts: { _self: 0, relterm: 0, poskind: 0, gloss: 0, senseid: 0, gender: 0, translit: 0, alt: 0 },
  //   }
  //   _.each(wiktionarymunger.genericetymologyrec._def.shape(), (_v, key) => { ebag[key] ??= 0 })
  //   _.each(wiktionarymunger.wktlemma._def.shape(),            (_v, key) => { (mergedcounts as any)[key]                   ??= { _self: 0 } })
  //   _.each(wiktionarymunger.wktsense._def.shape(),            (_v, key) => { (mergedcounts as any).senses[key]            ??= { _self: 0 } })
  //   _.each(wiktionarymunger.etymologyrecsbag._def.shape(),    (_v, key) => { (mergedcounts as any).etymology.records[key] ??= _.clonedeep(ebag) })
  //   console.log(mergedcounts)
  //   //
  //   const startcount = 0; const maxrecords = 1_000_000
  //   for await (const raw of wiktionarymunger.loadrawwiktionary('full', startcount, maxrecords)) {
  //     classifyobj(raw, mergedshape, mergedcounts)
  //   }
  //   console.log('extraction stats', uf.prettify(uf.bagsort(wiktionarymunger.bucket)))
  //   const { senses:sensescounts, descendants:descendantscounts, etymology:etymologycounts, ...restcounts } = mergedcounts as any
  //   _.each(etymologycounts.records, (vv, kk) => { if (vv.parts) { vv.parts = _.pickby(vv.parts) }; etymologycounts.records[kk] = _.omitby(vv, (vv) => (uf.isvoid(vv) || (! vv))) })
  //   console.log(
  //     uf.prettify(restcounts),   "\n\n",
  //     uf.prettify(sensescounts), "\n\n",
  //     uf.prettify(descendantscounts.desctrees?.parts), "\n\n",
  //     uf.prettify(etymologycounts.records))
  // }, 800_000)

  // it('should be stable', async () => {
  //   const mergedshape = {} as objshape; const mergedcounts = {} as objcounts ; // let count = 0
  //   for await (const raw of wiktionarymunger.loadrawwiktionary('most', 0, 800)) { // count += 1 ; if (count > 10) { break }
  //     classifyobj(raw, mergedshape, mergedcounts)
  //   }
  //   expect(th.checksnapshot(mergedshape)).to.be.true
  //   expect(th.checksnapshot(mergedcounts)).to.be.true
  // })

  // it('should have stable values', async () => {
  //   const mergedshape = {} as objshape; const mergedcounts = {} as objcounts ; // let count = 0
  //   const results = [] as wiktionarymunger.wktlemma[]
  //   for await (const raw of wiktionarymunger.loadrawwiktionary('most', 100, 200)) {
  //     results.push(raw)
  //   }
  //   expect(th.checksnapshot(results)).to.be.true
  // })
})