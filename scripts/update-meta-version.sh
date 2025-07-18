#!/bin/bash

# Usage: ./update-meta-version.sh <version>
# Example: ./update-meta-version.sh 1.2.3

if [ $# -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.2.3"
    exit 1
fi

FWVER="$1"
SCRIPTDIR=$(realpath $(dirname $0))
MAINDIR=$(realpath $(dirname $SCRIPTDIR))

# Find all package.json files in repos/*/ and update @freeword/meta version
find $MAINDIR/repos/*/package.json -type f 2>/dev/null | while read -r file; do
    echo "Updating $file with version $FWVER"

    # Replace "@freeword/meta": "x.y.z" with "@freeword/meta": "$FWVER"
    sed -i.bak "s/\"@freeword\/meta\": \"[^\"]*\"/\"@freeword\/meta\": \"$FWVER\"/g" "$file"

    # Remove backup file
    rm -f "$file.bak"

    echo "Updated $(basename $(dirname "$file"))/package.json"
done

echo "All package.json files updated with @freeword/meta version $FWVER"