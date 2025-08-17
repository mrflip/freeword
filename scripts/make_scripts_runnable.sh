#!/bin/bash
MAINDIR=$(realpath $(dirname $0)/..)
shopt -s nullglob
chmod -v a+x $MAINDIR/*/*/scripts/*-*.{sh,ts,js,py,rb} $MAINDIR/scripts/*-*.{sh,ts,js,py,rb}
shopt -u nullglob
