#!/usr/bash
branchname=$(git rev-parse --abbrev-ref HEAD)
version=${branchname#"hotfix/"} 
npm version $version --no-git-tag-version

npm run changelog:update

echo "Version bumped in package.json and changelog updated, review both"
echo "then run:"
echo "git flow hotifx finish $version"
exit 0
