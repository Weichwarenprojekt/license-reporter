import { IReporterConfiguration } from "../../src/configuration";

export const configuration: Partial<IReporterConfiguration> = {
    overrides: [{
        name: "incomplete-package",
        url: "https://complete-package.de",
        licenseName: "MIT",
        licenseText: "LICENSE for incomplete-package"
    }],
};
