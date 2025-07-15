import type { Poskind, StemkindsForPosT } from "./WordformTypes.d.ts"

export declare const Poskinds:          readonly Poskind[]
export declare const StemkindsForPos: { readonly [poskind in Poskind]: readonly StemkindsForPosT[poskind][] }