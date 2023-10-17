#!/usr/bash
branchname=$(git rev-parse --abbrev-ref HEAD)
version=${branchname#"release/"} 
npm version $version --no-git-tag-version
git commit -am "[skip ci] bump version"

echo ""
echo ""
echo "Version updated in package json. Updated the changelog now, the finish the release"

exit 0