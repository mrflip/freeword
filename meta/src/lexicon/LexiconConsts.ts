import      _                                /**/ from 'lodash'
import type * as TY                               from '../types.ts'
//
export *                                          from '../UtilityConsts.ts'

export const Poskinds     = [
  'noun',     'verb',     'adj',      'adv',      'intj',      'num',
  'symbol',   'name',     'prep',     'prefix',   'particle',  'art',      'advph',
  'pron',     'phrase',   'det',      'conj',     'suffix',    'proverb',  'prepph',
  'punct',    'infix',    'postp',    'interfix', 'char',      'cont',
] as const

export const PosStemkinds = {
  adj:    [
    'adj_core', 'adj_ier', 'adj_iest', 'adj_er', 'adj_est', 'adj_ic', 'adj_ish',
    'adj_ed', 'adj_ing', 'adj_ly', 'adj_irr', 'adj_able', 'adj_ible', 'adj_al', 'adj_ility',
    'adj_ary', 'adj_ery', 'adj_ous', 'adj_ive', 'adj_sy', 'adj_ny',
    'adj_ian', 'adj_ean', 'adj_ar', 'adj_ose', 'adj_chy', 'adj_nty', 'adj_like',
    'adj_isty', 'adj_istier', 'adj_istiest', 'adj_oid',
  ],
  adv:    [
    'adv_core', 'adv_ily', 'adv_ly', 'adv_irr', 'adv_ier', 'adv_iest', 'adv_er', 'adv_est',
  ],
  noun:   [
    'n_core',    'n_sing', 'n_pl_s',   'n_pl_es', 'n_pl_i', 'n_pl_ata', 'n_both',
    'n_pl_men',  'n_pl_ae', 'n_pl_ia', 'n_pl_a', 'n_irr', 'n_pl_ot', 'n_pl_chen',
    'n_pl_eaux', 'n_pl_ieux', 'n_pl_oix', 'n_pl_sful', 'n_pl_yim', 'n_pl_khot', 'n_ist',
    'n_s_er',    'n_pl_ers', 'n_s_ic', 'n_s_ing', 'n_pl_ings', 'n_s_y', 'n_s_ness',
  ],
  verb:   [
    'v_core',   'v_pl_es', 'v_pl_s',  'v_ing', 'v_ed', 'v_xt', 'v_pt',
    'v_irr', 'v_en',
  ],
  intj:     ['intj_core',     'intj_irr'],
  prep:     ['prep_core',     'prep_irr'],
  conj:     ['conj_core',     'conj_irr'],
  pron:     ['pron_core',     'pron_irr'],
  art:      ['art_core',      'art_irr'],
  char:     ['char_core',     'char_irr'],
  advph:    ['advph_core',    'advph_irr'],
  prepph:   ['prepph_core',   'prepph_irr'],
  cont:     ['cont_core',     'cont_irr'],
  phrase:   ['phrase_core',   'phrase_irr'],
  det:      ['det_core',      'det_irr'],
  suffix:   ['suffix_core',   'suffix_irr'],
  proverb:  ['proverb_core',  'proverb_irr'],
  interfix: ['interfix_core', 'interfix_irr'],
  symbol:   ['symbol_core',   'symbol_irr'],
  num:      ['num_core',      'num_irr'],
  name:     ['name_core',     'name_irr'],
  prefix:   ['prefix_core',   'prefix_irr'],
  particle: ['particle_core', 'particle_irr'],
  postp:    ['postp_core',    'postp_irr'],
  infix:    ['infix_core',    'infix_irr'],
  punct:    ['punct_core',    'punct_irr'],
} as const satisfies { readonly [poskind in TY.Poskind]: readonly string[] }

export const Stemkinds: TY.Stemkind[] = Object.values(PosStemkinds).flat()

