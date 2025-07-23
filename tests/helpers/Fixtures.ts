import      _                                /**/ from 'lodash'
//import      * as UF                             from '@/lib/UF'
//import type * as TY                             from '@/lib/types'
import type { WordformT }                         from '@freeword/meta'

export const SpotcheckWords = ['monkeyshines', 'idiomaticnesses', 'aah', 'zzz', 'syzygy', 'slainte', 'twixt', 'ourself', 'the']
export const ExampleWords = [
  'monkeyshines',    /** use for spot-checks                  */
  'more',            /** other spot checks: pos:noun   freq near 2e6 (1_999_448)   */
  'person',          /** other spot checks: pos:noun   freq near 2e5   (200_520)   */
  'joy',             /** other spot checks: pos:verb   freq near 2e4    (20_660)   */
  'thinker',         /** other spot checks: pos:noun   freq near 2e3     (2_000)   */
  'swankily',        /** other spot checks: pos:adv    freq near 2e2       (200)   */
  'slainte',         /** other spot checks: pos:intj                               */
  'twixt',           /** other spot checks: pos:prep                               */
  'ourself',         /** other spot checks: pos:pron                               */
  'because',         /** other spot checks: pos:conj                               */
  'the',             /** highest freq word: pos:art    freq near 5e7 58_784_490    */
  'cushiest',        /** other spot checks: pos:adj    freq near 2e1        (20)   */
  'syzygies',        /** rare, has a fairy low freq (13)                           */
  'are',             /** what it is                                                */
  'mellific',        /** has both a definition and the lowest rank in  freq corpus */
  // start/end checks
  'aah',             /** the first word in the corpus            */
  'aardvark',        /** what the AI thinks of as the first word */
  'zzz',             /** the final word in the corpus            */
  // interesting feature cases
  'set',             /** has a lot going on                      */
  'sheep',           /** own plural                              */
  'quoth',           /** verb with no inflections                */
  'syzygy',          /** rare but has a non-derived frequency    */
  'idiomaticnesses', /** has a lot going on                      */
  // stem-ish cases
  'spoony',          /** several derived terms                   */
  'spooniest',       /** several derived terms                   */
  'spoonily',        /** several derived terms                   */
  'spoonier',        /** several derived terms                   */
  'spoonies',        /** several derived terms                   */
] as const satisfies string[]
export type ExampleWord = typeof ExampleWords[number]

// rg -N "word: *'(more|which|person|incredible|joy|thinker|intermingling|clavichords|chimp|monkeyshines|the|syzygy|aah|zzz|idiomaticnesses|set|sheep|yowza|ourself|quoth|had|haddest|hadst|has|hast|hath|have|haves|having)'" db/freeword-all-byword.js
// aah:              { word: 'aah',            core: 'aah',            pos: 'verb',    stemkind: 'v_core',     suffix: '',             stemcore: 'aah',                stemsplit: 'aah|',              freq:      153, wordbits: 0b00_0000_0000_0000_0000_1000_0001,    gloss: 'to exclaim in amazement, joy, or surprise' },
//     23      |       |       |       15      |
//     |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |

