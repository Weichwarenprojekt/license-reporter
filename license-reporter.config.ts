import { IReporterConfiguration } from "./src";

export const configuration: Partial<IReporterConfiguration> = {
    ignore: ["test"],
    overrides: [
        {
            name: "exit",
            licenseName: "MIT",
        },
    ],
};
