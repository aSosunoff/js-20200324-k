#!/usr/bin/env bash

message="new commit"

if [ -n "$1" ]; then
    message="$1"
fi

git add . && git commit -m "$message" && git push