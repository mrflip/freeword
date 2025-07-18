#!/bin/bash

SCRIPTDIR=$(realpath $(dirname $0))
MAINDIR=$(realpath $(dirname $SCRIPTDIR))
VERSIONFILE=$MAINDIR/VERSION.txt

# Read version from VERSION.txt
VERSION=$(cat $VERSIONFILE)

if [ -z "$VERSION" ]; then
    echo 1>&2 "Error: No version found in $VERSIONFILE"
    exit 1
fi

export FWVER="$VERSION"
echo "FWVER=$VERSION"
