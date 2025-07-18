#!/bin/bash
SCRIPTDIR="$(realpath $(dirname $0))"
MAINDIR="$(realpath $(dirname $SCRIPTDIR))"

yarn workspaces foreach --all run build
# yarn workspace internals rcun test --verbose=false

# Find the version of main package, and stamp it on all the other packages
$SCRIPTDIR/version-extract.sh $MAINDIR/package.json
$SCRIPTDIR/version-extract.sh $MAINDIR/meta/package.json
MAINVER=$(cat $MAINDIR/VERSION.txt)
METAVER=$(cat $MAINDIR/meta/VERSION.txt)
echo "MAINVER: $MAINVER METAVER: $METAVER"
$SCRIPTDIR/version-clobber.sh "^$METAVER"
$SCRIPTDIR/version-show.sh || true
#
yarn workspaces foreach --all version "$MAINVER"
yarn workspaces foreach --all run npm version $MAINVER --force --allow-same-version
#
$SCRIPTDIR/version-show.sh || true

yarn workspaces foreach --all run shipme --access public --verbose=false # "$@"

$SCRIPTDIR/version-clobber.sh "workspace:*"
$SCRIPTDIR/version-show.sh || true


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