#!/bin/bash

prev_version=$(git tag --list --sort=creatordate | grep -E ^v[0-9]+.[0-9]+.[0-9]+$ | tail -n 1)
current_version="HEAD"
changelog_path=$1
current_branch=$(git rev-parse --abbrev-ref HEAD)
current_version_number=v${current_branch##*/}

current_version_ts=$(git log -1 --format=%at $current_version)
if date -d @0 >/dev/null 2>&1; then
  current_version_date=$(TZ=UTC0 date -d @$current_version_ts  +"%m-%d-%Y %H:%M")s
else
  current_version_date=$(TZ=UTC0 date -r $current_version_ts +"%m-%d-%Y %H:%M")
fi

echo $prev_version
echo $current_version
echo $changelog_path
echo $current_branch
echo $current_version_number
echo $current_version_ts
echo $current_version_date

perl -i -pe 's|</h1>|</h1>\n<hr/> <h3>'"$current_version_number"' ('"$current_version_date"')</h3>|' "$changelog_path"


git log "$prev_version".."$current_version" --pretty=format:%s |
sed -n 's/.*\(CON-[0-9][0-9]*\).*/\1/p' |
sort -u |
while read -r issue_code ; do
    issue_api_url="https://advanticsys.atlassian.net/rest/api/2/issue/$issue_code"
    issue_url="https://advanticsys.atlassian.net/browse/$issue_code"
    token="bG9yZW56by5icnV0dGlAYWR2YW50aWNzeXMuY29tOk5hTzZQcWF3ZzlPTHhUWjhHZ01BQUU0Mg=="
    content=$(curl -s -X GET -H "Authorization: Basic $token" -H "Content-Type: application/json"  $issue_api_url)
    summary=$( jq -r  '.fields.summary' <<< "${content}" )
    sed "/<h3>$current_version_number ($current_version_date)<\/h3>/a\\
    <li><a href='$issue_url'>$issue_code</a> : $summary </li>" "$changelog_path" > "$changelog_path.tmp" \
    && mv "$changelog_path.tmp" "$changelog_path"
done

echo "changelog updated, please commit changes"
