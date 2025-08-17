import      _                                /**/ from 'lodash'
import      * as UF                               from '../utils/UF.ts'
import type * as TY                               from '../types.ts'
import      { starlines }                         from '../lib/Filer.ts'
import type { Wordform }                          from './Wordform.ts'

export class LemmaDef {
  /** core word, eg. `accede` */ declare core:        TY.Word
  /** word forms,             */ declare wordforms:   Wordform[]
  /** odd properties          */ declare tmi:         TY.AnyBag
  /** false if parse failed   */ declare ok:          boolean

  get words()      { return _.map(this.wordforms, 'word') }
  get stemcores()  { return _.map(this.wordforms, 'stemcore') }
  get suffixes()   { return _.map(this.wordforms, 'suffix') }
  get poses()      { return _.map(this.wordforms, 'pos') }
  get stemkinds()  { return _.map(this.wordforms, 'stemkind') }
  get stemsplits() { return _.map(this.wordforms, 'stemsplit') }

  static make<RT extends LemmaDef>(this: { new(rawline: string): RT }, rawline: string): RT { return new this(rawline) as RT }

  parseRawLine(): this { return this }

  prettyA({ indent = '' }: { indent?: string } = {}): string {
    return indent + _.map(this.wordforms, 'pretty').join(',\n' + indent) + ','
  }
  get pretty() { return this.prettyA({ indent: '  ' }) }

  static async *parseDictStar<RT extends LemmaDef>(this: { new(rawline: string): RT }, rawlines: AsyncIterable<string> | Iterable<string>): AsyncGenerator<RT, { oopsies: RT[], oopsieCount: number }> {
    let oopsieCount = 0
    const oopsies: RT[] = []
    for await (const rawline of rawlines) {
      const def = (this as any as LemmaDefFactory<RT>).make(rawline) as RT
      def.parseRawLine()
      if (def.ok) { yield def }
      else        { oopsies.push(def); oopsieCount++ }
      if (oopsieCount >= 30) { console.error('halting at 30 oopsies: things like', _.first(oopsies)); break }
    }
    return { oopsies, oopsieCount }
  }

  static async slurpLexicon<RT extends LemmaDef>(this: { new(rawline: string): RT }, filename: string): Promise<ParseDictResult<RT>> {
    const { vals: defs, ret } = await UF.slurpWithResult<RT, OppsieResult<RT>>((this as any as LemmaDefFactory<RT>).parseDictStar(starlines(filename)))
    return { ...ret, defs }
  }

  static parseDict<RT extends LemmaDef>(this: { make: (rawline: string) => RT }, rawlines: string[]): ParseDictResult<RT> {
    let oopsieCount = 0
    const oopsies: RT[] = []
    const defs:    RT[] = []
    for (const rawline of rawlines) {
      const def = this.make(rawline) as RT
      def.parseRawLine()
      if (def.ok) { defs.push(def) }
      else        { oopsies.push(def); oopsieCount++ }
    }
    return { oopsies, defs, oopsieCount }
  }
}

export interface OppsieResult<RT extends LemmaDef> { oopsies: RT[], oopsieCount: number }
export interface ParseDictResult<RT extends LemmaDef> extends OppsieResult<RT> { defs: RT[] }
export type LemmaDefFactory<RT extends LemmaDef> = {
  new   (rawline: string):     RT,
  make: (rawline: string) => RT,
  parseDictStar: (rawlines: TY.AnyIterable<string>) => AsyncGenerator<RT, OppsieResult<RT>, any>
  parseDict:     (rawlines: string[])            => ParseDictResult<RT>
}
