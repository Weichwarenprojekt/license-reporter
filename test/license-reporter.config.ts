import { IReporterConfiguration } from "../src/configuration";

export const configuration: Partial<IReporterConfiguration> = {
    recursive: true,
    overrides: [
        {
            name: "natural-compares",
            licenseText: "",
        },
    ],
};
