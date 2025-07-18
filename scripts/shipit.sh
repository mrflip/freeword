#!/bin/bash
SCRIPTDIR="$(realpath $(dirname $0))"
MAINDIR="$(realpath $(dirname $SCRIPTDIR))"
FWVER=$(cat $MAINDIR/VERSION.txt)

$SCRIPTDIR/version-extract.sh

yarn workspaces foreach --all run build
# yarn workspace internals rcun test --verbose=false

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

grep '"version"' package.json */package.json */*/package.json || true
echo "VERSION: ${FWVER-'(none)'} VERSIONSTRAT: ${VERSIONSTRAT:-'(none)'} NPMTAG: ${NPMTAG:-'(none)'}"
#
yarn workspaces foreach --all version $FWVER
yarn workspaces foreach --all run npm version $FWVER --force --allow-same-version
#
grep '"version"' package.json */package.json */*/package.json || true

# yarn workspaces foreach --all run shipme --access public --dry-run --verbose=false