export const ExampleWordforms = {
  monkeyshines: { word: 'monkeyshines', core: 'monkeyshines', pos: 'intj', stemkind: 'intj_irr',  suffix: 'es',        stemcore: 'monkeyshines', stemsplit: 'monkeyshin|es', freq: 11,       wordbits: 0b01_0000_0100_0111_0101_1001_0000, gloss: 'monkeyshines' },
  more:         { word: 'more',         core: 'more',         pos: 'noun', stemkind: 'n_core',    suffix: '',          stemcore: 'more',         stemsplit: 'mor|e',         freq: 1999448,  wordbits: 0b00_0000_0010_0101_0000_0001_0000, gloss: 'a greater amount' },
  person:       { word: 'person',       core: 'person',       pos: 'noun', stemkind: 'n_core',    suffix: '',          stemcore: 'person',       stemsplit: 'person|',       freq: 200520,   wordbits: 0b00_0000_0110_1110_0000_0001_0000, gloss: 'a human being' },
  joy:          { word: 'joy',          core: 'joy',          pos: 'verb', stemkind: 'v_core',    suffix: '',          stemcore: 'joy',          stemsplit: 'joy|',          freq: 20660,    wordbits: 0b01_0000_0000_0100_0010_0000_0000, gloss: 'to rejoice' },
  thinker:      { word: 'thinker',      core: 'thinker',      pos: 'noun', stemkind: 'n_core',    suffix: '',          stemcore: 'thinker',      stemsplit: 'think|er',      freq: 2000,     wordbits: 0b00_0000_1010_0010_0101_1001_0000, gloss: 'one that thinks' },
  swankily:     { word: 'swankily',     core: 'swanky',       pos: 'adv',  stemkind: 'adv_ly',    suffix: 'swankily',  stemcore: 'swankily',     stemsplit: 'swank|ily',     freq: 200,      wordbits: 0b01_0100_0100_0010_1101_0000_0001, gloss: 'swank' },
  slainte:      { word: 'slainte',      core: 'slainte',      pos: 'intj', stemkind: 'intj_core', suffix: '',          stemcore: 'slainte',      stemsplit: 'slaint|e',      freq: 20,       wordbits: 0b00_0000_1100_0010_1001_0001_0001, gloss: 'used to toast one\'s health' },
  twixt:        { word: 'twixt',        core: 'twixt',        pos: 'prep', stemkind: 'prep_core', suffix: '',          stemcore: 'twixt',        stemsplit: 'twixt|',        freq: 48,       wordbits: 0b00_1100_1000_0000_0001_0000_0000, gloss: 'between' },
  ourself:      { word: 'ourself',      core: 'ourself',      pos: 'pron', stemkind: 'pron_core', suffix: '',          stemcore: 'ourself',      stemsplit: 'ourself|',      freq: 106,      wordbits: 0b00_0001_0110_0100_1000_0011_0000, gloss: 'myself used in formal or regal contexts' },
  because:      { word: 'because',      core: 'because',      pos: 'conj', stemkind: 'conj_core', suffix: '',          stemcore: 'because',      stemsplit: 'becaus|e',      freq: 945607,   wordbits: 0b00_0001_0100_0000_0000_0001_0111, gloss: 'for the reason that' },
  the:          { word: 'the',          core: 'the',          pos: 'art',  stemkind: 'art_core',  suffix: '',          stemcore: 'the',          stemsplit: 'th|e',          freq: 58784490, wordbits: 0b00_0000_1000_0000_0000_1001_0000, gloss: 'definite article used to specify or make particular' },
  cushiest:     { word: 'cushiest',     core: 'cushy',        pos: 'adj',  stemkind: 'adj_est',   suffix: 'cushiest',  stemcore: 'cushy',        stemsplit: 'cush|iest',     freq: 20,       wordbits: 0b00_0001_1100_0000_0001_1001_0100, gloss: 'easy' },
  syzygies:     { word: 'syzygies',     core: 'syzygy',       pos: 'noun', stemkind: 'n_pl_s',    suffix: 'gies',      stemcore: 'syzygy',       stemsplit: 'syzyg|ies',     freq: 13,       wordbits: 0b11_0000_0100_0000_0001_0101_0000, gloss: 'the configuration of the earth, moon, and sun lying in a straight line' },
  are:          { word: 'are',          core: 'be',           pos: 'verb', stemkind: 'v_irr',     suffix: 'are',       stemcore: 'be',           stemsplit: '|are',          freq: 4291754,  wordbits: 0b00_0000_0010_0000_0000_0001_0001, gloss: 'to have actuality' },
  mellific:     { word: 'mellific',     core: 'mellific',     pos: 'adj',  stemkind: 'adj_core',  suffix: '',          stemcore: 'mellific',     stemsplit: 'mellif|ic',     freq: 1,        wordbits: 0b00_0000_0000_0001_1001_0011_0100, gloss: 'producing honey' },  //
  aah:          { word: 'aah',          core: 'aah',          pos: 'verb', stemkind: 'v_core',    suffix: '',          stemcore: 'aah',          stemsplit: 'aah|',          freq: 153,      wordbits: 0b00_0000_0000_0000_0000_1000_0001, gloss: 'to exclaim in amazement, joy, or surprise' },
  aardvark:     { word: 'aardvark',     core: 'aardvark',     pos: 'noun', stemkind: 'n_core',    suffix: '',          stemcore: 'aardvark',     stemsplit: 'aardvark|',     freq: 238,      wordbits: 0b00_0010_0010_0000_0100_0000_1001, gloss: 'an African mammal' },
  zzz:          { word: 'zzz',          core: 'zzz',          pos: 'intj', stemkind: 'intj_core', suffix: '',          stemcore: 'zzz',          stemsplit: 'zzz|',          freq: 60,       wordbits: 0b10_0000_0000_0000_0000_0000_0000, gloss: 'used to suggest the sound of snoring' },
  //
  syzygy:       { word: 'syzygy',       core: 'syzygy',       pos: 'noun', stemkind: 'n_core',    suffix: '',          stemcore: 'syzygy',       stemsplit: 'syzyg|y',       freq: 95,       wordbits: 0b11_0000_0100_0000_0000_0100_0000, gloss: 'the configuration of the earth, moon, and sun lying in a straight line' },
  sheep:        { word: 'sheep',        core: 'sheep',        pos: 'noun', stemkind: 'n_both',    suffix: '',          stemcore: 'sheep',        stemsplit: 'sheep|',        freq: 12407,    wordbits: 0b00_0000_0100_1000_0000_1001_0000, gloss: 'a ruminant mammal' },
  quoth:        { word: 'quoth',        core: 'quoth',        pos: 'verb', stemkind: 'v_core',    suffix: '',          stemcore: 'quoth',        stemsplit: 'quoth|',        freq: 54,       wordbits: 0b00_0001_1001_0100_0000_1000_0000, gloss: 'said; _quoth_ is the only accepted form of this verb: it cannot be conjugated' },
  set:          { word: 'set',          core: 'set',          pos: 'verb', stemkind: 'v_core',    suffix: '',          stemcore: 'set',          stemsplit: 'set|',          freq: 373574,   wordbits: 0b00_0000_1100_0000_0000_0001_0000, gloss: 'to put in a particular position' },
  spoony:       { word: 'spoony',       core: 'spoony',       pos: 'noun', stemkind: 'n_core',    suffix: '',          stemcore: 'spoony',       stemsplit: 'spoon|y',       freq: 51,       wordbits: 0b01_0000_0100_1110_0000_0000_0000, gloss: 'a spoony person' },
  spoonier:     { word: 'spoonier',     core: 'spoony',       pos: 'adj',  stemkind: 'adj_er',    suffix: 'spoonier',  stemcore: 'spoony',       stemsplit: 'spoon|ier',     freq: 20,       wordbits: 0b00_0000_0110_1110_0001_0001_0000, gloss: 'overly sentimental' },
  spoonies:     { word: 'spoonies',     core: 'spoony',       pos: 'noun', stemkind: 'n_pl_s',    suffix: 'spoonies',  stemcore: 'spoony',       stemsplit: 'spoon|ies',     freq: 20,       wordbits: 0b00_0000_0100_1110_0001_0001_0000, gloss: 'a spoony person' },
  spooniest:    { word: 'spooniest',    core: 'spoony',       pos: 'adj',  stemkind: 'adj_est',   suffix: 'spooniest', stemcore: 'spoony',       stemsplit: 'spoon|iest',    freq: 20,       wordbits: 0b00_0000_1100_1110_0001_0001_0000, gloss: 'overly sentimental' },
  spoonily:     { word: 'spoonily',     core: 'spoony',       pos: 'adv',  stemkind: 'adv_ly',    suffix: 'spoonily',  stemcore: 'spoonily',     stemsplit: 'spoon|ily',     freq: 20,       wordbits: 0b01_0000_0100_1110_1001_0000_0000, gloss: 'overly sentimental' },
  idiomaticnesses: { word: 'idiomaticnesses', core: 'idiomaticnesses', pos: 'intj', stemkind: 'intj_irr',  suffix: 'icnesses', stemcore: 'idiomaticnesses', stemsplit: 'idiomat|icnesses', freq:       78, wordbits: 0b00_0000_1100_0111_0001_0001_1101, gloss: 'idiomaticnesses' },
} as const satisfies Record<ExampleWord, WordformT>

