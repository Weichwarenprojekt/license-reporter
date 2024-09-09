import { OptionValues } from "commander";
import path from "path";
import { loadModule } from "@weichwarenprojekt/ts-importer";
import { replaceBackslashes } from "./util";
import chalk from "chalk";

/**
 * The possible search modes
 */
export enum SearchMode {
    /** Also searches in subdirectories */
    recursive = "recursive",
    /** Only searches in the root directory */
    flat = "flat",
}

/**
 * The package information for a single package
 */
export interface IPackageInfo {
    /** The name of the package */
    name: string;
    /** The url to the homepage/repo of the package */
    url: string;
    /** The name of the license */
    licenseName: string;
    /** The license text */
    licenseText: string;
    /** The package version */
    version: string;
}

/**
 * The parameters that can be configured within the configuration file
 */
export interface IReporterConfiguration {
    /** Add a folder that contains packages. Useful if libraries are in a folder that isn't named "node_modules". */
    addFolder: string[];
    /** The default license text that is used if the tool can't find a license text for a package */
    defaultLicenseText: string;
    /** Forces a good exit. */
    force: boolean;
    /** Ignores the given paths when searching for packages */
    ignore: string[];
    /** If true, license-reporter will not fail and warn you because of missing urls */
    ignoreMissingUrl: boolean;
    /** The path to the output file */
    output: string;
    /** The overrides for single packages */
    overrides: Partial<IPackageInfo>[];
    /** The path to the root directory */
    root: string;
    /** The search mode. Can be "flat" or "recursive" */
    search: SearchMode;
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
    addFolder: [],
    config: `./license-reporter.config.ts`,
    defaultLicenseText: "No license text found.",
    force: false,
    ignore: [],
    ignoreMissingUrl: false,
    output: `./3rdpartylicenses.json`,
    overrides: [],
    root: process.cwd(),
    search: SearchMode.recursive,
};

/**
 * Loads the configuration file
 * @param options The configuration parameters that were collected by commander
 */
export async function loadConfiguration(options: OptionValues): Promise<IReporterConfiguration> {
    let cliConfig = Object.assign(defaultConfiguration, options);
    try {
        let configPath = cliConfig.config;
        if (!path.isAbsolute(configPath)) configPath = path.resolve(cliConfig.root, configPath);
        const configImport = loadModule<{ configuration: IReporterConfiguration }>(configPath);
        if (!configImport.configuration) console.warn('The specified configuration does not export a "configuration"');
        cliConfig = Object.assign(cliConfig, configImport.configuration);
    } catch (e) {
        console.warn(chalk.yellow("Could not find a configuration file!"));
    }
    return prepareConfiguration(cliConfig);
}

/**
 * Prepares the configuration
 * @param config
 */
function prepareConfiguration(config: IReporterConfiguration): IReporterConfiguration {
    // Ensure that the root & output path is absolute
    if (!path.isAbsolute(config.root)) config.root = path.resolve(process.cwd(), config.root);
    config.root = replaceBackslashes(config.root);
    if (!path.isAbsolute(config.output)) config.output = path.resolve(config.root, config.output);
    config.output = replaceBackslashes(config.output);
    // Ensure that all ignore paths are absolute and that backslashes are replaced and that the path ends with a slash
    config.ignore = config.ignore.map((folder) => {
        const ignorePath = replaceBackslashes(path.isAbsolute(folder) ? folder : path.resolve(config.root, folder));
        return ignorePath.endsWith("/") ? ignorePath : `${ignorePath}/`;
    });
    // Ensure that all added directories are absolute and that backslashes are replaced
    config.addFolder = config.addFolder.map((folder) => {
        return replaceBackslashes(path.isAbsolute(folder) ? folder : path.resolve(config.root, folder));
    });
    return config;
}
