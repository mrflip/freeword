#!/bin/bash
SCRIPTDIR=$(realpath $(dirname $0))
MAINDIR=$(realpath $(dirname $SCRIPTDIR))

package_json=${1:-$MAINDIR/package.json}
workdir=$(dirname $package_json)
VERSIONFILE=$workdir/VERSION.txt

# Extract version from package.json using grep/sed and write to VERSION.txt
VERSION=$(grep '"version": ' $package_json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')

if [ -z "$VERSION" ]; then
    echo 1>&2 "Error: No version found in package.json"
    exit 1
fi

# Write to VERSION.txt
echo "$VERSION" > $VERSIONFILE
echo 1>&2 "Version $VERSION written to $VERSIONFILE -- $(cat $VERSIONFILE)"
echo $VERSION
