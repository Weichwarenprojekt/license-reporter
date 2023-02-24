import { IReporterConfiguration } from "../../src";
import * as path from "path";

export const configuration: Partial<IReporterConfiguration> = {
    addFolder: [path.resolve(__dirname, "test"), path.resolve(__dirname, "test2")],
};
