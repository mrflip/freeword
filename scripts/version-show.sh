#!/bin/bash
SCRIPTDIR="$(realpath $(dirname $0))"
MAINDIR="$(realpath $(dirname $SCRIPTDIR))"

cd $MAINDIR
egrep 1>&2 '("version"|"@freeword/.*":.*([0-9].[0-9].[0-9]|workspace))' package.json */package.json */*/package.json || true
