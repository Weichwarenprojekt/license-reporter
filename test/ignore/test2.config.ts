import { IReporterConfiguration } from "../../src/configuration";

export const configuration: Partial<IReporterConfiguration> = {
    ignore: [`${__dirname}/node_modules/**`, `${__dirname}/test/**`],
};
