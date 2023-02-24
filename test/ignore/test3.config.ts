import { IReporterConfiguration } from "../../src";
import * as path from "path";

export const configuration: Partial<IReporterConfiguration> = {
    ignore: [path.resolve(__dirname, "test", "node_modules", "second")],
};
