#!/bin/bash

SCRIPTDIR=$(realpath "$(dirname "$0")")
ROOTDIR=$(realpath "$SCRIPTDIR/..")

cd "$ROOTDIR"

shopt -s nullglob
rm -rf .tsbuildinfo* built meta/built mungers/*/built repos/*/built
shopt -u nullglob