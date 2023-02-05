import { IReporterConfiguration } from "../../src/configuration";

export const configuration: Partial<IReporterConfiguration> = {
    overrides: [
        {
            name: "another-incomplete-package",
            url: "https://another-incomplete-package.de",
        },
        {
            name: "incomplete-package",
            licenseName: "MIT",
            licenseText: "LICENSE for incomplete-package",
        },
        {
            name: "another-package",
            url: "https://another-package.de",
            licenseName: "ANOTHER",
            licenseText: "LICENSE for another-package",
        },
    ],
};