export const HaveEtc = {
  had:             { word: 'had',             core: 'have',            pos: 'verb', stemkind: 'v_irr',     suffix: 'had',         stemcore: 'have',          stemsplit: 'ha|d',            freq:   2421749, wordbits: 0b00_0000_0000_0000_0000_1000_1001, gloss: 'to be in possession of' },
  haddest:         { word: 'haddest',         core: 'have',            pos: 'verb', stemkind: 'v_irr',     suffix: 'haddest',     stemcore: 'have',          stemsplit: 'ha|ddest',        freq:   1434403, wordbits: 0b00_0000_1100_0000_0000_1001_1001, gloss: 'to be in possession of' },
  has:             { word: 'has',             core: 'have',            pos: 'verb', stemkind: 'v_pl_s',    suffix: 'has',         stemcore: 'have',          stemsplit: 'ha|s',            freq:   3178605, wordbits: 0b00_0000_0100_0000_0000_1000_0001, gloss: 'to be in possession of' },
  hadst:           { word: 'hadst',           core: 'have',            pos: 'verb', stemkind: 'v_irr',     suffix: 'hadst',       stemcore: 'have',          stemsplit: 'ha|dst',          freq:         9, wordbits: 0b00_0000_1100_0000_0000_1000_1001, gloss: 'to be in possession of' },
  hast:            { word: 'hast',            core: 'have',            pos: 'verb', stemkind: 'v_irr',     suffix: 'hast',        stemcore: 'have',          stemsplit: 'ha|st',           freq:       368, wordbits: 0b00_0000_1100_0000_0000_1000_0001, gloss: 'to be in possession of' },
  hath:            { word: 'hath',            core: 'have',            pos: 'verb', stemkind: 'v_irr',     suffix: 'hath',        stemcore: 'have',          stemsplit: 'ha|th',           freq:      1137, wordbits: 0b00_0000_1000_0000_0000_1000_0001, gloss: 'to be in possession of' },
  have:            { word: 'have',            core: 'have',            pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'have',          stemsplit: 'hav|e',           freq:   3586008, wordbits: 0b00_0010_0000_0000_0000_1001_0001, gloss: 'a wealthy person' },
  haves:           { word: 'haves',           core: 'have',            pos: 'noun', stemkind: 'n_pl_s',    suffix: 's',           stemcore: 'have',          stemsplit: 'hav|es',          freq:       671, wordbits: 0b00_0010_0100_0000_0000_1001_0001, gloss: 'a wealthy person' },
  having:          { word: 'having',          core: 'have',            pos: 'verb', stemkind: 'v_ing',     suffix: 'having',      stemcore: 'have',          stemsplit: 'hav|ing',         freq:    310475, wordbits: 0b00_0010_0000_0010_0001_1100_0001, gloss: 'to be in possession of' },
} as const satisfies Record<string, WordformT>

