#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Get the parent directory (scripts folder)
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

bash "$SCRIPT_DIR/setup.sh"

source ../.env
rm -rf dist
rojo sourcemap default.project.json -o sourcemap.json
echo "Processing with darklua..."
darklua process -c .darklua.json src/ dist/src
darklua process -c .darklua.json ../common/src/ dist/common
darklua process -c .darklua.json tests/ dist/tests
darklua process -c .darklua.json ../common/tests/ dist/tests
darklua process -c .darklua.json stories/ dist/stories
darklua process -c .darklua.json tasks/run-tests.server.luau dist/run-tests.server.luau
echo "Building with rojo..."
rojo build dev.project.json -o dist.rbxl
echo "Uploading to Roblox..."
if command -v python3 &>/dev/null; then
    python3 "$PARENT_DIR/python/upload_and_run_task.py" dist.rbxl dist/run-tests.server.luau
else
    python "$PARENT_DIR/python/upload_and_run_task.py" dist.rbxl dist/run-tests.server.luau
fi
echo "Cleaning up..."
rm dist.rbxl
rm -rf dist