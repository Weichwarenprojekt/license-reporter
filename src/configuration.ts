import { OptionValues } from "commander";
import path from "path";

/**
 * The parameters that can be configured within the configuration file
 */
export interface IReporterConfiguration {
    /** True if nested node_modules shall be included as well */
    recursive: boolean;
    /** The path to the root directory */
    root: string;
    /** The path to the output file */
    output: string;
}

/**
 * The parameters of the cli
 */
export interface IReporterCliConfiguration extends IReporterConfiguration {
    /** The path to the configuration file */
    config: string;
}

/**
 * The default configuration
 */
export const defaultConfiguration: IReporterCliConfiguration = {
    config: `${process.cwd()}/license-reporter.config`,
    recursive: true,
    root: process.cwd(),
    output: `${process.cwd()}/3rdpartylicenses.json`,
};

/**
 * Loads the configuration file
 * @param options The configuration parameters that were collected by commander
 */
export async function loadConfiguration(options: OptionValues): Promise<IReporterConfiguration> {
    const cliConfig = Object.assign(defaultConfiguration, options);
    try {
        let configPath = cliConfig.config;
        if (!path.isAbsolute(cliConfig.config)) configPath = path.resolve(cliConfig.root, cliConfig.config);
        const configImport = await import(configPath);
        return Object.assign(cliConfig, configImport.default);
    } catch (e) {
        console.error("Error while loading the configuration file!");
        throw e;
    }
}
