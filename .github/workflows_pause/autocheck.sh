#!/bin/bash
git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"

function compare_version() {
    test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"
}

RELEASE_TAG=$(curl -s https://raw.githubusercontent.com/winw1010/tataru-assistant/main/package.json | jq -r .version)
PUBLISHED_TAG=$(curl -s https://api.github.com/repos/winw1010/tataru-assistant/releases | jq -r '.[] | .tag_name' | head -n 1|sed 's/v//g')

echo "上游版本: ${RELEASE_TAG}"
echo "发布版本: ${PUBLISHED_TAG}"

if [ "${PUBLISHED_TAG}" == "" ] || compare_version ${RELEASE_TAG} ${PUBLISHED_TAG}
then
   echo "release_tag=${RELEASE_TAG}" >> $GITHUB_OUTPUT
   echo "status=ready" >> $GITHUB_OUTPUT
fi