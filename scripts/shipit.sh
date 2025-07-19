#!/bin/bash
SCRIPTDIR="$(realpath $(dirname $0))"
MAINDIR="$(realpath $(dirname $SCRIPTDIR))"

yarn workspaces foreach --all run build
# yarn workspace internals rcun test --verbose=false

# Find the version of main package, and stamp it on all the other packages
$SCRIPTDIR/version-extract.sh $MAINDIR/package.json
#
MAINVER=$(cat $MAINDIR/VERSION.txt)
yarn workspaces foreach --all version "$MAINVER"

$SCRIPTDIR/version-extract.sh $MAINDIR/meta/package.json
METAVER=$(cat $MAINDIR/meta/VERSION.txt)
echo "MAINVER: $MAINVER METAVER: $METAVER"

$SCRIPTDIR/version-clobber.sh "^$METAVER"

#
yarn workspaces foreach --all --no-private run npm version $MAINVER --force --allow-same-version
#
$SCRIPTDIR/version-show.sh || true

# for repodir in $MAINDIR/repos/* $MAINDIR/meta ; do
#   reponame=$(basename $repodir)
#   cd $repodir
#   echo $PWD $reponame
#   npm version $MAINVER --force --allow-same-version
#   npm publish --verbose=false
#   cd $MAINDIR
# done
# $SCRIPTDIR/version-clobber.sh "workspace:*"

# $SCRIPTDIR/version-show.sh || true

# VERSIONSTRAT=${1:-pre}
# if [ "${NPMTAG:-}" = "" ]; then
#   if [ "$VERSIONSTRAT" == "prerelease" ] || [ "$VERSIONSTRAT" == "pre" ]; then
#     VERSIONSTRAT=prerelease
#     NPMTAG=pre
#   elif [ "$VERSIONSTRAT" == "patch" ]; then
#     NPMTAG=latest
#   elif [ "$VERSIONSTRAT" == "minor" ]; then
#     NPMTAG=next
#   elif [ "$VERSIONSTRAT" == "major" ]; then
#     NPMTAG=next
#   fi
# fi