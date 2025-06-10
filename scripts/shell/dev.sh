#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

bash "$SCRIPT_DIR/setup.sh"

rm -rf dist

# First run all commands without watch to complete initial processing
echo "Running initial processing..."
rojo sourcemap default.project.json -o sourcemap.json
darklua process -c .darklua.json src/ dist/src
darklua process -c .darklua.json ../common/src/ dist/common

# Start rojo serve after initial processing is complete
echo "Starting Rojo server..."
rojo serve build.project.json &
SERVER_PID=$!

echo "Starting file watchers..."
# Get the current workspace name and use the appropriate blink file
WORKSPACE_NAME=$(basename "$PWD")
# Now start all watch processes
blink "${WORKSPACE_NAME}.blink" --watch &
PID1=$!
rojo sourcemap default.project.json -o sourcemap.json --watch &
PID2=$!
darklua process -c .darklua.json --watch src/ dist/src &
PID3=$!

# Wait for all background processes
wait $SERVER_PID $PID1 $PID2 $PID3
