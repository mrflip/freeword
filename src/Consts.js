
export const Poskinds     = [
  'adj', 'adv', 'verb', 'noun', 'intj', 'prep', 'conj', 'pron', 'art',
] // as const
export const StemkindsForPos = {
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
  intj: ['intj_core', 'intj_irr'],
  prep:   ['prep_core', 'prep_irr'],
  conj:   ['conj_core', 'conj_irr'],
  pron:   ['pron_core', 'pron_irr'],
  art:    ['art_core', 'art_irr'],
} // as const satisfies { [key in Poskind]: StemkindFor }
