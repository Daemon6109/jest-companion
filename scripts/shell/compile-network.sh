#!/bin/bash

set -e

# Get the current workspace folder name
WORKSPACE_NAME=$(basename "$PWD")

blink "${WORKSPACE_NAME}.blink" --yes
