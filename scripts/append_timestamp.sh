#!/bin/bash
# append_timestamp.sh
# Appends a current timestamp as a query string to each <script src="..."> in index.html

FILE=$1
TIMESTAMP=$(date +%s)

# Use portable sed syntax (works on macOS and Linux)
# Only target <script> tags with .js sources
sed -i.bak -E "/<script[^>]+src=\"[^\"]+\.js\"/ s|(src=\"[^\"]+)(\.js)(\")|\1\2?t=${TIMESTAMP}\3|g" "$FILE"

# Remove the backup file if successful
rm -f "${FILE}.bak"

echo "Timestamp ?t=${TIMESTAMP} appended to all <script src> URLs in $FILE"
