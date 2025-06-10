[marketplace-shield]: https://img.shields.io/visual-studio-marketplace/d/daemon6109.testez-companion
[marketplace-url]: https://marketplace.visualstudio.com/items?itemName=daemon6109.testez-companion
[license-shield]: https://img.shields.io/github/license/daemon6109/testez-companion
[license-url]: https://github.com/daemon6109/testez-companion/blob/master/LICENSE.md

<img align="right" src="https://user-images.githubusercontent.com/39647014/116725501-a2944700-a9ea-11eb-80ce-f5699b0c6568.png"/>

# Jest-Lua Companion

[![License][license-shield]][license-url]
[![Visual Studio Marketplace][marketplace-shield]][marketplace-url]

Run [Jest-Lua](https://github.com/Roblox/jest-lua) tests via OpenCloud and view their results right from VS Code.

-   Configure your OpenCloud credentials in a `.env` file
-   Make a `jest-lua-companion.toml` file to configure how Jest-Lua should behave:

    ```toml
    # These are the locations of your test files (descendants are searched too)
    roots = ["src/tests", "tests"]

    [extraOptions]
    # Optional: Jest-Lua specific options can be added here
    # showTimingInfo = true
    # testNamePattern = ".*"
    ```

-   Set up your `.env` file with OpenCloud credentials:
    ```env
    ROBLOX_API_KEY=your_opencloud_api_key_here
    ROBLOX_UNIVERSE_ID=your_universe_id
    ROBLOX_PLACE_ID=your_place_id
    ```

-   Sync your scripts into your place with [Rojo](https://rojo.space/)
-   Run the tests by pressing the Run button, the command, <kbd>Ctrl</kbd><kbd>;</kbd>, or by enabling the `runTestsOnSave` setting.
-   See the results!

_You can also right click on failing "it" blocks to output their errors._

To see the console logs and errors of your tests, open the Output tab in the terminal view (opened by default with <kbd>Ctrl</kbd><kbd>`</kbd>), and select Jest-Lua Companion's output.

![](https://user-images.githubusercontent.com/39647014/115806038-bdfdc180-a3ee-11eb-9c7c-f85b4491a8bc.png)
