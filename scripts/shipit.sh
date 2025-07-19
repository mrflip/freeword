#!/bin/bash
SCRIPTDIR="$(realpath $(dirname $0))"
MAINDIR="$(realpath $(dirname $SCRIPTDIR))"

yarn workspaces foreach --all run build
# yarn workspace internals rcun test --verbose=false

# Find the version of main package, and stamp it on all the other packages
$SCRIPTDIR/version-extract.sh $MAINDIR/package.json
#
MAINVER=$(cat $MAINDIR/VERSION.txt)
yarn workspaces foreach --all --no-private version "$MAINVER"

$SCRIPTDIR/version-extract.sh $MAINDIR/meta/package.json
METAVER=$(cat $MAINDIR/meta/VERSION.txt)
echo "MAINVER: $MAINVER METAVER: $METAVER"

$SCRIPTDIR/version-clobber.sh "^$METAVER"
#
yarn workspaces foreach --all --no-private run npm version $MAINVER --force --allow-same-version
#
$SCRIPTDIR/version-show.sh || true
yarn workspaces foreach --all --no-private run shipme "$@"

# for repodir in $MAINDIR/repos/* $MAINDIR/meta ; do
#   reponame=$(basename $repodir)
#   cd $repodir
#   echo $PWD $reponame
#   npm version $MAINVER --force --allow-same-version
#   npm publish
#   cd $MAINDIR
# done

# $SCRIPTDIR/version-clobber.sh "workspace:*"
# $SCRIPTDIR/version-show.sh || true
