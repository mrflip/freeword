export SCRIPTDIR=$(realpath $(dirname $0))     # /freeword/mungers/wiktionary/scripts
export PROJDIR=$(realpath   $SCRIPTDIR/..)     # /freeword/mungers/wiktionary
export MAINDIR=$(realpath   $PROJDIR/../..)    # /freeword

export PROJNAME=${PROJNAME:-$(basename $PROJDIR)}

export    RIPDIR=$MAINDIR/rip
export    RAWDIR=$PROJDIR/raw
mkdir -p $RIPDIR $MAINDIR/raw/$PROJNAME
ln -nsfv ../../raw/$PROJNAME $RAWDIR
# ( cd $PROJDIR ; ln -sf ../../raw/$PROJNAME $RAWDIR )

# echo 2>&1 "SCRIPTDIR: $SCRIPTDIR PROJDIR: $PROJDIR RIPDIR: $RIPDIR RAWDIR: $RAWDIR"