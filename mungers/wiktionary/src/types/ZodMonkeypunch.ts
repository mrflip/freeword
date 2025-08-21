import type { ParseParams } from 'zod'
import type { ParseReport } from './CoreTypes.ts'

declare module "zod" {
  // @ts-expect-error WONTFIX -- this is a monkeypatch // @ts-ignore
  interface ZodType<Output = any, _Def extends ZImp.ZodTypeDef = ZImp.ZodTypeDef, Input = Output> {
    checkname:      string

    report<RT, Paths extends string>(subj:   RT, story?: Record<string, any> | undefined, params?: Partial<ParseParams> | undefined): ParseReport<RT, Paths>
    check(subj: any,   story?: Record<string, any> | undefined, params?: Partial<ParseParams> | undefined): boolean
    cast(data: Input,  story?: Record<string, any> | undefined, params?: Partial<ParseParams> | undefined): Output
    passthrough(): this
  }
}