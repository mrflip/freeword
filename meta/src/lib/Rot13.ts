import type * as TY from '../types.ts'
const Rot13Map: Record<TY.A2Zlo, string> = {
  a: 'n', b: 'o', c: 'p', d: 'q', e: 'r', f: 's', g: 't', h: 'u', i: 'v', j: 'w', k: 'x', l: 'y', m: 'z',
  n: 'a', o: 'b', p: 'c', q: 'd', r: 'e', s: 'f', t: 'g', u: 'h', v: 'i', w: 'j', x: 'k', y: 'l', z: 'm',
}

/** ROT-13: trivially obscure/decode a string by mapping a->n, b->o, ..., m->z, n->a, ..., z->m. Installation is the reverse of removal. */
export function rot13word(str: string): string {
  return str.replace(/[a-zA-Z]/g, ((char: TY.A2Zlo) => Rot13Map[char]) as any)
}