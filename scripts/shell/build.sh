#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Run setup script from the same directory
bash "$SCRIPT_DIR/setup.sh"

PROJECT_NAME=$(basename "$(pwd)")

rm -rf dist
echo "Generating sourcemap..."
rojo sourcemap default.project.json -o sourcemap.json
darklua process -c .darklua.json src/ dist/src
darklua process -c .darklua.json ../common/src/ dist/common
echo "Building with rojo..."
rojo build build.project.json -o "$PROJECT_NAME.rbxl"; # Cross-platform file open
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$PROJECT_NAME.rbxl"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "$PROJECT_NAME.rbxl"
fi
echo "Cleaning up..."
rm -rf dist
