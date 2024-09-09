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

Or if the configuration is in a different directory you can specify the path like that:

```bash
license-reporter --config /different/path/to/the/config.ts
```

# Configuration

By default, the tool will search for a license-reporter.config.ts adjacent to the node_modules folder. If no
configuration is found, default settings will be used. It is important, that the configuration file exports a field
named "configuration". With Typescript the configuration could look like this:

```typescript
import { IReporterConfiguration, SearchMode } from "@weichwarenprojekt/license-reporter";

export const configuration: Partial<IReporterConfiguration> = {
    addFolder: ["package_folder_other_than_node_modules"], // default: []
    defaultLicenseText: "", // default: "No license text found."
    force: true, // default: false
    ignore: ["test"], // default: []
    ignoreMissingUrl: true, // default: false
    output: "output.json", // default: "./3rdpartylicenses.json"
    overrides: [
        {
            name: "new-package",
            url: "https://new-package.de",
            licenseName: "MIT",
            licenseText: "LICENSE text for new-package",
        },
    ], // default: []
    root: "/path/to/root", // default: process.cwd()
    search: SearchMode.flat, // default: SearchMode.recursive
};
```

For CommonJS modules you would use **module.exports.configuration** instead of **export const configuration**

| Config             | Description                                                                                                                    |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------|
| addFolder          | Adds a folder that contain packages. Useful if libraries are in a folder that isn't named "node_modules".                      |
| defaultLicenseText | The default license text that is used if the tool can't find a license text for a package.                                     |
| force              | If true, license-reporter will ignore missing dependencies and exit with 0 anyways.                                            |
| ignore             | Ignores the given paths when searching for packages.                                                                           |
| ignoreMissingUrl   | If true, license-reporter will not fail and warn you because of missing urls.                                                  |
| output             | The path of the output file.                                                                                                   |
| overrides          | A list of packages that can be used to complete missing information or to add new packages to the output list.                 |
| root               | The path to the root directory.                                                                                                |
| search             | The search mode. Can be "flat" or "search". When set to "flat", license-reporter will only analyze the top-level node_modules. |

Every option is also available using the cli directly, but license-reporter will always take options set in the
configuration over options given as CLI arguments.

# Output

By default, the tool generates a 3rdpartylicenses.json in the root directory. The output will look something like the
following:

```json
[
    {
        "name": "new-package",
        "url": "https://new-package.de",
        "licenseName": "MIT",
        "licenseText": "LICENSE text for new-package",
        "version": "1.0.0"
    }
]
```

# Yarn Workspaces

If you are using yarn (3) workspaces and your workspace includes a server or some package that you would want to hide from
license report, you can add the following option to the package's package.json:

```json
{
    "installConfig": {
        "hoistingLimits": "workspaces"
    }
}
```

This will cause yarn to install all the dependencies that belong to this package into the package's directory. Now you
can add the package directory to the ignore list in your license-reporter configuration and the dependencies will not
be listed.

# How does it work?

The logic is rather simple. The tool searches for every package.json that is placed somewhere in the node_modules folder.
Packages that are inside other packages will be filtered out. For every identified package.json the tool extracts the
name, the license name, the homepage/url and the license text from adjacent LICENSE or COPYING files. Depending on the
configuration of the tool, it will then proceed to inform you, if the information for a package is incomplete.