/** Regular expressions for suffixes that match each stemkind */
export const SuffixREForStemkind: Record<TY.Stemkind, RegExp> = {
  adj_core:    /.$/, adj_ier: /ier$/, adj_iest: /iest$/, adj_er: /er$/, adj_est: /est$/,
  adj_ic:      /ic$/, adj_ish: /ish$/, adj_ly: /ly$/, adj_ed: /ed$/, adj_ing: /ing$/,
  adj_ary:     /ary$/, adj_ery: /ery$/, adj_ous: /ous$/,
  adj_able:    /able$/, adj_ible: /ible$/,  adj_al: /al$/, adj_ility: /ility$/,
  adj_ive:     /ive$/, adj_sy: /sy$/, adj_ny: /ny$/,
  adj_ian:     /ian$/, adj_ean: /ean$/, adj_ar: /ar$/, adj_ose: /ose$/, adj_chy: /chy$/,
  adj_nty:     /nty$/, adj_like: /like$/, adj_oid: /oid$/,
  adj_isty:    /isty$/, adj_istier: /istier$/, adj_istiest: /istiest$/,
  //
  adv_core:    /.$/, adv_ily: /ily$/, adv_ly: /ly$/, adv_ier: /ier$/, adv_iest: /iest$/, adv_er: /er$/, adv_est: /est$/,
  //
  n_core:      /.$/, n_sing:  /.$/,   n_pl_s: /s$/,  n_pl_es: /es$/, n_pl_i: /i$/, n_pl_ata: /ata$/, n_both: /.$/,
  n_pl_men:    /men$/, n_pl_ae: /ae$/, n_pl_ia: /ia$/, n_pl_a: /a$/,
  n_pl_ot:     /oth?$/, n_pl_yim: /y?im$/, n_pl_chen: /(?:chen|shen)$/, n_pl_khot: /khot$/,
  n_pl_eaux:   /eaux$/, n_pl_ieux: /ieux$/, n_pl_oix: /oix$/,
  n_pl_sful:  /sful$/,
  n_ist:       /ist$/, n_s_ing: /ing$/, n_pl_ings: /ings$/,
  n_s_er:      /er$/, n_pl_ers: /ers$/, n_s_ic: /ic$/,
  n_s_y:       /y$/, n_s_ness: /ness$/,
  //
  v_core:      /.$/, v_pl_es: /es$/,  v_pl_s: /s$/,   v_ing: /ing$/, v_ed: /ed$/,
  v_xt:        /xt$/, v_pt: /pt$/,
  v_irr:       /(.)$/, v_en: /en$/,
  intj_core:   /.$/,
  adj_irr:     /.$/,  adv_irr:     /.$/,  n_irr:       /.$/,  intj_irr:  /.$/,
  prep_core:   /.$/, prep_irr:    /.$/,
  conj_core:   /.$/, conj_irr:    /.$/,
  pron_core:   /.$/, pron_irr:    /.$/,
  art_core:    /.$/, art_irr:     /.$/,
  char_core:   /.$/, char_irr:    /.$/,
  advph_core:  /.$/, advph_irr:   /.$/,
  prepph_core: /.$/, prepph_irr: /.$/,
  cont_core:   /.$/, cont_irr:   /.$/,
  phrase_core: /.$/, phrase_irr: /.$/,
  det_core:    /.$/, det_irr:    /.$/,
  suffix_core: /.$/, suffix_irr: /.$/,
  proverb_core: /.$/, proverb_irr: /.$/,
  interfix_core: /.$/, interfix_irr: /.$/,
  symbol_core: /.$/, symbol_irr: /.$/,
  num_core:    /.$/, num_irr:    /.$/,
  name_core:   /.$/, name_irr:   /.$/,
  prefix_core: /.$/, prefix_irr: /.$/,
  particle_core: /.$/, particle_irr: /.$/,
  postp_core:    /.$/, postp_irr:    /.$/,
  infix_core:    /.$/, infix_irr:    /.$/,
  punct_core:    /.$/, punct_irr:    /.$/,
} as const
