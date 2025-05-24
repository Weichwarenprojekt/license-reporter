import { IReporterConfiguration } from "../../src";

export const configuration: Partial<IReporterConfiguration> = {
    overrides: [
        {
            name: "another-incomplete-package",
            url: "https://another-incomplete-package.de",
        },
        {
            name: "incomplete-package",
            url: "https://complete-package.de",
            licenseName: "MIT",
            licenseText: "LICENSE for incomplete-package",
            version: "1.0.0",
        },
    ],
};
