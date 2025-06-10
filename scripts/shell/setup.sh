#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

bash "$SCRIPT_DIR/install-tools.sh"
bash "$SCRIPT_DIR/install-packages.sh"
bash "$SCRIPT_DIR/compile-network.sh"