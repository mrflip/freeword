import      _                                /**/ from 'lodash'
import type * as TY                               from '../types.ts'
const Rot13Map: Record<TY.AtoZlo, string> = {
  a: 'n', b: 'o', c: 'p', d: 'q', e: 'r', f: 's', g: 't', h: 'u', i: 'v', j: 'w', k: 'x', l: 'y', m: 'z',
  n: 'a', o: 'b', p: 'c', q: 'd', r: 'e', s: 'f', t: 'g', u: 'h', v: 'i', w: 'j', x: 'k', y: 'l', z: 'm',
}

/** ROT-13: trivially obscure/decode a string by mapping a->n, b->o, ..., m->z, n->a, ..., z->m. Installation is the reverse of removal. */
export function rot13Word(str: string): string {
  if (! _.isString(str)) { return str }
  return str.toLowerCase().replace(/[a-z]/g, ((char: TY.AtoZlo) => Rot13Map[char]) as any)
}

const Z = 'z'.charCodeAt(0)
/** ROT-13: trivially obscure/decode a string by mapping a->n, b->o, ..., m->z, n->a, ..., z->m. Installation is the reverse of removal. */
export function rotNWord(str: string, by: number): string {
  return str.toLowerCase().replace(/[a-z]/g, ((char: TY.AtoZlo) => {
    const shifted = char.charCodeAt(0) + by
    return String.fromCharCode((shifted > Z) ? (shifted - 26) : shifted)
  }) as any)
}
