#!/bin/bash

prev_version=$(git tag --list --sort=creatordate | grep -E ^v[0-9]+.[0-9]+.[0-9]+$ | tail -n 1)
current_version="HEAD"
changelog_path=$1
current_branch=$(git rev-parse --abbrev-ref HEAD)
current_version_number=v${current_branch##*/}

current_version_ts=$(git log -1 --format=%at $current_version)
current_version_date=$(TZ=UTC0 date -d @$current_version_ts  +"%m-%d-%Y %H:%M")
sed -i "/<\/h1>/a <hr/> <h3>$current_version_number ($current_version_date)<\/h3>" $changelog_path
git log "$prev_version".."$current_version" --pretty=format:%s | grep -oP CON-[0-9]+ | sort --unique | 
while read -r issue_code ; do
    issue_api_url="https://lbrutti.atlassian.net/rest/api/2/issue/$issue_code"
    issue_url="https://lbrutti.atlassian.net/browse/$issue_code"
    token="PRDxCnzMFJt6OaZS3CvL6F9B"
    content=$(curl -s -X GET -H "Authorization: Basic $token" -H "Content-Type: application/json"  $issue_api_url)
    summary=$( jq -r  '.fields.summary' <<< "${content}" ) 
    sed -i "/<h3>$current_version_number ($current_version_date)<\/h3>/a <li><a href='$issue_url'>$issue_code</a> : $summary </li>" $changelog_path 
done

echo "changelog updated, please commit changes"
