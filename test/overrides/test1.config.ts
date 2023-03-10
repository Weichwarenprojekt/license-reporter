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
            name: "",
            licenseText: "Override without a name is ignored",
        },
        {
            licenseText: "Override without a name is ignored",
        },
    ],
};
