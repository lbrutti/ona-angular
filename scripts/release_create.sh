#!/usr/bash
git checkout dev
major=$(gitversion /showvariable Major)
minor=$(gitversion /showvariable Minor)
nextMinor=$minor
releaseVersion=$major.$nextMinor.0

echo current major = $major
echo current minor = $minor
echo next releaseVersion = $releaseVersion


#git fetch --all -p && git checkout dev && git pull && git flow release start $releaseVersion && git flow release publish $releaseVersion
