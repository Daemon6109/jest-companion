# Example Jest-Lua Companion Project Setup

This directory shows how to set up a Jest-Lua project with the companion extension.

## Files you need:

### 1. `.env` (Copy from .env.example)
```env
ROBLOX_API_KEY=your_opencloud_api_key_here
ROBLOX_UNIVERSE_ID=12345678
ROBLOX_PLACE_ID=87654321
```

### 2. `jest-lua-companion.toml`
```toml
roots = ["src/tests", "tests"]

[extraOptions]
showTimingInfo = true
```

### 3. Test execution script at `scripts/shell/test.sh`
This should build your project and run tests via OpenCloud.

### 4. OpenCloud Python scripts at `scripts/python/`
- `luau_execution_task.py` - Handles OpenCloud task execution
- `upload_and_run_task.py` - Uploads and runs your place

## How to use:

1. Install the Jest-Lua Companion VS Code extension
2. Copy the configuration files and fill in your details
3. Press Ctrl+; (or Cmd+; on Mac) to run tests
4. View results in the Jest-Lua Companion panel

## Features:

- ✅ Run tests via OpenCloud (no Studio plugin needed)
- ✅ View test results in VS Code
- ✅ Auto-run tests on file save (optional)
- ✅ Detailed error reporting
- ✅ Organized test explorer view
