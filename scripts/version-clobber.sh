#!/bin/bash

# Usage: .scripts/version-clobber.sh <version>
# Example: .scripts/version-clobber.sh 1.2.3
# Example: .scripts/version-clobber.sh 'workspace:*'

if [ $# -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.2.3"
    exit 1
fi

FWVER="$1"
SCRIPTDIR=$(realpath $(dirname $0))
MAINDIR=$(realpath $(dirname $SCRIPTDIR))
AWAYDIR=/tmp/freeword-scripts/version-clobber/version-clobber-$(date +%s)
mkdir $AWAYDIR

# Find all package.json files in repos/*/ and update @freeword/meta version
for repo in $MAINDIR/repos/*  ; do
  reponame=$(basename "$repo")
  package_json="$repo/package.json"
  echo "Updating $package_json with version $FWVER"

  # Replace "@freeword/meta": "x.y.z" with "@freeword/meta": "$FWVER"
  sed -i.bak "s/\"@freeword\/meta\": *\"[^\"]*\"/\"@freeword\/meta\": \"$FWVER\"/g" "$package_json"

  # Remove backup file
  mkdir -p $AWAYDIR/$reponame
  mv "${package_json}.bak" $AWAYDIR/$reponame/package.json

  echo "Updated $package_json; saved backup to $AWAYDIR/$reponame/package.json"
done

echo "All package.json files updated with @freeword/meta version $FWVER"