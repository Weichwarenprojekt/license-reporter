import { IReporterConfiguration } from "../../src";

export const configuration: Partial<IReporterConfiguration> = {
    overrides: [
        {
            name: "incomplete-package",
            licenseName: "MIT",
            licenseText: "LICENSE for incomplete-package",
            version: "1.0.0",
        },
    ],
};
