//

import type { WktTemplateName } from '../WiktionaryWordform.ts'

export const templateNameAliases: Record<string, WktTemplateName | 'skip'> = {
  inh:       'inherited',   'inh+':   'inherited',
  com:       'compound',    'com+':   'compound',
  der:       'derived',     'der+':   'derived',     uder:  'derived',   dercat: 'derived',
  bor:       'borrowed',    'bor+':   'borrowed',    lbor:  'borrowed',  ubor:  'borrowed',
  af:        'affix',       'af+':    'affix',
  cog:       'cognate',     'cog+':   'cognate',
  suf:       'suffix',      'suf+':   'suffix',
  pre:       'prefix',      'pre+':   'prefix',
  dbt:       'doublet',     'dbt+':   'doublet',
  m:         'mention',     'm+':     'mention',     q:      'qualifier',  pcal:  'partcalque', 'partial calque': 'partcalque',
  coin:      'coinage',      con:     'confix',     cal:    'calque',     onom:  'onomatopoeic', glos: 'glossary', lg: 'glossary',
  ncog:      'noncognate',   noncog:  'noncognate', unk:   'unknown', unc: 'uncertain',
  abbrev:    'abbrev',       abbr:    'abbrev',
  'abbr of': 'abbrevof',     'abbreviation of':      'abbrevof',
  'surface analysis':     'surf',
  'named-after':          'namedfor',
  'PIE word':             'pieword',
  'compound+':            'compound',
  'piecewise doublet':    'doublet',
  // these are actually legit but are rare and slightly odd
  'aphetic form':   'other', displaced: 'other',  deverbal: 'other',
  'back-formation': 'other', bf: 'other',         'back-form': 'other',
  nonlemma: 'other', psm: 'other',
  rdp:              'other',
  //
  'wp':      'skip', 'en-preposition': 'skip',    'named-after/list':      'skip',  'section link':   'skip', 'number box': 'skip',
  'col-top': 'skip', sup:      'skip', smallcaps: 'skip', small:   'skip', monospace: 'skip', 'quote-book': 'skip',
  'nb...': 'skip', sic:      'skip', mdash: 'skip', ellipsis: 'skip', gentrade: 'skip',
  vern:      'skip', lena:     'skip', lb:        'skip', label:   'skip', lang:    'skip', langname: 'skip', head: 'skip',
  sense:     'skip', s:        'skip', circa2:    'skip', etydate: 'skip', 'C.E.':  'skip', 'B.C.E.': 'skip', 'C.':  'skip', '!':  'skip', ',':      'skip', shitgibbon: 'skip',
  ng:        'skip', gloss:    'skip', gl:        'skip',
  translit: 'skip',  transliteration: 'skip',
  senseno: 'skip', contraction: 'skip',  initialism: 'skip', acronym: 'skip', 'pronunciation spelling of': 'skip',
  'zh-l':   'skip', 'ja-r': 'skip', 'zh-m': 'skip', seeMoreCites: 'skip',
  //
  suffix:    'suffix',    confix:    'confix',    prefix:   'prefix',   affix:     'affix',     surf:       'surf',       compound:     'compound',    clipping: 'clipping', derived: 'derived',
  borrowed:  'borrowed',  inherited: 'inherited', calque:   'calque',   cognate:   'cognate',   noncognate: 'noncognate', root:         'root',        doublet:  'doublet',  blend:   'blend',
  pieword:   'pieword',   taxlink:   'taxlink',   taxfmt:   'taxfmt',   mention:   'mention',   coinage:    'coinage',    namedfor:     'namedfor',    etymon:   'etymon',   etymid:  'etymid',
  qualifier: 'qualifier', unknown:   'unknown',   glossary: 'glossary', uncertain: 'uncertain', other:      'other',      onomatopoeic: 'onomatopoeic',
} as const
