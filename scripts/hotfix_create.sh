#!/usr/bash

git checkout master
major=$(gitversion /showvariable Major)
minor=$(gitversion /showvariable Minor)
patch=$(gitversion /showvariable Patch)
nextPatch=$(($patch+1))
hotfixVersion=$major.$minor.$nextPatch

echo $major
echo $minor
echo $patch
echo $nextPatch
echo $hotfixVersion

git checkout master && git pull && git flow hotfix start $hotfixVersion && git flow hotfix publish $hotfixVersion
