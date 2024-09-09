import { IReporterConfiguration } from "../../src/configuration";

export const configuration: Partial<IReporterConfiguration> = {
    overrides: [
        {
            name: "another-incomplete-package",
            url: "https://another-incomplete-package.de",
            version: "1.0.0"
        },
        {
            name: "incomplete-package",
            licenseName: "MIT",
            licenseText: "LICENSE for incomplete-package",
            version: "1.0.0"
        },
        {
            name: "",
            licenseText: "Override without a name is ignored",
            version: "1.0.0"
        },
        {
            licenseText: "Override without a name is ignored",
            version: "1.0.0"
        },
        {
            licenseText: "Override without a name is ignored",
        },
    ],
};
