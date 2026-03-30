#!/bin/bash

SCRIPTDIR=$(realpath "$(dirname "$0")")
MAINDIR=$(realpath "$SCRIPTDIR/..")

cd "$MAINDIR"

shopt -s nullglob
rm -rf .tsbuildinfo* built meta/built mungers/*/built repos/*/built
shopt -u nullglob