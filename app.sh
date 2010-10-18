#!/bin/sh

. ../scripts/envsetup.sh
export CSS_WORKING_DIR="./"
$RUN_DEBUG$BIN_HOME/css $*
