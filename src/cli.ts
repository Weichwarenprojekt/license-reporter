import { Command } from "commander";
import { reportLicenses } from "./reporter";
import { getDefaultConfiguration } from "./configuration";
import packageJson from "../package.json";

const program = new Command();

/**
 * Executes the cli
 * @param args The arguments for the cli
 */
export async function cli(args: string[]): Promise<void> {
    const defaultConfiguration = getDefaultConfiguration();
    await program
        .version(packageJson.version)
        .description(packageJson.description)
        .action(reportLicenses)
        .option("--config <value>", "The path to the configuration file.", defaultConfiguration.config)
        .option(
            "--defaultLicenseText <value>",
            "The default license text that is used if the tool can't find a license text for a package.",
            defaultConfiguration.defaultLicenseText,
        )
        .option("--force", "Forces a good exit.", defaultConfiguration.force)
        .option(
            "--ignoreMissingUrl",
            "If true, license-reporter will not fail and warn you because of missing urls.",
            defaultConfiguration.ignoreMissingUrl,
        )
        .option("--output <value>", "The path to the output file.", defaultConfiguration.output)
        .option("--root <value>", "The path to the root directory.", defaultConfiguration.root)
        .option("--search <value>", 'The search mode. Can be "flat" or "recursive".', defaultConfiguration.search)
        .parseAsync(args);
}
