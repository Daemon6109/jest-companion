#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

bash "$SCRIPT_DIR/setup.sh"

rm -rf dist
echo "Generating sourcemap..."
rojo sourcemap default.project.json -o sourcemap.json
darklua process -c .darklua.json src/ dist/src
echo "Publishing with rojo..."
rojo upload build.project.json --api_key "$ROBLOX_API_KEY" --universe_id "$ROBLOX_UNIVERSE_ID" --asset_id "$ROBLOX_PLACE_ID"
echo "Cleaning up..."
rm -rf dist
