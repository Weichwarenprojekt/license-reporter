<div align="center">
    <br>
    <img src="assets/logo.png" width="550" alt=""/>
</div>

# Quickstart

License Reporter analyzes your node_modules and provides you with a list of your dependencies containing the licenses of
each package. The output is a JSON file. This file could then be used for rendering an HTML list.

**Installation**

```
npm i --save-dev @weichwarenprojekt/license-reporter
```

**Execution**

```bash
license-reporter
```

# Configuration

By default, the tool will search for a license-reporter.config.ts (or .js) adjacent to the node_modules folder. If no
configuration is found, default settings will be used. It is important, that the configuration file exports a field
named "configuration". With Typescript the configuration could look like this:

```ts
import { IReporterConfiguration, SearchMode } from "./src/configuration";

export const configuration: Partial<IReporterConfiguration> = {
    force: false,
    ignore: undefined,
    output: `./3rdpartylicenses.json`,
    overrides: [
        {
            name: "new-package",
            url: "https://new-package.de",
            licenseName: "MIT",
            licenseText: "LICENSE text for new-package",
        },
    ],
    root: process.cwd(),
    search: SearchMode.recursive,
};
```

For CommonJS modules you would use **module.exports.configuration** instead of **export const configuration**

| Config    | Description                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| force     | If true, license-reporter will ignore missing dependencies and exit with 0 anyways.                                            |
| ignore    | Ignores the given paths when searching for packages.                                                                           |
| output    | The path of the output file.                                                                                                   |
| overrides | A list of packages that can be used to complete missing information or to add new packages to the output list.                 |
| root      | The path to the root directory.                                                                                                |
| search    | The search mode. Can be "flat" or "search". When set to "flat", license-reporter will only analyze the top-level node_modules. |

# Output

By default the tool generates a 3rdpartylicenses.json in the root directory. The output will look something like the
following:

```json
[
    {
        "name": "new-package",
        "url": "https://new-package.de",
        "licenseName": "MIT",
        "licenseText": "LICENSE text for new-package"
    }
]
```
