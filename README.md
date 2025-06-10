# Jest-Lua Companion

[![License][license-shield]][license-url]

Jest-Lua Companion is a Visual Studio Code extension that enables Roblox developers to run their [Jest-Lua](https://github.com/Roblox/jest-lua) tests via OpenCloud and preview the results inside VS Code.

## Setup

### 1. Configure OpenCloud Credentials

Create a `.env` file in your workspace root with your OpenCloud credentials:

```env
ROBLOX_API_KEY=your_opencloud_api_key_here
ROBLOX_UNIVERSE_ID=12345678
ROBLOX_PLACE_ID=87654321
```

### 2. Configure Test Roots

Create a `jest-lua-companion.toml` file to specify where your tests are located:

```toml
# These are the locations of your test files (descendants are searched too)
roots = ["src/tests", "tests"]

[extraOptions]
# Optional: Jest-Lua specific options can be added here
# showTimingInfo = true
# testNamePattern = ".*"
```

### 3. Test Script Structure

The extension expects your project to have the following structure:
- `scripts/shell/test.sh` - Your test execution script
- `scripts/python/` - Python scripts for OpenCloud integration
- Your Lua/Luau test files in the locations specified in `roots`

### 4. Running Tests

- Use the **Run tests** command from the Command Palette
- Press `Ctrl+;` (or `Cmd+;` on macOS)
- Click the play button in the Jest-Lua Companion view
- Enable `runTestsOnSave` to automatically run tests when files change

## Features

- **OpenCloud Integration**: Run tests directly via Roblox OpenCloud APIs
- **No Studio Plugin Required**: All test execution happens through OpenCloud
- **Test Explorer**: View passing, failing, and skipped tests in organized tree views
- **Error Details**: Click on failing tests to see detailed error information
- **Auto-run on Save**: Optionally run tests automatically when files change

## Requirements

- [Roblox OpenCloud API Key](https://create.roblox.com/docs/cloud/open-cloud)
- Python with the necessary dependencies for OpenCloud scripts
- Bash shell for running test scripts

## Extension Structure

- `extension/` - The VS Code extension source code
- `scripts/` - Test execution scripts and OpenCloud integration
- `jest-lua-companion.toml.example` - Example configuration file
- `.env.example` - Example environment variables file

[license-shield]: https://img.shields.io/github/license/daemon6109/jest-companion.svg?style=flat-square
[license-url]: https://github.com/daemon6109/jest-companion/blob/master/LICENSE