export const SyzygyEtc = {
  syzygal:         { word: 'syzygal',       core: 'syzygy',      pos: 'adj',  stemkind: 'adj_al',    suffix: 'syzygal',     stemcore: 'syzygal',     stemsplit: 'syzyg|al',        freq:     38, wordbits: 0b11_0000_0100_0000_1000_0100_0001, gloss: 'the configuration of the earth, moon, and sun lying in a straight line' },
  syzygetic:       { word: 'syzygetic',     core: 'syzygetic',   pos: 'intj', stemkind: 'intj_irr',  suffix: 'ic',          stemcore: 'syzygetic',   stemsplit: 'syzyget|ic',      freq:      1, wordbits: 0b11_0000_1100_0000_0001_0101_0100, gloss: 'syzygetic' },
  syzygial:        { word: 'syzygial',      core: 'syzygy',      pos: 'adj',  stemkind: 'adj_al',    suffix: 'syzygial',    stemcore: 'syzygal',     stemsplit: 'syzyg|ial',       freq:     38, wordbits: 0b11_0000_0100_0000_1001_0100_0001, gloss: 'the configuration of the earth, moon, and sun lying in a straight line' },
  syzygies:        { word: 'syzygies',      core: 'syzygy',      pos: 'noun', stemkind: 'n_pl_s',    suffix: 'gies',        stemcore: 'syzygy',      stemsplit: 'syzyg|ies',       freq:     13, wordbits: 0b11_0000_0100_0000_0001_0101_0000, gloss: 'the configuration of the earth, moon, and sun lying in a straight line' },
  syzygy:          { word: 'syzygy',        core: 'syzygy',      pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'syzygy',      stemsplit: 'syzyg|y',         freq:     95, wordbits: 0b11_0000_0100_0000_0000_0100_0000, gloss: 'the configuration of the earth, moon, and sun lying in a straight line' },
} as const satisfies Record<string, WordformT>

