#!/bin/bash
set -euo pipefail; trap 'lcmd_=${ccmd_-}; ccmd_=$BASH_COMMAND' DEBUG ; trap 'code_=$?; [ $code_ -ne 0 ] && echo -e "\\n***\\nERR \"${lcmd_}\" failed code $code_, while running $(basename $0); see lines above this"' EXIT

export PROJNAME=wiktionary
source $(dirname $0)/_config.sh

GZ_BASEURL=kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz
EN_FULL=$RAWDIR/wiktionary_en_en-full.jsonl.gz
EN_SOME=$RAWDIR/wiktionary_en_en-some.jsonl
EN_MOST=$RAWDIR/wiktionary_en_en-most.jsonl

if [ ! -f $EN_FULL ]; then
  echo 2>&1 "Downloading ~2GB raw Wiktionary data from Kaikki.org to $GZ_BASEURL" ; echo 2>&1 ""
  cd $RIPDIR
  time wget -nc -x https://$GZ_BASEURL

  echo 2>&1 "Filtering to English language words only; may take several minutes"
  cd $RAWDIR
  # time cat $RIPDIR/$GZ_BASEURL     \
  #   | gunzip                  \
  #   | grep 'lang_code": "en"' \
  #   | gzip                    \
  #   > $EN_FULL
fi

echo 2>&1 "Creating $(basename $EN_SOME) with the first 300 lines of $(basename $EN_FULL)"
time (
  set +o pipefail; gzip -dc $EN_FULL | head -n 300 > $EN_SOME ; set -o pipefail
)

echo 2>&1 "Creating $(basename $EN_MOST) with the first 300 lines of $(basename $EN_FULL) and every 100th line thereafter"
time (
  cat $EN_SOME ;
  set +o pipefail; gzip -dc $EN_FULL | tail -n +300 | awk 'NR % 100 == 0' ; set -o pipefail
) > $EN_MOST

echo 2>&1 "Outcome:"
time wc $RAWDIR/*.jsonl
time cat $EN_SOME \
  | jq -n '
    [inputs]
    | map(to_entries)
    | flatten
    | group_by(.key)
    | map({ key: .[0].key, value: (.[0].value | type) })
    | from_entries
  '

trap - ERR EXIT DEBUG; echo 2>&1 "Success!"