#!/usr/bin/env bash

watchman watch-del-all 1>/dev/null

rm -rf node_modules 1>/dev/null
rm -rf $TMPDIR/react-packager-* 1>/dev/null
rm -rf ios/build 1>/dev/null
rm -rf ios/Pod 1>/dev/null

npm cache clear --force -s 1>/dev/null
npm cache verify 1>/dev/null