export const ActEtc = {
  act:             { word: 'act',           core: 'act',         pos: 'verb', stemkind: 'v_core',    suffix: '',            stemcore: 'act',         stemsplit: 'act|',            freq: 152775, wordbits: 0b00_0000_1000_0000_0000_0000_0101, gloss: 'to do something' },
  actable:         { word: 'actable',       core: 'actable',     pos: 'adj',  stemkind: 'adj_core',  suffix: '',            stemcore: 'actable',     stemsplit: 'actabl|e',        freq:      1, wordbits: 0b00_0000_1000_0000_1000_0001_0111, gloss: 'suitable for performance on the stage' },
  acted:           { word: 'acted',         core: 'act',         pos: 'verb', stemkind: 'v_ed',      suffix: 'ed',          stemcore: 'act',         stemsplit: 'act|ed',          freq:  20179, wordbits: 0b00_0000_1000_0000_0000_0001_1101, gloss: 'to do something' },
  acting:          { word: 'acting',        core: 'acting',      pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'acting',      stemsplit: 'act|ing',         freq:  51336, wordbits: 0b00_0000_1000_0010_0001_0100_0101, gloss: 'the occupation of an actor' },
  actings:         { word: 'actings',       core: 'acting',      pos: 'noun', stemkind: 'n_pl_s',    suffix: 's',           stemcore: 'acting',      stemsplit: 'act|ings',        freq:     18, wordbits: 0b00_0000_1100_0010_0001_0100_0101, gloss: 'the occupation of an actor' },
  actor:           { word: 'actor',         core: 'actor',       pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'actor',       stemsplit: 'actor|',          freq:  45184, wordbits: 0b00_0000_1010_0100_0000_0000_0101, gloss: 'a theatrical performer' },
  actorish:        { word: 'actorish',      core: 'actor',       pos: 'adj',  stemkind: 'adj_ish',   suffix: 'actorish',    stemcore: 'actorish',    stemsplit: 'actor|ish',       freq:  18074, wordbits: 0b00_0000_1110_0100_0001_1000_0101, gloss: 'a theatrical performer' },
  actorly:         { word: 'actorly',       core: 'actor',       pos: 'adj',  stemkind: 'adj_ly',    suffix: 'actorly',     stemcore: 'actorish',    stemsplit: 'actor|ly',        freq:     10, wordbits: 0b01_0000_1010_0100_1000_0000_0101, gloss: 'a theatrical performer' },
  actors:          { word: 'actors',        core: 'actor',       pos: 'noun', stemkind: 'n_pl_s',    suffix: 's',           stemcore: 'actor',       stemsplit: 'actor|s',         freq:  28765, wordbits: 0b00_0000_1110_0100_0000_0000_0101, gloss: 'a theatrical performer' },
  actress:         { word: 'actress',       core: 'actress',     pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'actress',     stemsplit: 'actress|',        freq:  26834, wordbits: 0b00_0000_1110_0000_0000_0001_0101, gloss: 'a female actor' },
  actresses:       { word: 'actresses',     core: 'actress',     pos: 'noun', stemkind: 'n_pl_es',   suffix: 'es',          stemcore: 'actress',     stemsplit: 'actress|es',      freq:   3137, wordbits: 0b00_0000_1110_0000_0000_0001_0101, gloss: 'a female actor' },
  actressy:        { word: 'actressy',      core: 'actress',     pos: 'adj',  stemkind: 'adj_sy',    suffix: 'actressy',    stemcore: 'actressy',    stemsplit: 'actress|y',       freq:  10734, wordbits: 0b01_0000_1110_0000_0000_0001_0101, gloss: 'a female actor' },
  acts:            { word: 'acts',          core: 'act',         pos: 'verb', stemkind: 'v_pl_s',    suffix: 's',           stemcore: 'act',         stemsplit: 'act|s',           freq:  44637, wordbits: 0b00_0000_1100_0000_0000_0000_0101, gloss: 'to do something' },
  activate:        { word: 'activate',      core: 'activate',    pos: 'verb', stemkind: 'v_core',    suffix: '',            stemcore: 'activate',    stemsplit: 'activ|ate',       freq:   4336, wordbits: 0b00_0010_1000_0000_0001_0001_0101, gloss: 'to set in motion' },
  activated:       { word: 'activated',     core: 'activate',    pos: 'verb', stemkind: 'v_ed',      suffix: 'vated',       stemcore: 'activate',    stemsplit: 'activ|ated',      freq:   8992, wordbits: 0b00_0010_1000_0000_0001_0001_1101, gloss: 'to set in motion' },
  activates:       { word: 'activates',     core: 'activate',    pos: 'verb', stemkind: 'v_pl_s',    suffix: 'vates',       stemcore: 'activate',    stemsplit: 'activ|ates',      freq:   2040, wordbits: 0b00_0010_1100_0000_0001_0001_0101, gloss: 'to set in motion' },
  activating:      { word: 'activating',    core: 'activate',    pos: 'verb', stemkind: 'v_ing',     suffix: 'vating',      stemcore: 'activate',    stemsplit: 'activ|ating',     freq:   1380, wordbits: 0b00_0010_1000_0010_0001_0100_0101, gloss: 'to set in motion' },
  activation:      { word: 'activation',    core: 'activation',  pos: 'intj', stemkind: 'intj_irr',  suffix: 'ation',       stemcore: 'activation',  stemsplit: 'activ|ation',     freq:   3621, wordbits: 0b00_0010_1000_0110_0001_0000_0101, gloss: 'activation' },
  activations:     { word: 'activations',   core: 'activations', pos: 'intj', stemkind: 'intj_irr',  suffix: 'ations',      stemcore: 'activations', stemsplit: 'activ|ations',    freq:    170, wordbits: 0b00_0010_1100_0110_0001_0000_0101, gloss: 'activations' },
  activator:       { word: 'activator',     core: 'activator',   pos: 'intj', stemkind: 'intj_irr',  suffix: 'ator',        stemcore: 'activator',   stemsplit: 'activ|ator',      freq:    194, wordbits: 0b00_0010_1010_0100_0001_0000_0101, gloss: 'activator' },
  activators:      { word: 'activators',    core: 'activators',  pos: 'intj', stemkind: 'intj_irr',  suffix: 'ators',       stemcore: 'activators',  stemsplit: 'activ|ators',     freq:     79, wordbits: 0b00_0010_1110_0100_0001_0000_0101, gloss: 'activators' },
  active:          { word: 'active',        core: 'active',      pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'active',      stemsplit: 'activ|e',         freq:  85401, wordbits: 0b00_0010_1000_0000_0001_0001_0101, gloss: 'a participating member of an organization' },
  actively:        { word: 'actively',      core: 'actively',    pos: 'adv',  stemkind: 'adv_core',  suffix: '',            stemcore: 'actively',    stemsplit: 'activel|y',       freq:  16400, wordbits: 0b01_0010_1000_0000_1001_0001_0101, gloss: 'with activity' },
  activeness:      { word: 'activeness',    core: 'activeness',  pos: 'intj', stemkind: 'intj_irr',  suffix: 'eness',       stemcore: 'activeness',  stemsplit: 'activ|eness',     freq:     12, wordbits: 0b00_0010_1100_0010_0001_0001_0101, gloss: 'activeness' },
  activenesses:    { word: 'activenesses',  core: 'activenesses', pos: 'intj', stemkind: 'intj_irr',  suffix: 'enesses',     stemcore: 'activenesses', stemsplit: 'activ|enesses',   freq:  56273, wordbits: 0b00_0010_1100_0010_0001_0001_0101, gloss: 'activenesses' },
  actives:         { word: 'actives',       core: 'active',      pos: 'noun', stemkind: 'n_pl_s',    suffix: 's',           stemcore: 'active',      stemsplit: 'activ|es',        freq:    226, wordbits: 0b00_0010_1100_0000_0001_0001_0101, gloss: 'a participating member of an organization' },
  activewear:      { word: 'activewear',    core: 'activewear',  pos: 'intj', stemkind: 'intj_irr',  suffix: '',            stemcore: 'activewear',  stemsplit: 'activewear|',     freq:     25, wordbits: 0b00_0110_1010_0000_0001_0001_0101, gloss: 'activewear' },
  activewears:     { word: 'activewears',   core: 'activewears', pos: 'intj', stemkind: 'intj_irr',  suffix: 's',           stemcore: 'activewears', stemsplit: 'activewear|s',    freq:      5, wordbits: 0b00_0110_1110_0000_0001_0001_0101, gloss: 'activewears' },
  activism:        { word: 'activism',      core: 'activism',    pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'activism',    stemsplit: 'activ|ism',       freq:   4349, wordbits: 0b00_0010_1100_0001_0001_0000_0101, gloss: 'a doctrine that emphasizes direct and decisive action' },
  activisms:       { word: 'activisms',     core: 'activism',    pos: 'noun', stemkind: 'n_pl_s',    suffix: 's',           stemcore: 'activism',    stemsplit: 'activ|isms',      freq:   1740, wordbits: 0b00_0010_1100_0001_0001_0000_0101, gloss: 'a doctrine that emphasizes direct and decisive action' },
  activist:        { word: 'activist',      core: 'activist',    pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'activist',    stemsplit: 'activist|',       freq:  11893, wordbits: 0b00_0010_1100_0000_0001_0000_0101, gloss: 'an advocate of activism' },
  activistic:      { word: 'activistic',    core: 'activistic',  pos: 'intj', stemkind: 'intj_irr',  suffix: 'ic',          stemcore: 'activistic',  stemsplit: 'activist|ic',     freq:   5381, wordbits: 0b00_0010_1100_0000_0001_0000_0101, gloss: 'activistic' },
  activists:       { word: 'activists',     core: 'activist',    pos: 'noun', stemkind: 'n_pl_s',    suffix: 's',           stemcore: 'activist',    stemsplit: 'activist|s',      freq:  15012, wordbits: 0b00_0010_1100_0000_0001_0000_0101, gloss: 'an advocate of activism' },
  activities:      { word: 'activities',    core: 'activity',    pos: 'noun', stemkind: 'n_pl_s',    suffix: 'ties',        stemcore: 'activity',    stemsplit: 'activ|ities',     freq:  88417, wordbits: 0b00_0010_1100_0000_0001_0001_0101, gloss: 'brisk action or movement' },
  activity:        { word: 'activity',      core: 'activity',    pos: 'noun', stemkind: 'n_core',    suffix: '',            stemcore: 'activity',    stemsplit: 'activ|ity',       freq:  65683, wordbits: 0b01_0010_1000_0000_0001_0000_0101, gloss: 'brisk action or movement' },
  activize:        { word: 'activize',      core: 'activize',    pos: 'verb', stemkind: 'v_core',    suffix: '',            stemcore: 'activize',    stemsplit: 'activ|ize',       freq:  56273, wordbits: 0b10_0010_1000_0000_0001_0001_0101, gloss: 'to activate' },
  activized:       { word: 'activized',     core: 'activize',    pos: 'verb', stemkind: 'v_ed',      suffix: 'ized',        stemcore: 'activize',    stemsplit: 'activ|ized',      freq:  56273, wordbits: 0b10_0010_1000_0000_0001_0001_1101, gloss: 'to activate' },
  activizes:       { word: 'activizes',     core: 'activize',    pos: 'verb', stemkind: 'v_pl_s',    suffix: 'izes',        stemcore: 'activize',    stemsplit: 'activ|izes',      freq:  56273, wordbits: 0b10_0010_1100_0000_0001_0001_0101, gloss: 'to activate' },
  activizing:      { word: 'activizing',    core: 'activize',    pos: 'verb', stemkind: 'v_ing',     suffix: 'izing',       stemcore: 'activize',    stemsplit: 'activ|izing',     freq:  56273, wordbits: 0b10_0010_1000_0010_0001_0100_0101, gloss: 'to activate' },
} as const satisfies Record<string, WordformT>

