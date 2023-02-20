import { IReporterConfiguration } from "./src";

export const configuration: Partial<IReporterConfiguration> = {
    ignore: [`${__dirname}/test/**`],
    overrides: [
        {
            name: "exit",
            licenseName: "MIT",
        },
    ],
};
