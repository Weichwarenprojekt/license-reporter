import { IReporterConfiguration } from "../../src/configuration";

/**
 * Export "config" instead of "configuration"
 */
export const config: Partial<IReporterConfiguration> = {
    output: "wrongConfig.json",
};