export const CushionEtc = {
  cushier:         { word: 'cushier',       core: 'cushy',       pos: 'adj',  stemkind: 'adj_er',    suffix: 'cushier',     stemcore: 'cushy',       stemsplit: 'cush|ier',        freq:     27, wordbits: 0b00_0001_0110_0000_0001_1001_0100, gloss: 'easy' },
  cushiest:        { word: 'cushiest',      core: 'cushy',       pos: 'adj',  stemkind: 'adj_est',   suffix: 'cushiest',    stemcore: 'cushy',       stemsplit: 'cush|iest',       freq:     20, wordbits: 0b00_0001_1100_0000_0001_1001_0100, gloss: 'easy' },
  cushily:         { word: 'cushily',       core: 'cushily',     pos: 'adv',  stemkind: 'adv_core',  suffix: '',            stemcore: 'cushily',     stemsplit: 'cushil|y',        freq:      1, wordbits: 0b01_0001_0100_0000_1001_1000_0100, gloss: 'in a cushy manner' },
  cushiness:       { word: 'cushiness',     core: 'cushiness',   pos: 'intj', stemkind: 'intj_irr',  suffix: 'ness',        stemcore: 'cushiness',   stemsplit: 'cushi|ness',      freq:    121, wordbits: 0b00_0001_0100_0010_0001_1001_0100, gloss: 'cushiness' },
  cushinesses:     { word: 'cushinesses',   core: 'cushinesses', pos: 'intj', stemkind: 'intj_irr',  suffix: 'nesses',      stemcore: 'cushinesses', stemsplit: 'cushi|nesses',    freq:    121, wordbits: 0b00_0001_0100_0010_0001_1001_0100, gloss: 'cushinesses' },
  cushion:         { word: 'cushion',       core: 'cushion',     pos: 'verb', stemkind: 'v_core',    suffix: '',            stemcore: 'cushion',     stemsplit: 'cushion|',        freq:   4227, wordbits: 0b00_0001_0100_0110_0001_1000_0100, gloss: 'to pad with soft material' },
  cushioned:       { word: 'cushioned',     core: 'cushion',     pos: 'verb', stemkind: 'v_ed',      suffix: 'ed',          stemcore: 'cushion',     stemsplit: 'cushion|ed',      freq:    466, wordbits: 0b00_0001_0100_0110_0001_1001_1100, gloss: 'to pad with soft material' },
  cushioning:      { word: 'cushioning',    core: 'cushion',     pos: 'verb', stemkind: 'v_ing',     suffix: 'ing',         stemcore: 'cushion',     stemsplit: 'cushion|ing',     freq:    309, wordbits: 0b00_0001_0100_0110_0001_1100_0100, gloss: 'to pad with soft material' },
  cushionings:     { word: 'cushionings',   core: 'cushionings', pos: 'intj', stemkind: 'intj_irr',  suffix: 'ings',        stemcore: 'cushionings', stemsplit: 'cushion|ings',    freq:   1216, wordbits: 0b00_0001_0100_0110_0001_1100_0100, gloss: 'cushionings' },
  cushionless:     { word: 'cushionless',   core: 'cushionless', pos: 'intj', stemkind: 'intj_irr',  suffix: '',            stemcore: 'cushionless', stemsplit: 'cushionless|',    freq:     11, wordbits: 0b00_0001_0100_0110_1001_1001_0100, gloss: 'cushionless' },
  cushions:        { word: 'cushions',      core: 'cushion',     pos: 'verb', stemkind: 'v_pl_s',    suffix: 's',           stemcore: 'cushion',     stemsplit: 'cushion|s',       freq:   1080, wordbits: 0b00_0001_0100_0110_0001_1000_0100, gloss: 'to pad with soft material' },
  cushiony:        { word: 'cushiony',      core: 'cushiony',    pos: 'adj',  stemkind: 'adj_core',  suffix: '',            stemcore: 'cushiony',    stemsplit: 'cushion|y',       freq:     15, wordbits: 0b01_0001_0100_0110_0001_1000_0100, gloss: 'soft' },
  cushy:           { word: 'cushy',         core: 'cushy',       pos: 'adj',  stemkind: 'adj_core',  suffix: '',            stemcore: 'cushy',       stemsplit: 'cush|y',          freq:    606, wordbits: 0b01_0001_0100_0000_0000_1000_0100, gloss: 'easy' },
} as const satisfies Record<string, WordformT>

// blank is not a word; this repo does not have
export const NotWords = [
  '',       // blank should not be here but a processing bug might disagree
  'poofs',  // terms considered offensive are published separately
] as const satisfies string[]

// approximate counts
//   art:      1
//   conj:    17
//   pron:    51
//   prep:    62
//   adv:   1799
//   adj:  12759
//   verb: 38592
//   noun: 58876
//   intj: 84979 // this is the 'unk' bin (will fix)
