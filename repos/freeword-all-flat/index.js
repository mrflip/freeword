/** @type {import('./types.ts').WordformFlat[]} */
import  WordformsAllFlat from './db/freeword-all-flat.json' with { type: 'json' }

/** @type {Record<string, @import('./types.ts').WordformT>} */
export const Wordforms = Object.fromEntries(WordformsAllFlat.map(
  ([word, core, pos, stemkind, suffix, stemcore, stemsplit, wordbits, freq, gloss]) => (
  [word, { word, core, pos, stemkind, suffix, stemcore, stemsplit, wordbits, freq, gloss }]
)))
export default Wordforms