import { IReporterConfiguration } from "../../src";
import * as path from "path";

export const configuration: Partial<IReporterConfiguration> = {
    // One absolute path that ends with slash and one absolute path that does not end with a slash
    ignore: [`${path.resolve(__dirname, "node_modules")}/`, path.resolve(__dirname, "test")],
};
