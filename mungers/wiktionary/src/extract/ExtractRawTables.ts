//

export const templateNameAliases: Record<string, string> = {
  inh:   'inherited',  'inh+':   'inherited',
  com:   'compound',   'com+':   'compound',
  der:   'derived',    'der+':   'derived',     uder:  'derived',
  bor:   'borrowed',   'bor+':   'borrowed',    lbor:  'borrowed',  ubor:  'borrowed',
  af:    'affix',      'af+':    'affix',
  cog:   'cognate',    'cog+':   'cognate',
  suf:   'suffix',     'suf+':   'suffix',
  pre:   'prefix',     'pre+':   'prefix',
  dbt:   'doublet',    'dbt+':   'doublet',
  m:     'mention',    'm+':     'mention',
  coin: 'coinage',     con:   'confix', cal:   'calque', onom: 'onomatopoeic', glos: 'glossary',
  abbrev: 'abbreviation',
  'piecewise doublet': 'doublet',
  unc:   'uncertain',
  'surface analysis': 'surf',
  ncog: 'noncognate', noncog: 'noncognate',
  unk:   'unknown',
  'named-after': 'named_after',
  'PIE word': 'pie_word',
  //
  'col-top': 'skip', 'sup': 'skip', smallcaps: 'skip', small: 'skip', lang: 'skip', lena: 'skip', langname: 'skip',
}